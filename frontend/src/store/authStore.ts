import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoginResponse } from '@/types';
import { authService } from '@/services/authService';

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      // Login action
      login: async (email: string, password: string) => {
        try {
          const response: LoginResponse = await authService.login({ email, password });

          // Save tokens to localStorage
          localStorage.setItem(import.meta.env.VITE_AUTH_TOKEN_KEY, response.data.accessToken);
          localStorage.setItem(import.meta.env.VITE_REFRESH_TOKEN_KEY, response.data.refreshToken);

          // Update store
          set({
            user: response.data.user,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },

      // Register action
      register: async (data: any) => {
        try {
          const response: LoginResponse = await authService.register(data);

          // Save tokens to localStorage
          localStorage.setItem(import.meta.env.VITE_AUTH_TOKEN_KEY, response.data.accessToken);
          localStorage.setItem(import.meta.env.VITE_REFRESH_TOKEN_KEY, response.data.refreshToken);

          // Update store
          set({
            user: response.data.user,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Registration failed:', error);
          throw error;
        }
      },

      // Logout action
      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout failed:', error);
        } finally {
          // Clear tokens from localStorage
          localStorage.removeItem(import.meta.env.VITE_AUTH_TOKEN_KEY);
          localStorage.removeItem(import.meta.env.VITE_REFRESH_TOKEN_KEY);

          // Clear store
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        }
      },

      // Set user
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      // Set tokens
      setTokens: (accessToken: string, refreshToken: string) => {
        localStorage.setItem(import.meta.env.VITE_AUTH_TOKEN_KEY, accessToken);
        localStorage.setItem(import.meta.env.VITE_REFRESH_TOKEN_KEY, refreshToken);
        set({ accessToken, refreshToken });
      },

      // Clear auth
      clearAuth: () => {
        localStorage.removeItem(import.meta.env.VITE_AUTH_TOKEN_KEY);
        localStorage.removeItem(import.meta.env.VITE_REFRESH_TOKEN_KEY);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      // Refresh user data
      refreshUser: async () => {
        try {
          const user = await authService.getCurrentUser();
          set({ user });
        } catch (error) {
          console.error('Failed to refresh user:', error);
          get().clearAuth();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
