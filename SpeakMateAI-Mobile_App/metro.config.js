const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);


// Add Live2D asset extensions
const defaultAssetExts = config.resolver.assetExts || [];
config.resolver.assetExts = Array.from(new Set([...defaultAssetExts, "html", "moc", "moc3"]));

module.exports = withNativeWind(config, { input: "./global.css" });
