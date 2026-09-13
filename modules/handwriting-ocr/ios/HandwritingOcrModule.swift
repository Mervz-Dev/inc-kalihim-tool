import CoreImage
import CoreImage.CIFilterBuiltins
import ExpoModulesCore
import UIKit
import Vision
import VisionKit

/// Normalized rectangle, origin top-left, as used on the JS side.
struct OcrBoxRecord: Record {
  @Field var x: Double = 0
  @Field var y: Double = 0
  @Field var width: Double = 0
  @Field var height: Double = 0
}

struct RecognizeOptionsRecord: Record {
  @Field var regionOfInterest: OcrBoxRecord? = nil
  @Field var languageCorrection: Bool = false
  @Field var customWords: [String] = []
  @Field var enhance: Bool = false
}

final class ImageLoadException: GenericException<String> {
  override var reason: String {
    "Could not load the image at \(param)"
  }
}

final class RecognitionException: GenericException<String> {
  override var reason: String {
    "Text recognition failed: \(param)"
  }
}

final class ScanException: GenericException<String> {
  override var reason: String {
    "Document scan failed: \(param)"
  }
}

final class NoViewControllerException: Exception {
  override var reason: String {
    "There is no screen to present the document scanner from"
  }
}

/// Photos larger than this are downscaled first; Vision gains nothing from
/// 12 MP on a sheet of paper and takes several times longer.
private let maxImageSide: CGFloat = 3000

/**
 On-device handwriting recognition with Apple Vision.

 Nothing here touches the network: Vision ships with iOS and runs entirely on
 the device, which is what the app promises its users.
 */
public class HandwritingOcrModule: Module {
  /// Kept alive while Apple's scanner is on screen; it owns the JS promise.
  private var scanDelegate: DocumentScanDelegate?

  public func definition() -> ModuleDefinition {
    Name("HandwritingOcr")

    Constant("isSupported") { true }

    Constant("isDocumentScannerSupported") { VNDocumentCameraViewController.isSupported }

    /**
     Opens Apple's document scanner. It finds the sheet, waits for a steady,
     focused frame, captures on its own, flattens the perspective and cleans
     the image -- all before we ever read it. Resolves with a file URL of the
     first page, or null when the user cancels.
     */
    AsyncFunction("scanDocument") { (promise: Promise) in
      guard let presenter = self.appContext?.utilities?.currentViewController() else {
        promise.reject(NoViewControllerException())
        return
      }

      let controller = VNDocumentCameraViewController()
      let delegate = DocumentScanDelegate(promise: promise) { [weak self] in
        self?.scanDelegate = nil
      }
      self.scanDelegate = delegate
      controller.delegate = delegate
      presenter.present(controller, animated: true)
    }.runOnQueue(.main)

    AsyncFunction("recognizeText") { (url: URL, options: RecognizeOptionsRecord?) -> [String: Any] in
      let image = try self.loadImage(at: url, enhance: options?.enhance ?? false)
      let request = self.makeRequest(options: options, region: options?.regionOfInterest)
      try self.perform([request], on: image)
      return self.result(for: request, image: image)
    }

    AsyncFunction("recognizeCells") { (url: URL, cells: [OcrBoxRecord], options: RecognizeOptionsRecord?) -> [[String: Any]] in
      let image = try self.loadImage(at: url, enhance: options?.enhance ?? false)
      let requests = cells.map { self.makeRequest(options: options, region: $0) }
      try self.perform(requests, on: image)
      return requests.map { self.result(for: $0, image: image) }
    }
  }

  // MARK: - Image loading

  private struct LoadedImage {
    let cgImage: CGImage
    let width: Int
    let height: Int
  }

  private func loadImage(at url: URL, enhance: Bool) throws -> LoadedImage {
    guard let original = UIImage(contentsOfFile: url.path) else {
      throw ImageLoadException(url.path)
    }

    // Redrawing bakes the EXIF orientation into the pixels, so the boxes we
    // return are always relative to the upright photo, and downscales in the
    // same step.
    let longest = max(original.size.width, original.size.height)
    let scale = min(1, maxImageSide / max(longest, 1))
    let targetSize = CGSize(
      width: (original.size.width * scale).rounded(),
      height: (original.size.height * scale).rounded()
    )

    let format = UIGraphicsImageRendererFormat.default()
    format.scale = 1
    let upright = UIGraphicsImageRenderer(size: targetSize, format: format).image { _ in
      original.draw(in: CGRect(origin: .zero, size: targetSize))
    }

    guard var cgImage = upright.cgImage else {
      throw ImageLoadException(url.path)
    }

    if enhance, let enhanced = self.enhance(cgImage) {
      cgImage = enhanced
    }

    return LoadedImage(cgImage: cgImage, width: cgImage.width, height: cgImage.height)
  }

  /// Grayscale, a little more contrast, a little sharper: faint ballpen on
  /// white paper reads better; already-clean photos are left to the caller.
  private func enhance(_ cgImage: CGImage) -> CGImage? {
    let context = CIContext(options: nil)
    let input = CIImage(cgImage: cgImage)

    let color = CIFilter.colorControls()
    color.inputImage = input
    color.saturation = 0
    color.contrast = 1.25
    color.brightness = 0.02

    let sharpen = CIFilter.sharpenLuminance()
    sharpen.inputImage = color.outputImage
    sharpen.sharpness = 0.4

    guard let output = sharpen.outputImage else { return nil }
    return context.createCGImage(output, from: input.extent)
  }

  // MARK: - Recognition

  private func makeRequest(options: RecognizeOptionsRecord?, region: OcrBoxRecord?) -> VNRecognizeTextRequest {
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.recognitionLanguages = ["en-US"]

    // Correction pulls Tagalog and abbreviations such as "UWP" toward English
    // words; it is only useful when we also hand it our own vocabulary.
    let correction = options?.languageCorrection ?? false
    request.usesLanguageCorrection = correction
    if correction, let words = options?.customWords, !words.isEmpty {
      request.customWords = words
    }

    if #available(iOS 16.0, *) {
      request.revision = VNRecognizeTextRequestRevision3
      request.automaticallyDetectsLanguage = false
    }

    if let region {
      request.regionOfInterest = visionRect(from: region)
    }

    return request
  }

  private func perform(_ requests: [VNRecognizeTextRequest], on image: LoadedImage) throws {
    let handler = VNImageRequestHandler(cgImage: image.cgImage, orientation: .up, options: [:])
    do {
      try handler.perform(requests)
    } catch {
      throw RecognitionException(error.localizedDescription)
    }
  }

  private func result(for request: VNRecognizeTextRequest, image: LoadedImage) -> [String: Any] {
    let observations = request.results ?? []

    let lines: [[String: Any]] = observations.compactMap { observation in
      // Cursive abbreviations ("UWP" read as "uap") are often only the second
      // or third guess; every alternative is scored on the JS side.
      let candidates = observation.topCandidates(5)
      guard let top = candidates.first else { return nil }

      return [
        "text": top.string,
        "confidence": Double(top.confidence),
        "candidates": candidates.map { $0.string },
        "box": jsBox(from: observation.boundingBox),
        "words": wordBoxes(in: top),
      ]
    }

    return [
      "imageWidth": image.width,
      "imageHeight": image.height,
      "lines": lines,
    ]
  }

  /// Per-word boxes, so the JS side can split a row that Vision read as one
  /// observation ("SURNAME, FIRST   UWP PO") into its name and reason columns.
  private func wordBoxes(in text: VNRecognizedText) -> [[String: Any]] {
    let string = text.string
    var searchStart = string.startIndex
    var words: [[String: Any]] = []

    for word in string.split(whereSeparator: { $0.isWhitespace }) {
      guard let range = string.range(of: word, range: searchStart..<string.endIndex) else { continue }
      searchStart = range.upperBound

      guard let box = try? text.boundingBox(for: range)?.boundingBox else { continue }
      words.append([
        "text": String(word),
        "box": jsBox(from: box),
      ])
    }

    return words
  }

  // MARK: - Coordinate conversion

  /// Vision: normalized, origin bottom-left. JS: normalized, origin top-left.
  private func jsBox(from rect: CGRect) -> [String: Double] {
    [
      "x": Double(rect.minX),
      "y": Double(1 - rect.maxY),
      "width": Double(rect.width),
      "height": Double(rect.height),
    ]
  }

  private func visionRect(from box: OcrBoxRecord) -> CGRect {
    let x = min(max(box.x, 0), 1)
    let width = min(max(box.width, 0), 1 - x)
    let top = min(max(box.y, 0), 1)
    let height = min(max(box.height, 0), 1 - top)
    return CGRect(x: x, y: 1 - top - height, width: width, height: height)
  }
}

// MARK: - Document scanner

/// Bridges the scanner's callbacks to one JS promise and dismisses the
/// scanner afterwards. An attendance sheet is a single page; if several were
/// scanned, the first is used.
private final class DocumentScanDelegate: NSObject, VNDocumentCameraViewControllerDelegate {
  private let promise: Promise
  private let onDone: () -> Void

  init(promise: Promise, onDone: @escaping () -> Void) {
    self.promise = promise
    self.onDone = onDone
  }

  func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFinishWith scan: VNDocumentCameraScan) {
    var saved: Result<String?, Error> = .success(nil)

    if scan.pageCount > 0, let data = scan.imageOfPage(at: 0).jpegData(compressionQuality: 0.95) {
      let url = FileManager.default.temporaryDirectory
        .appendingPathComponent("sheet-\(UUID().uuidString).jpg")
      do {
        try data.write(to: url)
        saved = .success(url.absoluteString)
      } catch {
        saved = .failure(error)
      }
    }

    finish(controller) {
      switch saved {
      case .success(let uri):
        self.promise.resolve(uri)
      case .failure(let error):
        self.promise.reject(ScanException(error.localizedDescription))
      }
    }
  }

  func documentCameraViewControllerDidCancel(_ controller: VNDocumentCameraViewController) {
    finish(controller) { self.promise.resolve(nil) }
  }

  func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFailWithError error: Error) {
    finish(controller) { self.promise.reject(ScanException(error.localizedDescription)) }
  }

  private func finish(_ controller: UIViewController, then settle: @escaping () -> Void) {
    controller.dismiss(animated: true) {
      settle()
      self.onDone()
    }
  }
}
