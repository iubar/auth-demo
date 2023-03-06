/**
 * @see https://react-native-community.github.io/async-storage/docs/advanced/jest
 */

// import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
// jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
 
jest.mock('expo-font');
jest.mock('expo-asset');

import 'setimmediate';

/*
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');  
    // The mock for `call` immediately calls the callback which is incorrect
    // So we override it with a no-op
    Reanimated.default.call = () => {};  
    return Reanimated;
  });
*/  
