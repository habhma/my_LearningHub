import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { list, getById, update, deleteUser, updateMyProfile, stats } from '../controllers/user.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/me', async (req: any, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

// Update the logged-in user's own profile (any authenticated role)
router.put('/me', updateMyProfile);

// Aggregate user counts by role (admin only) - must come before /:id
router.get('/stats', authorize('ADMIN'), stats);

// List users (admin only)
router.get('/', authorize('ADMIN'), list);

// Get user by ID (admin only)
router.get('/:id', authorize('ADMIN'), getById);

// Update a user's role/status (admin only)
router.put('/:id', authorize('ADMIN'), update);

// Soft-delete a user (admin only)
router.delete('/:id', authorize('ADMIN'), deleteUser);

export default router;
