// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for socket.io-client ESM modules
// Include .mjs, .cjs, and .js as source extensions
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'mjs',
  'cjs',
];

// Enable package exports to properly resolve ESM modules
config.resolver.unstable_enablePackageExports = true;

// Ensure proper module resolution order
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Note: Using require() in websocket.ts instead of import to avoid ESM resolution issues

module.exports = config;
