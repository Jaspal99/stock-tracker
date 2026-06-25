import 'fast-text-encoding';
import 'react-native-get-random-values';
import '@ethersproject/shims';

import { Buffer } from 'buffer';
import { registerRootComponent } from 'expo';

import App from './App';

(globalThis as typeof globalThis & { Buffer: typeof Buffer }).Buffer = Buffer;

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
