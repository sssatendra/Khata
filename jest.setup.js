import 'react-native-reanimated/mock';

// Mock Expo Constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      backendUrl: 'http://localhost:5001',
    },
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const reanimated = require('react-native-reanimated/mock');
  return reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useGlobalSearchParams: () => ({}),
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

// Mock expo-linking
jest.mock('expo-linking', () => ({
  createURL: jest.fn(),
}));

// Prevent expo-router from initializing its runtime
jest.mock('expo-router/entry', () => ({}));
