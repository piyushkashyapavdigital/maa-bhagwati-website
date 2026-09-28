module.exports = {
  presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
  plugins: [
    // react-native-worklets/plugin must be last (reanimated v4)
    'react-native-worklets/plugin',
  ],
};
