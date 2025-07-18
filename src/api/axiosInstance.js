import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert } from 'react-native';
import { navigate, getCurrentRouteName } from './navigationRef'; // We'll create this

const axiosInstance = axios.create({
    // baseURL: 'http://192.168.1.148:8000/',
    baseURL: 'http://172.105.54.28:8004/', // test server
    // baseURL: 'http://172.105.54.28:8005/', // production server
    // baseURL: 'https://dbms.boscomigrants.org:8005/',
    // baseURL: 'http://10.0.2.2:8000/',
    timeout: 10000,
    headers:{
        'Content-Type': 'application/json'
    },
});

// Add a request interceptor to log request details
axiosInstance.interceptors.request.use(
  async (config) => {
    // Skip token for registration endpoint
    if (config.url === 'user/register') {
      return config;
    }
    
    const token = await AsyncStorage.getItem('accessToken');
    // console.log("Retrieved Token in Interceptor:", token); // Debug token retrieval
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No token found in AsyncStorage for request:", config.url);
    }
    // console.log("Request URL:", config.url);
    // console.log("Request Method:", config.method.toUpperCase());
    // console.log("Request Data:", config.data);
    // console.log("Request Headers:", config.headers);
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Handle token expiration (401 Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await AsyncStorage.multiRemove(['accessToken', 'userData']);
      // Only show alert if NOT on SplashScreen
      if (getCurrentRouteName() !== 'Splash') {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            {
              text: 'OK',
              onPress: () => navigate('Login'),
            },
          ],
          { cancelable: false }
        );
      } else {
        // Just navigate silently if on Splash
        // navigate('Login');
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

// Utility functions to manage the token
export const setAuthToken = async (token) => {
  if (token) {
    await AsyncStorage.setItem('accessToken', token);
    console.log("Token stored in AsyncStorage:", token); // Debug token storage
  }
};

export const clearAuthToken = async () => {
  await AsyncStorage.removeItem('accessToken');
  console.log("Token cleared from AsyncStorage"); // Debug token clearing
};