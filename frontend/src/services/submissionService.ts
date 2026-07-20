import apiClient from './api';
import { StartAttemptResponse, TestAttempt, TestAttemptSummary, AttemptStatus } from '@/types';

/**
 * Submission Service
 *
 * Provides API methods for the test-taking (submission) flow: starting an
 * attempt, answering questions, finalizing, and listing past attempts.
 */
export const submissionService = {
  /**
   * Start (or resume) an attempt for the given test/assessment.
   */
  startAttempt: async (testId: string): Promise<StartAttemptResponse> => {
    const response = await apiClient.post<{ success: boolean; data: StartAttemptResponse }>(
      '/submissions/start',
      { testId }
    );
    return response.data.data;
  },

  /**
   * Submit/update the answer for a single question within an attempt.
   */
  submitAnswer: async (
    attemptId: string,
    data: {
      questionId: string;
      selectedOptionId?: string;
      textAnswer?: string;
      timeTakenSeconds?: number;
    }
  ): Promise<void> => {
    await apiClient.post(`/submissions/${attemptId}/answer`, data);
  },

  /**
   * Finalize an attempt (calculates final score/percentage).
   */
  submitAttempt: async (attemptId: string): Promise<TestAttempt> => {
    const response = await apiClient.post<{ success: boolean; data: TestAttempt }>(
      `/submissions/${attemptId}/submit`
    );
    return response.data.data;
  },

  /**
   * Get a single attempt's full detail (owner or admin).
   */
  getAttempt: async (attemptId: string): Promise<TestAttemptSummary> => {
    const response = await apiClient.get<{ success: boolean; data: TestAttemptSummary }>(
      `/submissions/${attemptId}`
    );
    return response.data.data;
  },

  /**
   * List attempts for a specific student (self or admin).
   */
  getStudentAttempts: async (
    studentId: string,
    status?: AttemptStatus
  ): Promise<TestAttemptSummary[]> => {
    const response = await apiClient.get<{ success: boolean; data: TestAttemptSummary[] }>(
      `/submissions/student/${studentId}`,
      { params: status ? { status } : undefined }
    );
    return response.data.data;
  },

  /**
   * List all attempts across the platform (admin only).
   */
  getAllAttempts: async (params?: {
    page?: number;
    limit?: number;
    status?: AttemptStatus;
  }): Promise<{ data: TestAttemptSummary[]; total: number; totalPages: number; page: number }> => {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        data: TestAttemptSummary[];
        pagination: { currentPage: number; totalPages: number; totalCount: number; limit: number };
      };
    }>('/submissions', { params });
    const { data, pagination } = response.data.data;
    return {
      data,
      total: pagination.totalCount,
      totalPages: pagination.totalPages,
      page: pagination.currentPage,
    };
  },

  /**
   * Aggregate submission stats (admin only).
   */
  getStats: async (): Promise<{ totalSubmissions: number; averagePercentage: number }> => {
    const response = await apiClient.get<{
      success: boolean;
      data: { totalSubmissions: number; averagePercentage: number };
    }>('/submissions/stats');
    return response.data.data;
  },
};
