import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { create, update, deleteQuestion, getById, list, getMeta } from '../controllers/question.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Reference/lookup data for building question forms (must come before /:id)
router.get('/meta', getMeta);

// List questions (both roles)
router.get('/', list);

// Get question by ID (both roles)
router.get('/:id', getById);

// Create question (admin only)
router.post('/', authorize('ADMIN'), create);

// Update question (admin only)
router.put('/:id', authorize('ADMIN'), update);

// Delete question (admin only)
router.delete('/:id', authorize('ADMIN'), deleteQuestion);

export default router;
