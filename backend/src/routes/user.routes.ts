import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { list, getById, update, deleteUser, updateMyProfile, stats } from '../controllers/user.controller';
import prisma from '../config/database';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/me', async (req: any, res) => {
  try {
    console.log('=== /users/me REQUEST ===');
    console.log('User ID from token:', req.user.id);

    // Fetch full user with profile including preferences
    const user = await prisma.user.findUnique({
      where: { id: BigInt(req.user.id) },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            fullName: true,
            classLevel: true,
            schoolName: true,
            dateOfBirth: true,
            bio: true,
            preferences: true,
          },
        },
      },
    });

    console.log('User fetched from DB:', {
      id: user?.id.toString(),
      email: user?.email,
      hasProfile: !!user?.profile,
      preferences: user?.profile?.preferences,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
    }

    const responseData = {
      ...user,
      id: user.id.toString(),
    };

    console.log('Response data preferences:', responseData.profile?.preferences);

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error: any) {
    console.error('Error in /users/me:', error);
    return res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to fetch user' },
    });
  }
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
