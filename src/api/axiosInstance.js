import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert } from 'react-native';
import { navigate } from './navigationRef'; // We'll create this

const axiosInstance = axios.create({
    // baseURL: 'http://192.168.1.148:8000/',
    baseURL: 'http://172.105.54.28:8004/', // test server
    // baseURL: 'http://172.105.54.28:8005/', // production server
    // baseURL: 'http://10.0.2.2:8000/',
    timeout: 10000,
    headers:{
        'Content-Type': 'application/json'
    },
});

// Add a request interceptor to log request details
axiosInstance.interceptors.request.use(
  async (config) => {
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

// // Add a response interceptor for better error handling
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // console.error("API Error:", error.message);
//     if (!error.response) {
//       // console.error("Network Error: Please check your server or internet connection.");
//     } else {
//       console.error("Error Response:", error.response.data);
//       console.error("Error Status:", error.response.status);
//       console.error("Error Headers:", error.response.headers);
//     }
//     return Promise.reject(error);
//   }
// );

// import { getAuthToken, refreshAuthToken } from './auth'; // Hypothetical functions

// // Response interceptor
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
    
//     // Handle token expiration (401 Unauthorized)
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
      
//       // Show alert and redirect to login
//       Alert.alert(
//         'Session Expired',
//         'Your session has expired. Please login again.',
//         [{
//           text: 'OK',
//           onPress: async () => {
//             await AsyncStorage.multiRemove(['accessToken', 'userData']);
//             navigate('Login'); 
//           }
//         }],
//         { cancelable: false }
//       );
      
//       return Promise.reject(error);
//     }
    
//     // Handle other errors
//     // console.error("API Error:", error.message);
//     return Promise.reject(error);
//   }
// );




// Add a response interceptor for better error handling
// axiosInstance.interceptors.response.use(
//     (response) => {
//         console.log("Response Interceptor - Status:", response.status);
//         console.log("Response Interceptor - Data:", response.data);
//         return response;
//     },
//     async (error) => {
//         const originalRequest = error.config;
//         console.error("Response Interceptor - Error:", error.message);
//         if (error.response) {
//             console.error("Response Interceptor - Error Response:", error.response.data);
//             console.error("Response Interceptor - Error Status:", error.response.status);
//             console.error("Response Interceptor - Error Headers:", error.response.headers);
//         } else {
//             console.error("Response Interceptor - Network Error: Please check your server or internet connection.");
//         }

//         // Handle token expiration (401 Unauthorized)
//         if (error.response?.status === 401 && !originalRequest._retry) {
//             originalRequest._retry = true;
//             Alert.alert(
//                 'Session Expired',
//                 'Your session has expired. Please login again.',
//                 [{
//                     text: 'OK',
//                     onPress: async () => {
//                         await AsyncStorage.multiRemove(['accessToken', 'userData']);
//                         navigate('Login');
//                     },
//                 }],
//                 { cancelable: false }
//             );
//             return Promise.reject(error);
//         }

//         return Promise.reject(error);
//     }
// );

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