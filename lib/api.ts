import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAuthStore } from './auth-store';

function getBaseUrl(): string {
  if (__DEV__) {
    // Try to extract host IP from the Expo bundler URL
    const hostUri = Constants.expoConfig?.hostUri
      || (Constants as any).debuggerHost
      || (Constants as any).manifest?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip !== 'localhost' && ip !== '127.0.0.1') {
        return `http://${ip}:3000`;
      }
    }
    // Android emulator → host machine at 10.0.2.2
    if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
    // iOS simulator → localhost
    return 'http://localhost:3000';
  }
  return 'http://localhost:3000';
}

export const BASE_URL = getBaseUrl();

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  },
);
