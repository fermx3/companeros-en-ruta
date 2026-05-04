module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // Reanimated worklet transformer — must be last in the plugins list.
      'react-native-reanimated/plugin',
    ],
  }
}
