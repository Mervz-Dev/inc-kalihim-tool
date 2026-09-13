require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'HandwritingOcr'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platforms      = {
    :ios => '15.1'
  }
  s.swift_version  = '5.4'
  s.source         = { git: 'https://github.com/Mervz-Dev/inc-kalihim-tool.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Apple Vision and its document scanner ship with iOS; nothing is downloaded
  # and nothing leaves the device.
  s.frameworks = 'Vision', 'VisionKit', 'CoreImage'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift}"
end
