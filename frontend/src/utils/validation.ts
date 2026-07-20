import { z } from 'zod';

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * Registration validation schema
 * Note: role is intentionally not part of self-registration (defaults to
 * STUDENT server-side) to avoid letting anyone sign up as an admin.
 */
export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    classLevel: z.coerce.number().int().min(1, 'Class level must be at least 1').max(12, 'Class level must be at most 12'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * Assessment validation schema
 */
export const assessmentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  passingScore: z.number().min(0).max(100, 'Passing score must be between 0 and 100'),
  scheduledAt: z.string().optional(),
  dueDate: z.string().optional(),
});

/**
 * Question validation schema
 */
export const questionSchema = z.object({
  type: z.enum(['multiple_choice', 'true_false', 'short_answer', 'essay']),
  question: z.string().min(5, 'Question must be at least 5 characters'),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
  points: z.number().min(1, 'Points must be at least 1'),
});

/**
 * Change password validation schema
 */
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(6, 'Password must be at least 6 characters'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * Profile update validation schema
 */
export const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});
