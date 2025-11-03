const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Get default Expo Metro config
const config = getDefaultConfig(__dirname);

// Add support for NativeWind
const metroConfig = withNativeWind(config, { input: "./global.css" });

metroConfig.resolver = {
  ...metroConfig.resolver,
  extraNodeModules: {
    buffer: require.resolve("buffer/"), // optional, needed for ExcelJS
    ...metroConfig.resolver.extraNodeModules,
  },
  assetExts: [...metroConfig.resolver.assetExts, "xlsx"], // include .xlsx as asset
  sourceExts: [...metroConfig.resolver.sourceExts, "cjs"], // optional, for Node modules
};

module.exports = metroConfig;
