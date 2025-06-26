import { Platform } from 'react-native';

// Android emulator needs special IP to access host machine's localhost
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    // 10.0.2.2 is the special IP for Android emulator to access host's localhost
    return 'http://10.0.2.2:5022/api';
  }
  // For iOS simulator or web, use localhost
  return 'http://127.0.0.1:5022/api';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}; 