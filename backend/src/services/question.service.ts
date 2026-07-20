import prisma from '../config/database';
import { Prisma, QuestionStatus } from '@prisma/client';

interface QuestionOptionInput {
  optionText: string;
  optionOrder: number;
  isCorrect?: boolean;
}

interface QuestionExplanationInput {
  explanationType?: 'WRONG_ANSWER' | 'CORRECT_ANSWER' | 'HINT';
  explanationText: string;
  displayOrder?: number;
}

export interface QuestionInput {
  questionText: string;
  questionHtml?: string;
  questionImageUrl?: string;
  typeId: number;
  difficultyId: number;
  subjectId: number;
  topicId?: number;
  classLevel: number;
  examCategoryId: number;
  correctAnswer?: string;
  timeLimitSeconds?: number;
  marks?: number;
  negativeMarks?: number;
  tags?: string[];
  status?: QuestionStatus;
  isActive?: boolean;
  createdBy?: bigint;
  updatedBy?: bigint;
  options?: QuestionOptionInput[];
  explanations?: QuestionExplanationInput[];
}

const questionInclude = {
  type: { select: { id: true, typeName: true, typeCode: true } },
  difficulty: { select: { id: true, difficultyName: true, difficultyCode: true, colorHex: true } },
  subject: { select: { id: true, subjectName: true, subjectCode: true } },
  topic: { select: { id: true, topicName: true } },
  examCategory: { select: { id: true, categoryName: true, categoryCode: true } },
  options: { orderBy: { optionOrder: 'asc' as const } },
  explanations: { orderBy: { displayOrder: 'asc' as const } },
};

export class QuestionService {
  async createQuestion(data: QuestionInput) {
    const { options, explanations, ...questionData } = data;

    try {
      const question = await prisma.question.create({
        data: {
          questionText: questionData.questionText,
          questionHtml: questionData.questionHtml,
          questionImageUrl: questionData.questionImageUrl,
          typeId: questionData.typeId,
          difficultyId: questionData.difficultyId,
          subjectId: questionData.subjectId,
          topicId: questionData.topicId,
          classLevel: questionData.classLevel,
          examCategoryId: questionData.examCategoryId,
          correctAnswer: questionData.correctAnswer,
          timeLimitSeconds: questionData.timeLimitSeconds ?? 180,
          marks: questionData.marks ?? 1.0,
          negativeMarks: questionData.negativeMarks ?? 0.0,
          tags: questionData.tags ?? [],
          status: questionData.status ?? QuestionStatus.DRAFT,
          isActive: questionData.isActive ?? true,
          createdBy: questionData.createdBy,
          updatedBy: questionData.createdBy,
          ...(options && options.length > 0
            ? {
                options: {
                  create: options.map((opt) => ({
                    optionText: opt.optionText,
                    optionOrder: opt.optionOrder,
                    isCorrect: opt.isCorrect ?? false,
                  })),
                },
              }
            : {}),
          ...(explanations && explanations.length > 0
            ? {
                explanations: {
                  create: explanations.map((exp, index) => ({
                    explanationType: exp.explanationType ?? 'WRONG_ANSWER',
                    explanationText: exp.explanationText,
                    displayOrder: exp.displayOrder ?? index + 1,
                  })),
                },
              }
            : {}),
        },
        include: questionInclude,
      });

      return question;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new Error('Invalid foreign key reference (subject, topic, examCategory, type, or difficulty not found)');
      }
      throw new Error(`Failed to create question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateQuestion(id: bigint, data: Partial<QuestionInput>) {
    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Question not found');
    }
    if (existing.deletedAt) {
      throw new Error('Cannot update a deleted question');
    }

    const { options, explanations, ...questionData } = data;

    try {
      const question = await prisma.$transaction(async (tx) => {
        if (options) {
          await tx.questionOption.deleteMany({ where: { questionId: id } });
          if (options.length > 0) {
            await tx.questionOption.createMany({
              data: options.map((opt) => ({
                questionId: id,
                optionText: opt.optionText,
                optionOrder: opt.optionOrder,
                isCorrect: opt.isCorrect ?? false,
              })),
            });
          }
        }

        if (explanations) {
          await tx.questionExplanation.deleteMany({ where: { questionId: id } });
          if (explanations.length > 0) {
            await tx.questionExplanation.createMany({
              data: explanations.map((exp, index) => ({
                questionId: id,
                explanationType: exp.explanationType ?? 'WRONG_ANSWER',
                explanationText: exp.explanationText,
                displayOrder: exp.displayOrder ?? index + 1,
              })),
            });
          }
        }

        return tx.question.update({
          where: { id },
          data: {
            ...(questionData.questionText !== undefined && { questionText: questionData.questionText }),
            ...(questionData.questionHtml !== undefined && { questionHtml: questionData.questionHtml }),
            ...(questionData.questionImageUrl !== undefined && { questionImageUrl: questionData.questionImageUrl }),
            ...(questionData.typeId !== undefined && { typeId: questionData.typeId }),
            ...(questionData.difficultyId !== undefined && { difficultyId: questionData.difficultyId }),
            ...(questionData.subjectId !== undefined && { subjectId: questionData.subjectId }),
            ...(questionData.topicId !== undefined && { topicId: questionData.topicId }),
            ...(questionData.classLevel !== undefined && { classLevel: questionData.classLevel }),
            ...(questionData.examCategoryId !== undefined && { examCategoryId: questionData.examCategoryId }),
            ...(questionData.correctAnswer !== undefined && { correctAnswer: questionData.correctAnswer }),
            ...(questionData.timeLimitSeconds !== undefined && { timeLimitSeconds: questionData.timeLimitSeconds }),
            ...(questionData.marks !== undefined && { marks: questionData.marks }),
            ...(questionData.negativeMarks !== undefined && { negativeMarks: questionData.negativeMarks }),
            ...(questionData.tags !== undefined && { tags: questionData.tags }),
            ...(questionData.status !== undefined && { status: questionData.status }),
            ...(questionData.isActive !== undefined && { isActive: questionData.isActive }),
            ...(questionData.updatedBy !== undefined && { updatedBy: questionData.updatedBy }),
          },
          include: questionInclude,
        });
      });

      return question;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') throw new Error('Question not found');
        if (error.code === 'P2003') throw new Error('Invalid foreign key reference (subject, topic, examCategory, type, or difficulty not found)');
      }
      throw new Error(`Failed to update question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteQuestion(id: bigint) {
    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Question not found');
    }
    if (existing.deletedAt) {
      throw new Error('Question is already deleted');
    }

    return prisma.question.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
      select: { id: true, questionText: true, deletedAt: true },
    });
  }

  async getQuestionById(id: bigint) {
    const question = await prisma.question.findUnique({
      where: { id },
      include: questionInclude,
    });

    if (!question) {
      throw new Error('Question not found');
    }

    return question;
  }

  async listQuestions(filters: {
    page?: number;
    limit?: number;
    subjectId?: number;
    topicId?: number;
    examCategoryId?: number;
    classLevel?: number;
    difficultyId?: number;
    typeId?: number;
    status?: QuestionStatus;
    isActive?: boolean;
    includeDeleted?: boolean;
    searchQuery?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'classLevel';
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const {
      page = 1,
      limit = 10,
      subjectId,
      topicId,
      examCategoryId,
      classLevel,
      difficultyId,
      typeId,
      status,
      isActive,
      includeDeleted = false,
      searchQuery,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.QuestionWhereInput = {
      ...(subjectId !== undefined && { subjectId }),
      ...(topicId !== undefined && { topicId }),
      ...(examCategoryId !== undefined && { examCategoryId }),
      ...(classLevel !== undefined && { classLevel }),
      ...(difficultyId !== undefined && { difficultyId }),
      ...(typeId !== undefined && { typeId }),
      ...(status !== undefined && { status }),
      ...(isActive !== undefined && { isActive }),
      ...(!includeDeleted && { deletedAt: null }),
      ...(searchQuery && {
        questionText: { contains: searchQuery, mode: 'insensitive' as Prisma.QueryMode },
      }),
    };

    const [questions, totalCount] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: questionInclude,
      }),
      prisma.question.count({ where }),
    ]);

    return {
      data: questions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit) || 1,
        totalCount,
        limit,
      },
    };
  }

  async getMeta() {
    const [subjects, examCategories, topics, difficultyLevels, questionTypes] = await Promise.all([
      prisma.subject.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }),
      prisma.examCategory.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }),
      prisma.topic.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }),
      prisma.difficultyLevel.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }),
      prisma.questionType.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }),
    ]);

    return { subjects, examCategories, topics, difficultyLevels, questionTypes };
  }
}
