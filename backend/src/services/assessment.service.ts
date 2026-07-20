import prisma from '../config/database';
import { TestType, AccessLevel, Prisma } from '@prisma/client';

/**
 * Assessment Service
 * Handles all CRUD operations and business logic for tests/assessments
 */
export class AssessmentService {
  /**
   * Create a new assessment/test with optional questions
   */
  async createAssessment(data: {
    testName?: string;
    testType: TestType;
    testConfig: any;
    subjectId?: number;
    examCategoryId?: number;
    classLevel?: number;
    accessLevel?: AccessLevel;
    pointsCost?: number;
    isTemplate?: boolean;
    isActive?: boolean;
    createdBy?: bigint;
    questionIds?: bigint[];
  }) {
    try {
      const { questionIds, ...testData } = data;

      // Create test with optional questions
      const test = await prisma.test.create({
        data: {
          testName: testData.testName,
          testType: testData.testType,
          testConfig: testData.testConfig,
          subjectId: testData.subjectId,
          examCategoryId: testData.examCategoryId,
          classLevel: testData.classLevel,
          accessLevel: testData.accessLevel || AccessLevel.FREE,
          pointsCost: testData.pointsCost || 0,
          isTemplate: testData.isTemplate || false,
          isActive: testData.isActive !== undefined ? testData.isActive : true,
          createdBy: testData.createdBy,
          // Add questions if provided
          ...(questionIds && questionIds.length > 0
            ? {
                testQuestions: {
                  create: questionIds.map((questionId, index) => ({
                    questionId,
                    questionOrder: index + 1,
                    marks: 1.0,
                    negativeMarks: 0.0,
                  })),
                },
              }
            : {}),
        },
        include: {
          subject: {
            select: {
              id: true,
              subjectName: true,
              subjectCode: true,
            },
          },
          examCategory: {
            select: {
              id: true,
              categoryName: true,
              categoryCode: true,
            },
          },
          creator: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          testQuestions: {
            include: {
              question: {
                include: {
                  type: true,
                  difficulty: true,
                  options: true,
                },
              },
            },
            orderBy: {
              questionOrder: 'asc',
            },
          },
        },
      });

      return test;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('A test with this configuration already exists');
        }
        if (error.code === 'P2003') {
          throw new Error('Invalid foreign key reference (subject, examCategory, or question not found)');
        }
      }
      throw new Error(`Failed to create assessment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing assessment
   */
  async updateAssessment(
    id: bigint,
    data: {
      testName?: string;
      testType?: TestType;
      testConfig?: any;
      subjectId?: number;
      examCategoryId?: number;
      classLevel?: number;
      accessLevel?: AccessLevel;
      pointsCost?: number;
      isTemplate?: boolean;
      isActive?: boolean;
    }
  ) {
    try {
      // Check if test exists
      const existingTest = await prisma.test.findUnique({
        where: { id },
      });

      if (!existingTest) {
        throw new Error('Assessment not found');
      }

      if (existingTest.deletedAt) {
        throw new Error('Cannot update a deleted assessment');
      }

      // Update test
      const updatedTest = await prisma.test.update({
        where: { id },
        data: {
          ...(data.testName !== undefined && { testName: data.testName }),
          ...(data.testType !== undefined && { testType: data.testType }),
          ...(data.testConfig !== undefined && { testConfig: data.testConfig }),
          ...(data.subjectId !== undefined && { subjectId: data.subjectId }),
          ...(data.examCategoryId !== undefined && { examCategoryId: data.examCategoryId }),
          ...(data.classLevel !== undefined && { classLevel: data.classLevel }),
          ...(data.accessLevel !== undefined && { accessLevel: data.accessLevel }),
          ...(data.pointsCost !== undefined && { pointsCost: data.pointsCost }),
          ...(data.isTemplate !== undefined && { isTemplate: data.isTemplate }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
        include: {
          subject: {
            select: {
              id: true,
              subjectName: true,
              subjectCode: true,
            },
          },
          examCategory: {
            select: {
              id: true,
              categoryName: true,
              categoryCode: true,
            },
          },
          creator: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          testQuestions: {
            include: {
              question: {
                include: {
                  type: true,
                  difficulty: true,
                  options: true,
                },
              },
            },
            orderBy: {
              questionOrder: 'asc',
            },
          },
        },
      });

      return updatedTest;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Assessment not found');
        }
        if (error.code === 'P2003') {
          throw new Error('Invalid foreign key reference (subject or examCategory not found)');
        }
      }
      throw new Error(`Failed to update assessment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Soft delete an assessment
   */
  async deleteAssessment(id: bigint) {
    try {
      // Check if test exists
      const existingTest = await prisma.test.findUnique({
        where: { id },
      });

      if (!existingTest) {
        throw new Error('Assessment not found');
      }

      if (existingTest.deletedAt) {
        throw new Error('Assessment is already deleted');
      }

      // Soft delete
      const deletedTest = await prisma.test.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
        select: {
          id: true,
          testName: true,
          deletedAt: true,
        },
      });

      return deletedTest;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Assessment not found');
        }
      }
      throw new Error(`Failed to delete assessment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a single assessment by ID with all relations
   */
  async getAssessmentById(id: bigint) {
    try {
      const test = await prisma.test.findUnique({
        where: { id },
        include: {
          subject: {
            select: {
              id: true,
              subjectName: true,
              subjectCode: true,
              iconUrl: true,
              colorHex: true,
            },
          },
          examCategory: {
            select: {
              id: true,
              categoryName: true,
              categoryCode: true,
              iconUrl: true,
            },
          },
          creator: {
            select: {
              id: true,
              email: true,
              role: true,
              profile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          testQuestions: {
            include: {
              question: {
                include: {
                  type: {
                    select: {
                      typeName: true,
                      typeCode: true,
                    },
                  },
                  difficulty: {
                    select: {
                      difficultyName: true,
                      difficultyCode: true,
                      colorHex: true,
                      pointsMultiplier: true,
                    },
                  },
                  subject: {
                    select: {
                      subjectName: true,
                      subjectCode: true,
                    },
                  },
                  topic: {
                    select: {
                      topicName: true,
                      topicCode: true,
                    },
                  },
                  options: {
                    orderBy: {
                      optionOrder: 'asc',
                    },
                  },
                  explanations: {
                    orderBy: {
                      displayOrder: 'asc',
                    },
                  },
                },
              },
            },
            orderBy: {
              questionOrder: 'asc',
            },
          },
          _count: {
            select: {
              testAttempts: true,
              testQuestions: true,
            },
          },
        },
      });

      if (!test) {
        throw new Error('Assessment not found');
      }

      return test;
    } catch (error) {
      throw new Error(`Failed to fetch assessment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List assessments with pagination and filtering
   */
  async listAssessments(filters: {
    page?: number;
    limit?: number;
    subjectId?: number;
    examCategoryId?: number;
    classLevel?: number;
    testType?: TestType;
    accessLevel?: AccessLevel;
    createdBy?: bigint;
    isTemplate?: boolean;
    isActive?: boolean;
    includeDeleted?: boolean;
    searchQuery?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'testName';
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        subjectId,
        examCategoryId,
        classLevel,
        testType,
        accessLevel,
        createdBy,
        isTemplate,
        isActive,
        includeDeleted = false,
        searchQuery,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = filters;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.TestWhereInput = {
        ...(subjectId !== undefined && { subjectId }),
        ...(examCategoryId !== undefined && { examCategoryId }),
        ...(classLevel !== undefined && { classLevel }),
        ...(testType !== undefined && { testType }),
        ...(accessLevel !== undefined && { accessLevel }),
        ...(createdBy !== undefined && { createdBy }),
        ...(isTemplate !== undefined && { isTemplate }),
        ...(isActive !== undefined && { isActive }),
        ...(!includeDeleted && { deletedAt: null }),
        ...(searchQuery && {
          testName: {
            contains: searchQuery,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        }),
      };

      // Execute query with pagination
      const [tests, totalCount] = await Promise.all([
        prisma.test.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
          include: {
            subject: {
              select: {
                id: true,
                subjectName: true,
                subjectCode: true,
                iconUrl: true,
                colorHex: true,
              },
            },
            examCategory: {
              select: {
                id: true,
                categoryName: true,
                categoryCode: true,
                iconUrl: true,
              },
            },
            creator: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
            _count: {
              select: {
                testQuestions: true,
                testAttempts: true,
              },
            },
          },
        }),
        prisma.test.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: tests,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Failed to list assessments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add questions to an assessment
   */
  async addQuestionsToAssessment(
    testId: bigint,
    questionIds: bigint[],
    options?: {
      marks?: number;
      negativeMarks?: number;
      startOrder?: number;
    }
  ) {
    try {
      // Check if test exists
      const test = await prisma.test.findUnique({
        where: { id: testId },
        include: {
          testQuestions: {
            orderBy: {
              questionOrder: 'desc',
            },
            take: 1,
          },
        },
      });

      if (!test) {
        throw new Error('Assessment not found');
      }

      if (test.deletedAt) {
        throw new Error('Cannot add questions to a deleted assessment');
      }

      // Verify all questions exist and are active
      const questions = await prisma.question.findMany({
        where: {
          id: { in: questionIds },
          isActive: true,
          deletedAt: null,
        },
      });

      if (questions.length !== questionIds.length) {
        throw new Error('Some questions not found or are inactive');
      }

      // Check for duplicate questions
      const existingTestQuestions = await prisma.testQuestion.findMany({
        where: {
          testId,
          questionId: { in: questionIds },
        },
      });

      if (existingTestQuestions.length > 0) {
        throw new Error('Some questions are already in this assessment');
      }

      // Get the last question order
      const lastOrder = test.testQuestions[0]?.questionOrder || 0;
      const startOrder = options?.startOrder || lastOrder + 1;

      // Add questions
      const testQuestions = await prisma.$transaction(
        questionIds.map((questionId, index) =>
          prisma.testQuestion.create({
            data: {
              testId,
              questionId,
              questionOrder: startOrder + index,
              marks: options?.marks || 1.0,
              negativeMarks: options?.negativeMarks || 0.0,
            },
            include: {
              question: {
                include: {
                  type: true,
                  difficulty: true,
                  options: true,
                },
              },
            },
          })
        )
      );

      return testQuestions;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Question already exists in this assessment');
        }
        if (error.code === 'P2003') {
          throw new Error('Invalid question ID');
        }
      }
      throw new Error(`Failed to add questions to assessment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove a question from an assessment
   */
  async removeQuestionFromAssessment(testId: bigint, questionId: bigint) {
    try {
      // Check if test exists
      const test = await prisma.test.findUnique({
        where: { id: testId },
      });

      if (!test) {
        throw new Error('Assessment not found');
      }

      if (test.deletedAt) {
        throw new Error('Cannot modify a deleted assessment');
      }

      // Find and delete the test question
      const testQuestion = await prisma.testQuestion.findUnique({
        where: {
          testId_questionId: {
            testId,
            questionId,
          },
        },
      });

      if (!testQuestion) {
        throw new Error('Question not found in this assessment');
      }

      // Delete the test question and reorder remaining questions
      await prisma.$transaction(async (tx) => {
        // Delete the question
        await tx.testQuestion.delete({
          where: {
            testId_questionId: {
              testId,
              questionId,
            },
          },
        });

        // Get all remaining questions
        const remainingQuestions = await tx.testQuestion.findMany({
          where: { testId },
          orderBy: { questionOrder: 'asc' },
        });

        // Reorder questions
        await Promise.all(
          remainingQuestions.map((tq, index) =>
            tx.testQuestion.update({
              where: { id: tq.id },
              data: { questionOrder: index + 1 },
            })
          )
        );
      });

      return { success: true, message: 'Question removed successfully' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Question not found in this assessment');
        }
      }
      throw new Error(`Failed to remove question from assessment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reorder questions in an assessment
   */
  async reorderQuestions(
    testId: bigint,
    questionOrders: Array<{ questionId: bigint; newOrder: number }>
  ) {
    try {
      // Check if test exists
      const test = await prisma.test.findUnique({
        where: { id: testId },
        include: {
          testQuestions: true,
        },
      });

      if (!test) {
        throw new Error('Assessment not found');
      }

      if (test.deletedAt) {
        throw new Error('Cannot modify a deleted assessment');
      }

      // Verify all question IDs belong to this test
      const testQuestionIds = test.testQuestions.map((tq) => tq.questionId);
      const providedQuestionIds = questionOrders.map((qo) => qo.questionId);

      const invalidIds = providedQuestionIds.filter((id) => !testQuestionIds.includes(id));
      if (invalidIds.length > 0) {
        throw new Error('Some questions do not belong to this assessment');
      }

      // Validate orders (no duplicates, continuous sequence)
      const orders = questionOrders.map((qo) => qo.newOrder);
      const uniqueOrders = new Set(orders);
      if (uniqueOrders.size !== orders.length) {
        throw new Error('Duplicate question orders provided');
      }

      // Update question orders in a transaction
      await prisma.$transaction(
        questionOrders.map(({ questionId, newOrder }) =>
          prisma.testQuestion.update({
            where: {
              testId_questionId: {
                testId,
                questionId,
              },
            },
            data: {
              questionOrder: newOrder,
            },
          })
        )
      );

      // Fetch and return updated test with questions
      const updatedTest = await prisma.test.findUnique({
        where: { id: testId },
        include: {
          testQuestions: {
            include: {
              question: {
                include: {
                  type: true,
                  difficulty: true,
                  options: true,
                },
              },
            },
            orderBy: {
              questionOrder: 'asc',
            },
          },
        },
      });

      return updatedTest;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Duplicate question order detected');
        }
      }
      throw new Error(`Failed to reorder questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Duplicate/clone an existing assessment
   */
  async duplicateAssessment(
    id: bigint,
    options?: {
      newTestName?: string;
      includeQuestions?: boolean;
      createdBy?: bigint;
    }
  ) {
    try {
      // Fetch the original test with all questions
      const originalTest = await prisma.test.findUnique({
        where: { id },
        include: {
          testQuestions: {
            include: {
              question: true,
            },
            orderBy: {
              questionOrder: 'asc',
            },
          },
        },
      });

      if (!originalTest) {
        throw new Error('Assessment not found');
      }

      // Prepare new test name
      const newTestName =
        options?.newTestName || `${originalTest.testName || 'Untitled Test'} (Copy)`;

      const includeQuestions = options?.includeQuestions !== false;

      // Create duplicate test
      const duplicatedTest = await prisma.test.create({
        data: {
          testName: newTestName,
          testType: originalTest.testType,
          testConfig: originalTest.testConfig as any,
          subjectId: originalTest.subjectId,
          examCategoryId: originalTest.examCategoryId,
          classLevel: originalTest.classLevel,
          accessLevel: originalTest.accessLevel,
          pointsCost: originalTest.pointsCost,
          isTemplate: originalTest.isTemplate,
          isActive: originalTest.isActive,
          createdBy: options?.createdBy || originalTest.createdBy,
          // Include questions if requested
          ...(includeQuestions && originalTest.testQuestions.length > 0
            ? {
                testQuestions: {
                  create: originalTest.testQuestions.map((tq) => ({
                    questionId: tq.questionId,
                    questionOrder: tq.questionOrder,
                    marks: tq.marks,
                    negativeMarks: tq.negativeMarks,
                  })),
                },
              }
            : {}),
        },
        include: {
          subject: {
            select: {
              id: true,
              subjectName: true,
              subjectCode: true,
            },
          },
          examCategory: {
            select: {
              id: true,
              categoryName: true,
              categoryCode: true,
            },
          },
          creator: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          testQuestions: {
            include: {
              question: {
                include: {
                  type: true,
                  difficulty: true,
                  options: true,
                },
              },
            },
            orderBy: {
              questionOrder: 'asc',
            },
          },
          _count: {
            select: {
              testQuestions: true,
            },
          },
        },
      });

      return duplicatedTest;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new Error('Invalid foreign key reference during duplication');
        }
      }
      throw new Error(`Failed to duplicate assessment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get assessment statistics
   */
  async getAssessmentStatistics(testId: bigint) {
    try {
      const test = await prisma.test.findUnique({
        where: { id: testId },
        include: {
          _count: {
            select: {
              testQuestions: true,
              testAttempts: true,
            },
          },
          testAttempts: {
            where: {
              status: 'COMPLETED',
            },
            select: {
              score: true,
              percentage: true,
              timeTakenSeconds: true,
            },
          },
        },
      });

      if (!test) {
        throw new Error('Assessment not found');
      }

      const completedAttempts = test.testAttempts;
      const totalAttempts = completedAttempts.length;

      let avgScore = 0;
      let avgPercentage = 0;
      let avgTimeTaken = 0;

      if (totalAttempts > 0) {
        avgScore =
          completedAttempts.reduce((sum, attempt) => sum + Number(attempt.score), 0) /
          totalAttempts;
        avgPercentage =
          completedAttempts.reduce((sum, attempt) => sum + Number(attempt.percentage), 0) /
          totalAttempts;
        avgTimeTaken =
          completedAttempts.reduce(
            (sum, attempt) => sum + (attempt.timeTakenSeconds || 0),
            0
          ) / totalAttempts;
      }

      return {
        testId,
        totalQuestions: test._count.testQuestions,
        totalAttempts,
        completedAttempts: totalAttempts,
        averageScore: Math.round(avgScore * 100) / 100,
        averagePercentage: Math.round(avgPercentage * 100) / 100,
        averageTimeTakenSeconds: Math.round(avgTimeTaken),
      };
    } catch (error) {
      throw new Error(`Failed to get assessment statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
