const { withPodfile } = require("@expo/config-plugins");

// React Native 0.79 pins fmt 11.0.2, whose consteval format-string constructor
// Apple clang 19+ (Xcode 16.3 and newer) rejects as "not a constant expression"
// while compiling Pods/fmt. fmt fixed this in 11.1, but the version is pinned.
//
// Compiling the fmt pod as C++17 sidesteps it: consteval doesn't exist there,
// so fmt's own feature detection selects its runtime code path. Only the fmt
// target is affected — the rest of React Native still builds as C++20.
//
// This lives in the Podfile's post_install hook, and must run *after*
// react_native_post_install, which sets C++20 across the pod targets.
const PATCH = `
    # with-fmt-consteval-fix
    installer.pods_project.targets.each do |target|
      if target.name == 'fmt'
        target.build_configurations.each do |config|
          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        end
      end
    end
`;

const withFmtConstevalFix = (config) => {
  return withPodfile(config, (mod) => {
    const contents = mod.modResults.contents;

    if (contents.includes("with-fmt-consteval-fix")) {
      return mod;
    }

    // Anchor on the end of react_native_post_install so the C++17 setting is
    // applied after RN has finished forcing C++20 onto the pod targets.
    const anchor = `    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      :ccache_enabled => podfile_properties['apple.ccacheEnabled'] == 'true',
    )`;

    if (!contents.includes(anchor)) {
      throw new Error(
        "with-fmt-consteval-fix: could not find the react_native_post_install call in the Podfile."
      );
    }

    mod.modResults.contents = contents.replace(anchor, `${anchor}\n${PATCH}`);

    return mod;
  });
};

module.exports = withFmtConstevalFix;
