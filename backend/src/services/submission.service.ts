import prisma from '../config/database';
import { AttemptStatus, Prisma } from '@prisma/client';

const attemptListInclude = {
  test: {
    select: {
      id: true,
      testName: true,
      testType: true,
      testConfig: true,
      subject: { select: { id: true, subjectName: true } },
    },
  },
  user: {
    select: {
      id: true,
      email: true,
      profile: { select: { fullName: true } },
    },
  },
};

export class SubmissionService {
  /**
   * Start a new test attempt for a student.
   */
  async startAttempt(testId: bigint, userId: bigint) {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        testQuestions: {
          include: {
            question: {
              include: {
                type: { select: { typeCode: true, typeName: true } },
                options: {
                  orderBy: { optionOrder: 'asc' },
                  select: { id: true, optionText: true, optionOrder: true },
                },
              },
            },
          },
          orderBy: { questionOrder: 'asc' },
        },
      },
    });

    if (!test || test.deletedAt) {
      throw new Error('Assessment not found');
    }
    if (!test.isActive) {
      throw new Error('This assessment is not available');
    }
    if (test.testQuestions.length === 0) {
      throw new Error('This assessment has no questions yet');
    }

    // Resume an existing in-progress attempt instead of creating a duplicate
    const existing = await prisma.testAttempt.findFirst({
      where: { testId, userId, status: AttemptStatus.IN_PROGRESS },
      include: {
        test: {
          select: {
            id: true,
            testName: true,
            testType: true,
            testConfig: true,
          },
        },
      },
    });

    // Check if existing attempt has expired
    if (existing) {
      const testDurationMinutes = (test.testConfig as any)?.duration || 60;
      const testDurationMs = testDurationMinutes * 60 * 1000;
      const elapsedMs = Date.now() - existing.startedAt.getTime();

      // If time expired, auto-submit the old attempt
      if (elapsedMs >= testDurationMs) {
        await prisma.testAttempt.update({
          where: { id: existing.id },
          data: {
            status: AttemptStatus.COMPLETED,
            submittedAt: new Date(),
            timeTakenSeconds: Math.round(elapsedMs / 1000),
          },
        });
        // Don't return the expired attempt, create a new one below
      } else {
        // Valid in-progress attempt, return it
        const maxScore = test.testQuestions.reduce((sum, tq) => sum + Number(tq.marks), 0);
        return {
          attempt: existing,
          questions: test.testQuestions.map((tq) => ({
            testQuestionId: tq.id.toString(),
            questionId: tq.question.id.toString(),
            questionOrder: tq.questionOrder,
            marks: Number(tq.marks),
            negativeMarks: Number(tq.negativeMarks),
            questionText: tq.question.questionText,
            questionImageUrl: tq.question.questionImageUrl,
            type: tq.question.type,
            options: tq.question.options.map((o) => ({
              id: o.id.toString(),
              optionText: o.optionText,
              optionOrder: o.optionOrder,
            })),
          })),
        };
      }
    }

    const maxScore = test.testQuestions.reduce((sum, tq) => sum + Number(tq.marks), 0);

    // Create new attempt
    const attempt = await prisma.testAttempt.create({
      data: {
        testId,
        userId,
        status: AttemptStatus.IN_PROGRESS,
        totalQuestions: test.testQuestions.length,
        maxScore,
      },
      include: {
        test: {
          select: {
            id: true,
            testName: true,
            testType: true,
            testConfig: true,
          },
        },
      },
    });

    return {
      attempt,
      questions: test.testQuestions.map((tq) => ({
        testQuestionId: tq.id.toString(),
        questionId: tq.question.id.toString(),
        questionOrder: tq.questionOrder,
        marks: Number(tq.marks),
        negativeMarks: Number(tq.negativeMarks),
        questionText: tq.question.questionText,
        questionImageUrl: tq.question.questionImageUrl,
        type: tq.question.type,
        options: tq.question.options.map((o) => ({
          id: o.id.toString(),
          optionText: o.optionText,
          optionOrder: o.optionOrder,
        })),
      })),
    };
  }

  /**
   * Submit/update the answer for a single question within an in-progress attempt.
   * Auto-grades objective question types (multiple_choice / true_false) immediately.
   */
  async submitAnswer(
    attemptId: bigint,
    userId: bigint,
    data: {
      questionId: bigint;
      selectedOptionId?: bigint;
      textAnswer?: string;
      timeTakenSeconds?: number;
    }
  ) {
    const attempt = await prisma.testAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt) {
      throw new Error('Attempt not found');
    }
    if (attempt.userId !== userId) {
      throw new Error('Not authorized to answer for this attempt');
    }
    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new Error('This attempt has already been submitted');
    }

    const testQuestion = await prisma.testQuestion.findFirst({
      where: { testId: attempt.testId, questionId: data.questionId },
    });
    if (!testQuestion) {
      throw new Error('Question does not belong to this assessment');
    }

    const question = await prisma.question.findUnique({
      where: { id: data.questionId },
      include: { type: true, options: true },
    });
    if (!question) {
      throw new Error('Question not found');
    }

    const marksPossible = Number(testQuestion.marks);
    let isCorrect: boolean | null = null;
    let marksAwarded = 0;

    if (data.selectedOptionId) {
      const option = question.options.find((o) => o.id === data.selectedOptionId);
      if (option) {
        isCorrect = option.isCorrect;
        marksAwarded = option.isCorrect ? marksPossible : -Number(testQuestion.negativeMarks);
      }
    } else if (data.textAnswer !== undefined && question.correctAnswer) {
      isCorrect =
        data.textAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
      marksAwarded = isCorrect ? marksPossible : 0;
    }

    const response = await prisma.testResponse.upsert({
      where: { attemptId_questionId: { attemptId, questionId: data.questionId } },
      create: {
        attemptId,
        questionId: data.questionId,
        selectedOptionId: data.selectedOptionId,
        textAnswer: data.textAnswer,
        isCorrect,
        marksAwarded,
        marksPossible,
        timeTakenSeconds: data.timeTakenSeconds,
      },
      update: {
        selectedOptionId: data.selectedOptionId,
        textAnswer: data.textAnswer,
        isCorrect,
        marksAwarded,
        marksPossible,
        timeTakenSeconds: data.timeTakenSeconds,
      },
    });

    return response;
  }

  /**
   * Finalize an attempt: aggregate all responses into the attempt's summary fields.
   */
  async submitAttempt(attemptId: bigint, userId: bigint) {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: { responses: true },
    });
    if (!attempt) {
      throw new Error('Attempt not found');
    }
    if (attempt.userId !== userId) {
      throw new Error('Not authorized to submit this attempt');
    }
    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new Error('This attempt has already been submitted');
    }

    const attemptedQuestions = attempt.responses.length;
    const correctAnswers = attempt.responses.filter((r) => r.isCorrect === true).length;
    const wrongAnswers = attempt.responses.filter((r) => r.isCorrect === false).length;
    const unattempted = attempt.totalQuestions - attemptedQuestions;
    const score = attempt.responses.reduce((sum, r) => sum + Number(r.marksAwarded), 0);
    const maxScore = Number(attempt.maxScore);
    const percentage = maxScore > 0 ? Math.max(0, (score / maxScore) * 100) : 0;
    const timeTakenSeconds = Math.round((Date.now() - attempt.startedAt.getTime()) / 1000);

    const updated = await prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        status: AttemptStatus.COMPLETED,
        submittedAt: new Date(),
        timeTakenSeconds,
        attemptedQuestions,
        correctAnswers,
        wrongAnswers,
        unattempted,
        score,
        percentage,
      },
    });

    return updated;
  }

  /**
   * Get a single attempt's full detail (owner or admin).
   */
  async getAttemptById(attemptId: bigint) {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        ...attemptListInclude,
        responses: {
          include: {
            question: {
              select: {
                questionText: true,
                correctAnswer: true,
                explanations: {
                  orderBy: { displayOrder: 'asc' },
                },
              }
            },
            selectedOption: { select: { optionText: true } },
          },
        },
      },
    });
    if (!attempt) {
      throw new Error('Attempt not found');
    }
    return attempt;
  }

  /**
   * List attempts for a specific student.
   */
  async listByStudent(userId: bigint, status?: AttemptStatus) {
    return prisma.testAttempt.findMany({
      where: { userId, ...(status && { status }) },
      include: attemptListInclude,
      orderBy: { startedAt: 'desc' },
    });
  }

  /**
   * List all attempts across the platform (admin), with pagination/filtering.
   */
  async listAll(filters: {
    page?: number;
    limit?: number;
    testId?: bigint;
    userId?: bigint;
    status?: AttemptStatus;
  } = {}) {
    const { page = 1, limit = 10, testId, userId, status } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.TestAttemptWhereInput = {
      ...(testId && { testId }),
      ...(userId && { userId }),
      ...(status && { status }),
    };

    const [attempts, totalCount] = await Promise.all([
      prisma.testAttempt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
        include: attemptListInclude,
      }),
      prisma.testAttempt.count({ where }),
    ]);

    return {
      data: attempts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit) || 1,
        totalCount,
        limit,
      },
    };
  }

  /**
   * Aggregate stats for the admin dashboard/analytics.
   */
  async getStats() {
    const [totalSubmissions, completedAttempts] = await Promise.all([
      prisma.testAttempt.count({ where: { status: AttemptStatus.COMPLETED } }),
      prisma.testAttempt.findMany({
        where: { status: AttemptStatus.COMPLETED },
        select: { percentage: true },
      }),
    ]);

    const averagePercentage =
      completedAttempts.length > 0
        ? completedAttempts.reduce((sum, a) => sum + Number(a.percentage), 0) /
          completedAttempts.length
        : 0;

    return {
      totalSubmissions,
      averagePercentage: Math.round(averagePercentage * 100) / 100,
    };
  }
}
