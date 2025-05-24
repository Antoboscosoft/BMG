import axiosInstance from './axiosInstance';
import { clearAuthToken } from './axiosInstance';

export const checkAuthStatus = async () => {
  try {
    await axiosInstance.get('user/me');
  } catch (error) {
    if (error.response?.status === 401) {
      await clearAuthToken();
      throw new Error('Unauthorized');
    }
    throw error;
  }
};