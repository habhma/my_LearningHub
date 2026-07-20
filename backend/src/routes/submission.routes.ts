import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  start,
  answer,
  submit,
  getById,
  listByStudent,
  list,
  stats,
} from '../controllers/submission.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Start (or resume) a test attempt (student)
router.post('/start', start);

// Aggregate stats (admin only) - must come before /:id
router.get('/stats', authorize('ADMIN'), stats);

// List all attempts across the platform (admin only) - must come before /:id
router.get('/', authorize('ADMIN'), list);

// List attempts for a specific student (self or admin)
router.get('/student/:studentId', listByStudent);

// Submit an answer for a question within an attempt
router.post('/:id/answer', answer);

// Finalize/submit an attempt
router.post('/:id/submit', submit);

// Get a single attempt's detail (owner or admin)
router.get('/:id', getById);

export default router;

