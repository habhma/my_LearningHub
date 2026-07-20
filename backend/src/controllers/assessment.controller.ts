import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AssessmentService } from '../services/assessment.service';
import { TestType, AccessLevel } from '@prisma/client';

const assessmentService = new AssessmentService();

/**
 * Create a new assessment (Admin only)
 * POST /assessments
 */
export const create = async (req: AuthRequest, res: Response) => {
  try {
    const {
      testName,
      testType,
      testConfig,
      subjectId,
      examCategoryId,
      classLevel,
      accessLevel,
      pointsCost,
      isTemplate,
      isActive,
      questionIds,
    } = req.body;

    // Validate required fields
    if (!testType || !testConfig) {
      return res.status(400).json({
        success: false,
        error: { message: 'Test type and test config are required' },
      });
    }

    // Validate test type
    const validTypes = Object.values(TestType);
    if (!validTypes.includes(testType)) {
      return res.status(400).json({
        success: false,
        error: { message: `Test type must be one of: ${validTypes.join(', ')}` },
      });
    }

    const result = await assessmentService.createAssessment({
      testName,
      testType,
      testConfig,
      subjectId: subjectId ? parseInt(subjectId) : undefined,
      examCategoryId: examCategoryId ? parseInt(examCategoryId) : undefined,
      classLevel: classLevel ? parseInt(classLevel) : undefined,
      accessLevel: accessLevel || AccessLevel.FREE,
      pointsCost: pointsCost || 0,
      isTemplate: isTemplate || false,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user?.id ? BigInt(req.user.id) : undefined,
      questionIds: questionIds?.map((id: string | number) => BigInt(id)),
    });

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: { message: error.message },
    });
  }
};

/**
 * Update an existing assessment (Admin only)
 * PUT /assessments/:id
 */
export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      testName,
      testType,
      testConfig,
      subjectId,
      examCategoryId,
      classLevel,
      accessLevel,
      pointsCost,
      isTemplate,
      isActive,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Assessment ID is required' },
      });
    }

    // Validate test type if provided
    if (testType) {
      const validTypes = Object.values(TestType);
      if (!validTypes.includes(testType)) {
        return res.status(400).json({
          success: false,
          error: { message: `Test type must be one of: ${validTypes.join(', ')}` },
        });
      }
    }

    const updateData: any = {};
    if (testName !== undefined) updateData.testName = testName;
    if (testType !== undefined) updateData.testType = testType;
    if (testConfig !== undefined) updateData.testConfig = testConfig;
    if (subjectId !== undefined) updateData.subjectId = parseInt(subjectId);
    if (examCategoryId !== undefined) updateData.examCategoryId = parseInt(examCategoryId);
    if (classLevel !== undefined) updateData.classLevel = parseInt(classLevel);
    if (accessLevel !== undefined) updateData.accessLevel = accessLevel;
    if (pointsCost !== undefined) updateData.pointsCost = pointsCost;
    if (isTemplate !== undefined) updateData.isTemplate = isTemplate;
    if (isActive !== undefined) updateData.isActive = isActive;

    const result = await assessmentService.updateAssessment(BigInt(id), updateData);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: { message: error.message },
      });
    }
    return res.status(400).json({
      success: false,
      error: { message: error.message },
    });
  }
};

/**
 * Delete an assessment (Admin only)
 * DELETE /assessments/:id
 */
export const deleteAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Assessment ID is required' },
      });
    }

    await assessmentService.deleteAssessment(BigInt(id));

    return res.status(200).json({
      success: true,
      message: 'Assessment deleted successfully',
    });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: { message: error.message },
      });
    }
    return res.status(400).json({
      success: false,
      error: { message: error.message },
    });
  }
};

/**
 * Get assessment by ID (Both roles)
 * GET /assessments/:id
 */
export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Assessment ID is required' },
      });
    }

    const result = await assessmentService.getAssessmentById(BigInt(id));

    // Students can only view active assessments
    if (req.user?.role === 'STUDENT' && !result.isActive) {
      return res.status(403).json({
        success: false,
        error: { message: 'This assessment is not available' },
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: { message: error.message },
      });
    }
    return res.status(400).json({
      success: false,
      error: { message: error.message },
    });
  }
};

/**
 * List assessments (Both roles)
 * GET /assessments
 * Query params: subjectId, examCategoryId, testType, classLevel, createdBy, search, page, limit
 */
export const list = async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId, examCategoryId, testType, classLevel, createdBy, search, page, limit, isActive } =
      req.query;

    const filters: any = {
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
    };

    if (subjectId) filters.subjectId = parseInt(subjectId as string);
    if (examCategoryId) filters.examCategoryId = parseInt(examCategoryId as string);
    if (testType) filters.testType = testType as TestType;
    if (classLevel) filters.classLevel = parseInt(classLevel as string);
    if (createdBy) filters.createdBy = BigInt(createdBy as string);
    if (search) filters.searchQuery = search as string;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    // Students can only see active assessments
    if (req.user?.role === 'STUDENT') {
      filters.isActive = true;
    }

    const result = await assessmentService.listAssessments(filters);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: { message: error.message },
    });
  }
};

/**
 * Add questions to assessment (Admin only)
 * POST /assessments/:id/questions
 */
export const addQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { questionIds, customMarks } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Assessment ID is required' },
      });
    }

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Question IDs array is required and must not be empty' },
      });
    }

    const result = await assessmentService.addQuestionsToAssessment(
      BigInt(id),
      questionIds.map((qId: string | number) => BigInt(qId)),
      customMarks ? { marks: customMarks.marks, negativeMarks: customMarks.negativeMarks } : undefined
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: { message: error.message },
      });
    }
    return res.status(400).json({
      success: false,
      error: { message: error.message },
    });
  }
};

/**
 * Remove question from assessment (Admin only)
 * DELETE /assessments/:id/questions/:questionId
 */
export const removeQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { id, questionId } = req.params;

    if (!id || !questionId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Assessment ID and Question ID are required' },
      });
    }

    await assessmentService.removeQuestionFromAssessment(BigInt(id), BigInt(questionId));

    return res.status(200).json({
      success: true,
      message: 'Question removed successfully',
    });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: { message: error.message },
      });
    }
    return res.status(400).json({
      success: false,
      error: { message: error.message },
    });
  }
};

/**
 * Reorder questions in assessment (Admin only)
 * PUT /assessments/:id/questions/reorder
 */
export const reorderQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { questionOrder } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Assessment ID is required' },
      });
    }

    if (!questionOrder || !Array.isArray(questionOrder) || questionOrder.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Question order array is required and must not be empty' },
      });
    }

    // Validate question order format: array of { questionId, order }
    const isValid = questionOrder.every(
      (item: any) =>
        item.questionId !== undefined && item.order !== undefined && typeof item.order === 'number'
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: { message: 'Each item must have questionId and order (number)' },
      });
    }

    const result = await assessmentService.reorderQuestions(
      BigInt(id),
      questionOrder.map((item: any) => ({
        questionId: BigInt(item.questionId),
        newOrder: item.order,
      }))
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: { message: error.message },
      });
    }
    return res.status(400).json({
      success: false,
      error: { message: error.message },
    });
  }
};

/**
 * Duplicate an assessment (Admin only)
 * POST /assessments/:id/duplicate
 */
export const duplicate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newName, includeQuestions } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Assessment ID is required' },
      });
    }

    const result = await assessmentService.duplicateAssessment(
      BigInt(id),
      newName
    );

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: { message: error.message },
      });
    }
    return res.status(400).json({
      success: false,
      error: { message: error.message },
    });
  }
};
