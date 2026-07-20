import apiClient from './api';
import { PaginatedResponse } from '@/types';

export interface PlatformUser {
  id: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'TEACHER' | 'PARENT';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  profile?: {
    fullName: string;
    classLevel: number;
    schoolName: string | null;
    dateOfBirth?: string | null;
    bio?: string | null;
  } | null;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}

/**
 * User Service
 *
 * Provides API methods for managing platform users (admin only).
 */
export const userService = {
  /**
   * Get all users with optional filters and pagination.
   */
  getUsers: async (params?: UserQueryParams): Promise<PaginatedResponse<PlatformUser>> => {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        data: PlatformUser[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalCount: number;
          limit: number;
        };
      };
    }>('/users', { params });
    const { data, pagination } = response.data.data;
    return {
      data,
      total: pagination.totalCount,
      page: pagination.currentPage,
      pageSize: pagination.limit,
      totalPages: pagination.totalPages,
    };
  },

  /**
   * Update a user's role and/or status.
   */
  updateUser: async (
    id: string,
    data: { role?: string; status?: string }
  ): Promise<PlatformUser> => {
    const response = await apiClient.put<{ success: boolean; data: PlatformUser }>(
      `/users/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Soft-delete a user.
   */
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Update the logged-in user's own profile.
   */
  updateMyProfile: async (data: {
    fullName?: string;
    schoolName?: string;
    classLevel?: number;
    dateOfBirth?: string;
    bio?: string;
  }): Promise<PlatformUser> => {
    const response = await apiClient.put<{ success: boolean; data: PlatformUser }>(
      '/users/me',
      data
    );
    return response.data.data;
  },

  /**
   * Create a new user (reuses the registration endpoint so an admin
   * can provision accounts with a specific role).
   */
  createUser: async (data: {
    email: string;
    password: string;
    fullName: string;
    role: string;
    classLevel: number;
  }): Promise<void> => {
    await apiClient.post('/auth/register', data);
  },

  /**
   * Get aggregate user counts by role (admin only).
   */
  getUserStats: async (): Promise<{
    totalStudents: number;
    totalTeachers: number;
    totalAdmins: number;
    totalParents: number;
    totalUsers: number;
  }> => {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        totalStudents: number;
        totalTeachers: number;
        totalAdmins: number;
        totalParents: number;
        totalUsers: number;
      };
    }>('/users/stats');
    return response.data.data;
  },
};
