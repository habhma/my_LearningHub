import apiClient from './api';
import {
  Assessment,
  AssessmentStatistics,
  AssessmentStatus,
  PaginatedResponse,
  QueryParams,
} from '@/types';

/**
 * Maps a raw backend `Test` row (testName/testConfig/isActive/...) into the
 * normalized `Assessment` shape used throughout the frontend. This is needed
 * because the actual Postgres/Prisma `Test` model does not have `title`,
 * `description`, `status`, `duration`, or `totalPoints` fields directly -
 * those live inside `testConfig` (JSON) or are derived from `isActive`.
 */
function mapRawAssessment(raw: any): Assessment {
  const testConfig = raw.testConfig || {};
  const descriptionParts = [raw.subject?.subjectName, raw.examCategory?.categoryName].filter(
    Boolean
  );

  return {
    id: String(raw.id),
    title: raw.testName || 'Untitled Assessment',
    description: descriptionParts.join(' · '),
    testType: raw.testType,
    status: raw.isActive ? AssessmentStatus.PUBLISHED : AssessmentStatus.DRAFT,
    duration: testConfig.duration || 0,
    totalPoints: testConfig.totalMarks || 0,
    passingScore: testConfig.passingMarks || 0,
    questions: [],
    createdBy: raw.creator?.email || (raw.createdBy ? String(raw.createdBy) : ''),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    isActive: raw.isActive,
    classLevel: raw.classLevel,
    _count: raw._count,
  };
}

/**
 * Assessment Service
 *
 * Provides API methods for managing assessments in the Student Assessment Platform.
 *
 * Features:
 * - Automatic authentication via apiClient (reads token from localStorage)
 * - TypeScript types for all requests and responses
 * - Error handling with proper error messages
 * - Supports pagination, filtering, and sorting
 *
 * Base URL: Configured via VITE_API_BASE_URL environment variable
 * Default: http://localhost:5000/api/v1
 *
 * Authentication:
 * - Auth tokens are automatically included in request headers by apiClient
 * - Token is retrieved from localStorage using VITE_AUTH_TOKEN_KEY
 * - Managed by authStore (see src/store/authStore.ts)
 *
 * Usage Example:
 * ```typescript
 * import { assessmentService } from '@/services/assessmentService';
 *
 * // Get all assessments with filters
 * const assessments = await assessmentService.getAssessments({
 *   page: 1,
 *   pageSize: 10,
 *   status: 'published',
 *   search: 'Math'
 * });
 *
 * // Create a new assessment
 * const newAssessment = await assessmentService.createAssessment({
 *   title: 'Math Quiz 1',
 *   description: 'Basic algebra',
 *   status: AssessmentStatus.DRAFT,
 *   duration: 60,
 *   questions: []
 * });
 * ```
 */

export const assessmentService = {
  /**
   * Get all assessments with optional filters, sorting, and pagination
   * @param params - Query parameters for filtering, sorting, and pagination
   * @param params.page - Page number (default: 1)
   * @param params.pageSize - Number of items per page (default: 10)
   * @param params.status - Filter by assessment status (draft, published, archived)
   * @param params.search - Search term for title or description
   * @param params.sortBy - Field to sort by
   * @param params.sortOrder - Sort order ('asc' or 'desc')
   * @returns Paginated list of assessments
   * @throws {ApiError} If the request fails
   */
  getAssessments: async (params?: QueryParams): Promise<PaginatedResponse<Assessment>> => {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        data: any[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalCount: number;
          limit: number;
        };
      };
    }>('/assessments', {
      params,
    });
    const { data, pagination } = response.data.data;
    return {
      data: data.map(mapRawAssessment),
      total: pagination.totalCount,
      page: pagination.currentPage,
      pageSize: pagination.limit,
      totalPages: pagination.totalPages,
    };
  },

  /**
   * Get a single assessment by ID
   * @param id - Assessment ID
   * @returns Assessment details
   * @throws {ApiError} If the assessment is not found or request fails
   */
  getAssessment: async (id: string): Promise<Assessment> => {
    const response = await apiClient.get<{ success: boolean; data: any }>(`/assessments/${id}`);
    return mapRawAssessment(response.data.data);
  },

  /**
   * Get a single assessment by ID (alias for getAssessment)
   * @param id - Assessment ID
   * @returns Assessment details
   * @throws {ApiError} If the assessment is not found or request fails
   */
  getAssessmentById: async (id: string): Promise<Assessment> => {
    const response = await apiClient.get<{ success: boolean; data: any }>(`/assessments/${id}`);
    return mapRawAssessment(response.data.data);
  },

  /**
   * Create a new assessment (admin only)
   * @param data - Assessment data
   * @returns Created assessment
   * @throws {ApiError} If validation fails or user is not authorized
   */
  createAssessment: async (data: Partial<Assessment>): Promise<Assessment> => {
    const response = await apiClient.post<{ success: boolean; data: any }>('/assessments', data);
    return mapRawAssessment(response.data.data);
  },

  /**
   * Update an existing assessment (admin only)
   * @param id - Assessment ID
   * @param data - Updated assessment data
   * @returns Updated assessment
   * @throws {ApiError} If validation fails, assessment not found, or user is not authorized
   */
  updateAssessment: async (id: string, data: Partial<Assessment>): Promise<Assessment> => {
    const response = await apiClient.put<{ success: boolean; data: any }>(
      `/assessments/${id}`,
      data
    );
    return mapRawAssessment(response.data.data);
  },

  /**
   * Delete an assessment (admin only)
   * @param id - Assessment ID
   * @throws {ApiError} If assessment not found or user is not authorized
   */
  deleteAssessment: async (id: string): Promise<void> => {
    await apiClient.delete(`/assessments/${id}`);
  },

  /**
   * Update assessment status
   * @param id - Assessment ID
   * @param status - New status (draft, published, archived)
   * @returns Updated assessment
   * @throws {ApiError} If assessment not found or status transition is invalid
   */
  updateStatus: async (id: string, status: AssessmentStatus): Promise<Assessment> => {
    const response = await apiClient.patch<Assessment>(`/assessments/${id}/status`, {
      status,
    });
    return response.data;
  },

  /**
   * Get assessment statistics (admin only)
   * @param id - Assessment ID
   * @returns Assessment statistics (submissions, scores, etc.)
   * @throws {ApiError} If assessment not found or user is not authorized
   */
  getStatistics: async (id: string): Promise<AssessmentStatistics> => {
    const response = await apiClient.get<AssessmentStatistics>(`/assessments/${id}/statistics`);
    return response.data;
  },

  /**
   * Duplicate an existing assessment with optional new name
   * @param id - Assessment ID to duplicate
   * @param newName - Optional new name for the duplicated assessment
   * @returns Newly created assessment (duplicate)
   * @throws {ApiError} If assessment not found or user is not authorized
   */
  duplicateAssessment: async (id: string, newName?: string): Promise<Assessment> => {
    const response = await apiClient.post<Assessment>(`/assessments/${id}/duplicate`, {
      title: newName,
    });
    return response.data;
  },
};
