import prisma from '../config/database';
import { Prisma, UserRole, UserStatus } from '@prisma/client';

const userSelect = {
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
};

export class UserService {
  async listUsers(filters: {
    page?: number;
    limit?: number;
    role?: UserRole;
    status?: UserStatus;
    search?: string;
  } = {}) {
    const { page = 1, limit = 10, role, status, search } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(role !== undefined && { role }),
      ...(status !== undefined && { status }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
          { profile: { fullName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } } },
        ],
      }),
    };

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: userSelect,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit) || 1,
        totalCount,
        limit,
      },
    };
  }

  async getUserById(id: bigint) {
    const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateUser(id: bigint, data: { role?: UserRole; status?: UserStatus }) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('User not found');
    }
    if (existing.deletedAt) {
      throw new Error('Cannot update a deleted user');
    }

    return prisma.user.update({
      where: { id },
      data: {
        ...(data.role !== undefined && { role: data.role }),
        ...(data.status !== undefined && { status: data.status }),
      },
      select: userSelect,
    });
  }

  async deleteUser(id: bigint) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('User not found');
    }
    if (existing.deletedAt) {
      throw new Error('User is already deleted');
    }

    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: UserStatus.INACTIVE },
      select: { id: true, email: true, deletedAt: true },
    });
  }

  async updateOwnProfile(
    userId: bigint,
    data: {
      fullName?: string;
      schoolName?: string;
      classLevel?: number;
      dateOfBirth?: string;
      bio?: string;
      preferences?: any;
    }
  ) {
    console.log('=== updateOwnProfile Service ===');
    console.log('User ID:', userId.toString());
    console.log('Data to update:', data);

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing || existing.deletedAt) {
      throw new Error('User not found');
    }

    console.log('User exists, updating profile...');

    // Use upsert to create profile if it doesn't exist, or update if it does
    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        fullName: data.fullName || '',
        schoolName: data.schoolName,
        classLevel: data.classLevel || 1,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        bio: data.bio,
      },
      update: {
        ...(data.fullName !== undefined && { fullName: data.fullName }),
        ...(data.schoolName !== undefined && { schoolName: data.schoolName }),
        ...(data.classLevel !== undefined && { classLevel: data.classLevel }),
        ...(data.dateOfBirth !== undefined && {
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.preferences !== undefined && { preferences: data.preferences }),
      },
    });

    console.log('Profile updated:', updatedProfile);

    const result = await this.getUserById(userId);
    console.log('Returning user with updated profile:', result);
    return result;
  }

  async getUserStats() {
    const [totalStudents, totalTeachers, totalAdmins, totalParents] = await Promise.all([
      prisma.user.count({ where: { role: UserRole.STUDENT, deletedAt: null } }),
      prisma.user.count({ where: { role: UserRole.TEACHER, deletedAt: null } }),
      prisma.user.count({ where: { role: UserRole.ADMIN, deletedAt: null } }),
      prisma.user.count({ where: { role: UserRole.PARENT, deletedAt: null } }),
    ]);

    return {
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalParents,
      totalUsers: totalStudents + totalTeachers + totalAdmins + totalParents,
    };
  }
}
