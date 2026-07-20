import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserService } from '../services/user.service';
import { UserRole, UserStatus } from '@prisma/client';

const userService = new UserService();

/**
 * Get aggregate user counts by role (Admin only)
 * GET /users/stats
 */
export const stats = async (_req: AuthRequest, res: Response) => {
  try {
    const result = await userService.getUserStats();
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: { message: error.message } });
  }
};

/**
 * List users (Admin only)
 * GET /users
 */
export const list = async (req: AuthRequest, res: Response) => {
  try {
    const { role, status, search, page, limit } = req.query;

    if (role && !Object.values(UserRole).includes(role as UserRole)) {
      return res.status(400).json({
        success: false,
        error: { message: `role must be one of: ${Object.values(UserRole).join(', ')}` },
      });
    }
    if (status && !Object.values(UserStatus).includes(status as UserStatus)) {
      return res.status(400).json({
        success: false,
        error: { message: `status must be one of: ${Object.values(UserStatus).join(', ')}` },
      });
    }

    const result = await userService.listUsers({
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
      role: role as UserRole | undefined,
      status: status as UserStatus | undefined,
      search: search as string | undefined,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: { message: error.message } });
  }
};

/**
 * Get user by ID (Admin only)
 * GET /users/:id
 */
export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const result = await userService.getUserById(BigInt(req.params.id));
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, error: { message: error.message } });
    }
    return res.status(400).json({ success: false, error: { message: error.message } });  }
};

/**
 * Update a user's role/status (Admin only)
 * PUT /users/:id
 */
export const update = async (req: AuthRequest, res: Response) => {  try {
    const { id } = req.params;
    const { role, status } = req.body;

    if (role && !Object.values(UserRole).includes(role)) {
      return res.status(400).json({
        success: false,
        error: { message: `role must be one of: ${Object.values(UserRole).join(', ')}` },
      });
    }
    if (status && !Object.values(UserStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: `status must be one of: ${Object.values(UserStatus).join(', ')}` },
      });
    }
    if (req.user?.id === id && (status === UserStatus.INACTIVE || status === UserStatus.SUSPENDED)) {
      return res.status(400).json({
        success: false,
        error: { message: 'You cannot deactivate your own account' },
      });
    }

    const result = await userService.updateUser(BigInt(id), { role, status });
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, error: { message: error.message } });
    }
    return res.status(400).json({ success: false, error: { message: error.message } });
  }
};

/**
 * Soft-delete a user (Admin only)
 * DELETE /users/:id
 */
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user?.id === id) {
      return res.status(400).json({
        success: false,
        error: { message: 'You cannot delete your own account' },
      });
    }

    await userService.deleteUser(BigInt(id));
    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, error: { message: error.message } });
    }
    return res.status(400).json({ success: false, error: { message: error.message } });
  }
};

/**
 * Update the logged-in user's own profile (any authenticated role)
 * PUT /users/me
 */
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, schoolName, classLevel, dateOfBirth, bio } = req.body;

    console.log('=== UPDATE PROFILE REQUEST ===');
    console.log('User ID:', req.user?.id);
    console.log('Request body:', req.body);

    if (fullName !== undefined && !String(fullName).trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Full name cannot be empty' },
      });
    }
    if (classLevel !== undefined && (parseInt(classLevel) < 1 || parseInt(classLevel) > 12)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Class level must be between 1 and 12' },
      });
    }

    const result = await userService.updateOwnProfile(BigInt(req.user!.id), {
      fullName,
      schoolName,
      classLevel: classLevel !== undefined ? parseInt(classLevel) : undefined,
      dateOfBirth,
      bio,
    });

    console.log('Profile update successful:', result);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('Profile update error:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, error: { message: error.message } });
    }
    return res.status(400).json({ success: false, error: { message: error.message } });
  }
};
