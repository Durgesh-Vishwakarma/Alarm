import '@expo/metro-runtime';
import 'expo/src/Expo.fx';

import { AppRegistry } from 'react-native';
import { App } from 'expo-router/build/qualified-entry';

let RootComponent = App;

if (__DEV__) {
  const { withErrorOverlay } = require('@expo/metro-runtime/error-overlay');
  RootComponent = withErrorOverlay(App);
}

AppRegistry.registerComponent('main', () => RootComponent);
