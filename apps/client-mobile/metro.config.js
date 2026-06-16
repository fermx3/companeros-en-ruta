const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('path')

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [monorepoRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]
config.resolver.disableHierarchicalLookup = true

// Anchor input + tailwind config to __dirname so the absolute paths are
// stable regardless of which cwd eas build / fingerprint / metro happens to
// invoke us from. Without these, NativeWind's withNativeWind() does
// path.resolve('./global.css') and path.resolve('tailwind.config'), both of
// which use process.cwd(); on EAS Build that cwd ends up doubling the path
// (e.g. apps/client-mobile/apps/client-mobile/tailwind.config) and the
// build dies in the prebundling step.
module.exports = withNativeWind(config, {
  input: path.resolve(projectRoot, 'global.css'),
  configPath: path.resolve(projectRoot, 'tailwind.config.js'),
})
