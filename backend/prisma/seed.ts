import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Boards
  const cbse = await prisma.board.upsert({
    where: { boardCode: 'CBSE' },
    update: {},
    create: { boardName: 'CBSE', boardCode: 'CBSE', displayOrder: 1 },
  });
  await prisma.board.upsert({
    where: { boardCode: 'ICSE' },
    update: {},
    create: { boardName: 'ICSE', boardCode: 'ICSE', displayOrder: 2 },
  });

  // Exam Categories
  const mathOlympiad = await prisma.examCategory.upsert({
    where: { categoryCode: 'MATH_OLYMPIAD' },
    update: {},
    create: {
      categoryName: 'Math Olympiad',
      categoryCode: 'MATH_OLYMPIAD',
      description: 'Math Olympiad style competitive exam questions',
      displayOrder: 1,
    },
  });
  await prisma.examCategory.upsert({
    where: { categoryCode: 'CBSE_BOARD' },
    update: {},
    create: {
      categoryName: 'CBSE Board',
      categoryCode: 'CBSE_BOARD',
      description: 'CBSE curriculum-aligned questions',
      displayOrder: 2,
    },
  });

  // Subjects
  const mathematics = await prisma.subject.upsert({
    where: { subjectCode: 'MATH' },
    update: {},
    create: {
      subjectName: 'Mathematics',
      subjectCode: 'MATH',
      colorHex: '#2563eb',
      displayOrder: 1,
    },
  });
  await prisma.subject.upsert({
    where: { subjectCode: 'SCIENCE' },
    update: {},
    create: {
      subjectName: 'Science',
      subjectCode: 'SCIENCE',
      colorHex: '#16a34a',
      displayOrder: 2,
    },
  });
  await prisma.subject.upsert({
    where: { subjectCode: 'ENGLISH' },
    update: {},
    create: {
      subjectName: 'English',
      subjectCode: 'ENGLISH',
      colorHex: '#d97706',
      displayOrder: 3,
    },
  });

  // Topics (under Mathematics)
  const existingTopics = await prisma.topic.findMany({ where: { subjectId: mathematics.id } });
  if (existingTopics.length === 0) {
    await prisma.topic.createMany({
      data: [
        { subjectId: mathematics.id, topicName: 'Arithmetic', classLevel: 5, displayOrder: 1 },
        { subjectId: mathematics.id, topicName: 'Algebra', classLevel: 8, displayOrder: 2 },
        { subjectId: mathematics.id, topicName: 'Geometry', classLevel: 8, displayOrder: 3 },
      ],
    });
  }

  // Difficulty Levels
  await prisma.difficultyLevel.upsert({
    where: { difficultyCode: 'EASY' },
    update: {},
    create: { difficultyName: 'Easy', difficultyCode: 'EASY', pointsMultiplier: 1.0, displayOrder: 1, colorHex: '#16a34a' },
  });
  await prisma.difficultyLevel.upsert({
    where: { difficultyCode: 'MEDIUM' },
    update: {},
    create: { difficultyName: 'Medium', difficultyCode: 'MEDIUM', pointsMultiplier: 1.5, displayOrder: 2, colorHex: '#d97706' },
  });
  await prisma.difficultyLevel.upsert({
    where: { difficultyCode: 'HARD' },
    update: {},
    create: { difficultyName: 'Hard', difficultyCode: 'HARD', pointsMultiplier: 2.0, displayOrder: 3, colorHex: '#dc2626' },
  });

  // Question Types (codes match frontend QuestionType enum values)
  await prisma.questionType.upsert({
    where: { typeCode: 'multiple_choice' },
    update: {},
    create: { typeName: 'Multiple Choice', typeCode: 'multiple_choice', displayOrder: 1 },
  });
  await prisma.questionType.upsert({
    where: { typeCode: 'true_false' },
    update: {},
    create: { typeName: 'True / False', typeCode: 'true_false', displayOrder: 2 },
  });
  await prisma.questionType.upsert({
    where: { typeCode: 'short_answer' },
    update: {},
    create: { typeName: 'Short Answer', typeCode: 'short_answer', displayOrder: 3 },
  });
  await prisma.questionType.upsert({
    where: { typeCode: 'essay' },
    update: {},
    create: { typeName: 'Essay', typeCode: 'essay', displayOrder: 4 },
  });

  console.log('Seed data created:', { cbse: cbse.boardCode, mathOlympiad: mathOlympiad.categoryCode });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
