import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  create,
  update,
  deleteAssessment,
  getById,
  list,
  addQuestions,
  removeQuestion,
  reorderQuestions,
  duplicate,
} from '../controllers/assessment.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// List assessments (authenticated, both roles)
router.get('/', list);

// Get assessment by ID (authenticated)
router.get('/:id', getById);

// Create assessment (admin only)
router.post('/', authorize('ADMIN'), create);

// Update assessment (admin only)
router.put('/:id', authorize('ADMIN'), update);

// Delete assessment (admin only)
router.delete('/:id', authorize('ADMIN'), deleteAssessment);

// Add questions to assessment (admin only)
router.post('/:id/questions', authorize('ADMIN'), addQuestions);

// Remove question from assessment (admin only)
router.delete('/:id/questions/:questionId', authorize('ADMIN'), removeQuestion);

// Reorder questions in assessment (admin only)
router.put('/:id/questions/reorder', authorize('ADMIN'), reorderQuestions);

// Duplicate assessment (admin only)
router.post('/:id/duplicate', authorize('ADMIN'), duplicate);

export default router;
