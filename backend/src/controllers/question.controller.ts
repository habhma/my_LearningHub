import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { QuestionService } from '../services/question.service';
import { QuestionStatus } from '@prisma/client';

const questionService = new QuestionService();

const VALID_TYPES_REQUIRING_OPTIONS = new Set(['multiple_choice', 'true_false']);

/**
 * Get reference/lookup data for building question forms
 * GET /questions/meta
 */
export const getMeta = async (_req: AuthRequest, res: Response) => {
  try {
    const result = await questionService.getMeta();
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
};

/**
 * Create a new question (Admin only)
 * POST /questions
 */
export const create = async (req: AuthRequest, res: Response) => {
  try {
    const {
      questionText,
      questionHtml,
      questionImageUrl,
      typeId,
      difficultyId,
      subjectId,
      topicId,
      classLevel,
      examCategoryId,
      correctAnswer,
      timeLimitSeconds,
      marks,
      negativeMarks,
      tags,
      status,
      isActive,
      options,
      explanations,
      typeCode,
    } = req.body;

    if (!questionText || !typeId || !difficultyId || !subjectId || !classLevel || !examCategoryId) {
      return res.status(400).json({
        success: false,
        error: {
          message:
            'questionText, typeId, difficultyId, subjectId, classLevel and examCategoryId are required',
        },
      });
    }

    if (status && !Object.values(QuestionStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: `status must be one of: ${Object.values(QuestionStatus).join(', ')}` },
      });
    }

    if (typeCode && VALID_TYPES_REQUIRING_OPTIONS.has(typeCode)) {
      if (!options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({
          success: false,
          error: { message: 'At least 2 options are required for this question type' },
        });
      }
      if (!options.some((opt: any) => opt.isCorrect)) {
        return res.status(400).json({
          success: false,
          error: { message: 'At least one option must be marked as correct' },
        });
      }
    }

    const result = await questionService.createQuestion({
      questionText,
      questionHtml,
      questionImageUrl,
      typeId: parseInt(typeId),
      difficultyId: parseInt(difficultyId),
      subjectId: parseInt(subjectId),
      topicId: topicId ? parseInt(topicId) : undefined,
      classLevel: parseInt(classLevel),
      examCategoryId: parseInt(examCategoryId),
      correctAnswer,
      timeLimitSeconds: timeLimitSeconds ? parseInt(timeLimitSeconds) : undefined,
      marks: marks !== undefined ? parseFloat(marks) : undefined,
      negativeMarks: negativeMarks !== undefined ? parseFloat(negativeMarks) : undefined,
      tags,
      status,
      isActive,
      createdBy: req.user?.id ? BigInt(req.user.id) : undefined,
      options: options?.map((opt: any, index: number) => ({
        optionText: opt.optionText,
        optionOrder: opt.optionOrder ?? index + 1,
        isCorrect: !!opt.isCorrect,
      })),
      explanations: explanations?.map((exp: any, index: number) => ({
        explanationType: exp.explanationType,
        explanationText: exp.explanationText,
        displayOrder: exp.displayOrder ?? index + 1,
      })),
    });

    return res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: { message: error.message } });
  }
};

/**
 * Update an existing question (Admin only)
 * PUT /questions/:id
 */
export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      questionText,
      questionHtml,
      questionImageUrl,
      typeId,
      difficultyId,
      subjectId,
      topicId,
      classLevel,
      examCategoryId,
      correctAnswer,
      timeLimitSeconds,
      marks,
      negativeMarks,
      tags,
      status,
      isActive,
      options,
      explanations,
    } = req.body;

    if (status && !Object.values(QuestionStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: `status must be one of: ${Object.values(QuestionStatus).join(', ')}` },
      });
    }

    const result = await questionService.updateQuestion(BigInt(id), {
      questionText,
      questionHtml,
      questionImageUrl,
      typeId: typeId !== undefined ? parseInt(typeId) : undefined,
      difficultyId: difficultyId !== undefined ? parseInt(difficultyId) : undefined,
      subjectId: subjectId !== undefined ? parseInt(subjectId) : undefined,
      topicId: topicId !== undefined && topicId !== null && topicId !== '' ? parseInt(topicId) : undefined,
      classLevel: classLevel !== undefined ? parseInt(classLevel) : undefined,
      examCategoryId: examCategoryId !== undefined ? parseInt(examCategoryId) : undefined,
      correctAnswer,
      timeLimitSeconds: timeLimitSeconds !== undefined ? parseInt(timeLimitSeconds) : undefined,
      marks: marks !== undefined ? parseFloat(marks) : undefined,
      negativeMarks: negativeMarks !== undefined ? parseFloat(negativeMarks) : undefined,
      tags,
      status,
      isActive,
      updatedBy: req.user?.id ? BigInt(req.user.id) : undefined,
      options: options?.map((opt: any, index: number) => ({
        optionText: opt.optionText,
        optionOrder: opt.optionOrder ?? index + 1,
        isCorrect: !!opt.isCorrect,
      })),
      explanations: explanations?.map((exp: any, index: number) => ({
        explanationType: exp.explanationType,
        explanationText: exp.explanationText,
        displayOrder: exp.displayOrder ?? index + 1,
      })),
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, error: { message: error.message } });
    }
    return res.status(400).json({ success: false, error: { message: error.message } });
  }
};

/**
 * Soft delete a question (Admin only)
 * DELETE /questions/:id
 */
export const deleteQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await questionService.deleteQuestion(BigInt(id));
    return res.status(200).json({ success: true, message: 'Question deleted successfully' });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, error: { message: error.message } });
    }
    return res.status(400).json({ success: false, error: { message: error.message } });
  }
};

/**
 * Get question by ID (Both roles)
 * GET /questions/:id
 */
export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await questionService.getQuestionById(BigInt(id));
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, error: { message: error.message } });
    }
    return res.status(400).json({ success: false, error: { message: error.message } });
  }
};

/**
 * List questions (Both roles)
 * GET /questions
 */
export const list = async (req: AuthRequest, res: Response) => {
  try {
    const {
      subjectId,
      topicId,
      examCategoryId,
      classLevel,
      difficultyId,
      typeId,
      status,
      search,
      page,
      limit,
    } = req.query;

    const filters: any = {
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
    };

    if (subjectId) filters.subjectId = parseInt(subjectId as string);
    if (topicId) filters.topicId = parseInt(topicId as string);
    if (examCategoryId) filters.examCategoryId = parseInt(examCategoryId as string);
    if (classLevel) filters.classLevel = parseInt(classLevel as string);
    if (difficultyId) filters.difficultyId = parseInt(difficultyId as string);
    if (typeId) filters.typeId = parseInt(typeId as string);
    if (status) filters.status = status as QuestionStatus;
    if (search) filters.searchQuery = search as string;

    // Students only see active questions
    if (req.user?.role === 'STUDENT') {
      filters.isActive = true;
      filters.status = QuestionStatus.ACTIVE;
    }

    const result = await questionService.listQuestions(filters);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: { message: error.message } });
  }
};
