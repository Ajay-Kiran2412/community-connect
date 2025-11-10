import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    // You can add authorization header here if using Bearer tokens instead of cookies
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await api.post('/auth/refresh');
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth service functions
export const authService = {
  // Sign up new user
  async signup(userData) {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Signup failed');
    }
  },

  // Login user
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  // Logout user
  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Logout failed');
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get user data');
    }
  },

  // Refresh token (handled automatically by interceptor, but exposed if needed)
  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Token refresh failed');
    }
  },

  // Verify user (admin function)
  async verifyUser(userId, adminToken) {
    try {
      const response = await api.post(`/auth/verify/${userId}`, {}, {
        headers: {
          'x-admin-token': adminToken
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Verification failed');
    }
  }
};

// Named exports for individual functions
export const { signup, login, logout, getCurrentUser, refreshToken, verifyUser } = authService;

export default authService;