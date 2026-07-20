import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    classLevel?: number;
    role?: string;
  }) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Determine role (default to STUDENT)
    const role = data.role?.toUpperCase() || 'STUDENT';
    if (!['STUDENT', 'TEACHER', 'ADMIN', 'PARENT'].includes(role)) {
      throw new Error('Invalid role');
    }

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        role: role as any,
        profile: {
          create: {
            fullName: data.fullName,
            classLevel: data.classLevel || 1,
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        profile: {
          select: {
            fullName: true,
            classLevel: true,
          },
        },
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user.id.toString());

    return { user, accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        profile: {
          select: {
            fullName: true,
            classLevel: true,
            schoolName: true,
            dateOfBirth: true,
            bio: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user.id.toString());

    const { passwordHash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;

      const user = await prisma.user.findUnique({
        where: { id: BigInt(decoded.userId) },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const { accessToken, refreshToken } = this.generateTokens(user.id.toString());

      return { accessToken, refreshToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  private generateTokens(userId: string) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key',
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }
}
