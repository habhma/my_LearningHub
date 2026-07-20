import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SubmissionService } from '../services/submission.service';
import { AttemptStatus } from '@prisma/client';

const submissionService = new SubmissionService();

/**
 * Start (or resume) a test attempt
 * POST /submissions/start
 */
export const start = async (req: AuthRequest, res: Response) => {
  try {
    const { testId } = req.body;
    if (!testId) {
      return res.status(400).json({ success: false, error: { message: 'testId is required' } });
    }

    const result = await submissionService.startAttempt(BigInt(testId), BigInt(req.user!.id));
    return res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, error: { message: error.message } });
    }
    return res.status(400).json({ success: false, error: { message: error.message } });
  }
};

/**
 * Submit an answer for a question within an attempt
 * POST /submissions/:id/answer
 */
export const answer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { questionId, selectedOptionId, textAnswer, timeTakenSeconds } = req.body;

    if (!questionId) {
      return res.status(400).json({ success: false, error: { message: 'questionId is required' } });
    }

    const result = await submissionService.submitAnswer(BigInt(id), BigInt(req.user!.id), {
      questionId: BigInt(questionId),
      selectedOptionId: selectedOptionId ? BigInt(selectedOptionId) : undefined,
      textAnswer,
      timeTakenSeconds: timeTakenSeconds ? parseInt(timeTakenSeconds) : undefined,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, error: { message: error.message } });
    }
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({ success: false, error: { message: error.message } });
    }
    return res.status(400).json({ success: false, error: { message: error.message } });
  }
};

/**
 * Finalize/submit an attempt
 * POST /submissions/:id/submit
 */
export const submit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await submissionService.submitAttempt(BigInt(id), BigInt(req.user!.id));
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, error: { message: error.message } });
    }
    if (error.message.includes('Not authorized')) {
      return res.status(403).json({ success: false, error: { message: error.message } });
    }
    return res.status(400).json({ success: false, error: { message: error.message } });
  }
};

/**
 * Get a single attempt's detail (owner or admin)
 * GET /submissions/:id
 */
export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await submissionService.getAttemptById(BigInt(id));

    if (req.user?.role !== 'ADMIN' && result.user.id.toString() !== req.user?.id) {
      return res.status(403).json({ success: false, error: { message: 'Not authorized' } });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, error: { message: error.message } });
    }
    return res.status(400).json({ success: false, error: { message: error.message } });
  }
};

/**
 * List attempts for a specific student (self or admin)
 * GET /submissions/student/:studentId
 */
export const listByStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const { status } = req.query;

    if (req.user?.role !== 'ADMIN' && studentId !== req.user?.id) {
      return res.status(403).json({ success: false, error: { message: 'Not authorized' } });
    }

    const result = await submissionService.listByStudent(
      BigInt(studentId),
      status as AttemptStatus | undefined
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: { message: error.message } });
  }
};

/**
 * List all attempts across the platform (admin only)
 * GET /submissions
 */
export const list = async (req: AuthRequest, res: Response) => {
  try {
    const { testId, userId, status, page, limit } = req.query;

    const result = await submissionService.listAll({
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
      testId: testId ? BigInt(testId as string) : undefined,
      userId: userId ? BigInt(userId as string) : undefined,
      status: status as AttemptStatus | undefined,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: { message: error.message } });
  }
};

/**
 * Aggregate submission stats (admin only)
 * GET /submissions/stats
 */
export const stats = async (_req: AuthRequest, res: Response) => {
  try {
    const result = await submissionService.getStats();
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: { message: error.message } });
  }
};
