const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Ignore all binary and build output folders inside node_modules from Metro file watcher
const blockList = [
  /node_modules\/.*\/bin\/.*/,
  /node_modules\/.*\/build\/.*/,
  /.*\.gradle\/.*/,
];

const existing = config.resolver.blockList;
if (Array.isArray(existing)) {
  config.resolver.blockList = [...existing, ...blockList];
} else if (existing) {
  config.resolver.blockList = [existing, ...blockList];
} else {
  config.resolver.blockList = blockList;
}

module.exports = withNativeWind(config, { input: "./global.css" });
