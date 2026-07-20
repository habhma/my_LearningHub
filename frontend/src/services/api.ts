import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError } from '@/types';

// Shape of the raw error envelope returned by the backend, e.g.
// { success: false, error: { message: string } }. This is distinct from the
// frontend's normalized `ApiError` type used after the interceptor transforms it.
interface BackendErrorResponse {
  success: false;
  error?: { message?: string };
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem(import.meta.env.VITE_AUTH_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.log('API Request:', {
        method: config.method,
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.log('API Response:', {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError<BackendErrorResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Log error in development
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.error('API Error:', {
        status: error.response?.status,
        message: error.response?.data?.error?.message,
        url: error.config?.url,
      });
    }

    // Auth endpoints (login/register/refresh) return 401 for invalid credentials,
    // not an expired session - don't trigger the token-refresh/redirect flow for those.
    const isAuthEndpoint = /\/auth\/(login|register|refresh)$/.test(error.config?.url || '');

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem(import.meta.env.VITE_REFRESH_TOKEN_KEY);

        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken } = response.data;

        // Save new token
        localStorage.setItem(import.meta.env.VITE_AUTH_TOKEN_KEY, accessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem(import.meta.env.VITE_AUTH_TOKEN_KEY);
        localStorage.removeItem(import.meta.env.VITE_REFRESH_TOKEN_KEY);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      // Redirect to unauthorized page or show error
      window.location.href = '/unauthorized';
    }

    // Transform error for consistent error handling
    const apiError: ApiError = {
      message: error.response?.data?.error?.message || error.message || 'An unexpected error occurred',
      statusCode: error.response?.status || 500,
      ...(error.response?.data && 'errors' in error.response.data
        ? { errors: (error.response.data as any).errors }
        : {}),
    };

    return Promise.reject(apiError);
  }
);

export default apiClient;
