package expo.modules.handwritingocr

import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Placeholder until an on-device recognizer is wired up for Android
 * (Google ML Kit text recognition, bundled model). Keeps the module linkable
 * on Android; the app hides the scan button when `isSupported` is false.
 */
class HandwritingOcrModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("HandwritingOcr")

    Constant("isSupported") { false }

    Constant("isDocumentScannerSupported") { false }

    AsyncFunction("scanDocument") {
      unsupported()
    }

    AsyncFunction("recognizeText") { _: String, _: Map<String, Any?>? ->
      unsupported()
    }

    AsyncFunction("recognizeCells") { _: String, _: List<Map<String, Any?>>, _: Map<String, Any?>? ->
      listOf(unsupported())
    }
  }

  // A lambda whose body is only `throw` infers `Nothing`, which the function
  // factories cannot reify; declaring the return type here keeps them typed.
  private fun unsupported(): Map<String, Any?> = throw UnsupportedException()
}

private class UnsupportedException :
  CodedException("E_UNSUPPORTED", "Handwriting recognition is not available on this device yet.", null)
