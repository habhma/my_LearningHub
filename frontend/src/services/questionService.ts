import apiClient from './api';
import {
  QuestionBankFormData,
  QuestionBankItem,
  QuestionBankMeta,
  PaginatedResponse,
  QueryParams,
} from '@/types';

/**
 * Question Service
 *
 * Provides API methods for managing the question bank (admin) in the
 * Student Assessment Platform.
 */
export const questionService = {
  /**
   * Get reference/lookup data (subjects, exam categories, topics,
   * difficulty levels, question types) used to build question forms.
   */
  getMeta: async (): Promise<QuestionBankMeta> => {
    const response = await apiClient.get<{ success: boolean; data: QuestionBankMeta }>(
      '/questions/meta'
    );
    return response.data.data;
  },

  /**
   * Get all questions with optional filters, sorting, and pagination.
   */
  getQuestions: async (params?: QueryParams): Promise<PaginatedResponse<QuestionBankItem>> => {
    const { pageSize, ...rest } = params || {};
    const response = await apiClient.get<{
      success: boolean;
      data: {
        data: QuestionBankItem[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalCount: number;
          limit: number;
        };
      };
    }>('/questions', { params: { ...rest, limit: pageSize } });
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
   * Get a single question by ID.
   */
  getQuestion: async (id: string): Promise<QuestionBankItem> => {
    const response = await apiClient.get<{ success: boolean; data: QuestionBankItem }>(
      `/questions/${id}`
    );
    return response.data.data;
  },

  /**
   * Create a new question (admin only).
   */
  createQuestion: async (data: QuestionBankFormData): Promise<QuestionBankItem> => {
    const response = await apiClient.post<{ success: boolean; data: QuestionBankItem }>(
      '/questions',
      data
    );
    return response.data.data;
  },

  /**
   * Update an existing question (admin only).
   */
  updateQuestion: async (
    id: string,
    data: Partial<QuestionBankFormData>
  ): Promise<QuestionBankItem> => {
    const response = await apiClient.put<{ success: boolean; data: QuestionBankItem }>(
      `/questions/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete (soft-delete) a question (admin only).
   */
  deleteQuestion: async (id: string): Promise<void> => {
    await apiClient.delete(`/questions/${id}`);
  },
};
