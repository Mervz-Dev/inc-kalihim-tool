const { withPodfile } = require("@expo/config-plugins");

const withIOSDeploymentTarget = (config) => {
  return withPodfile(config, (mod) => {
    // Remove any existing platform :ios line
    mod.modResults.contents = mod.modResults.contents.replace(
      /^platform :ios.*$/gm,
      ""
    );

    // Add our desired platform line at the top
    mod.modResults.contents = `platform :ios, '15.5'\n${mod.modResults.contents.trim()}\n`;

    return mod;
  });
};

module.exports = withIOSDeploymentTarget;
