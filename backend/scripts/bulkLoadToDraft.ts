import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { PrismaClient } from '@prisma/client';
// @ts-ignore
import { JSDOM } from 'jsdom';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

interface QuestionData {
  questionText: string;
  options: { text: string; isCorrect: boolean }[];
  correctAnswer?: string;
  explanation?: string;
}

interface HTMLMetadata {
  title?: string;
  subtitle?: string;
  questionCount?: number;
  suggestedClassLevel?: number;
  suggestedSubject?: string;
}

interface UserInputs {
  subjectId: number;
  subjectName: string;
  topicId?: number;
  topicName?: string;
  classLevel: number;
  examCategoryId: number;
  examCategoryName: string;
  typeId: number;
  typeName: string;
  difficultyId: number;
  difficultyName: string;
  marks: number;
  negativeMarks: number;
  createdBy: number;
}

// [Keep all the helper functions from bulkLoadInteractive.ts - extractHTMLMetadata, createInterface, askQuestion, get* functions, collectUserInputs, parseQuestionsFromHTMLJavaScript]

function extractHTMLMetadata(htmlContent: string): HTMLMetadata {
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;

  const metadata: HTMLMetadata = {};

  const titleEl = document.querySelector('title');
  if (titleEl) {
    metadata.title = titleEl.textContent?.trim();
  }

  const h1El = document.querySelector('h1');
  if (h1El) {
    metadata.title = h1El.textContent?.trim();
  }

  const subtitleEl = document.querySelector('.subtitle');
  if (subtitleEl) {
    metadata.subtitle = subtitleEl.textContent?.trim();
    const classMatch = metadata.subtitle.match(/(?:Class|Std|Standard)\s*(\d+)/i);
    if (classMatch) {
      metadata.suggestedClassLevel = parseInt(classMatch[1]);
    }
  }

  const quizDataMatch = htmlContent.match(/const\s+quizData\s*=\s*(\[[\s\S]*?\]);/);
  if (quizDataMatch) {
    try {
      const quizData = JSON.parse(quizDataMatch[1]);
      metadata.questionCount = quizData.length;
    } catch (e) {}
  }

  const pathMatch = htmlContent.match(/Std(\d+)|Class(\d+)/i);
  if (pathMatch) {
    metadata.suggestedClassLevel = parseInt(pathMatch[1] || pathMatch[2]);
  }

  const subjects = ['Mathematics', 'Maths', 'Science', 'English', 'Social', 'Hindi'];
  for (const subject of subjects) {
    if (htmlContent.toLowerCase().includes(subject.toLowerCase())) {
      metadata.suggestedSubject = subject;
      break;
    }
  }

  return metadata;
}

function createInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function getSubjects(): Promise<any[]> {
  return await prisma.subject.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  });
}

async function getExamCategories(): Promise<any[]> {
  return await prisma.examCategory.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  });
}

async function getQuestionTypes(): Promise<any[]> {
  return await prisma.questionType.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  });
}

async function getDifficultyLevels(): Promise<any[]> {
  return await prisma.difficultyLevel.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  });
}

async function getTopics(subjectId: number): Promise<any[]> {
  return await prisma.topic.findMany({
    where: { subjectId, isActive: true },
    orderBy: { displayOrder: 'asc' },
  });
}

async function getAdminUser(): Promise<any> {
  const user = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });
  return user;
}

async function collectUserInputs(metadata: HTMLMetadata): Promise<UserInputs> {
  const rl = createInterface();

  console.log('\n' + '='.repeat(60));
  console.log('📚 INTERACTIVE BULK LOAD - Question Import Wizard');
  console.log('   (Saves to DRAFT for review before publishing)');
  console.log('='.repeat(60));

  if (metadata.title) {
    console.log(`\n📄 File Title: ${metadata.title}`);
  }
  if (metadata.subtitle) {
    console.log(`📖 Chapter Info: ${metadata.subtitle}`);
  }
  if (metadata.questionCount) {
    console.log(`📊 Total Questions: ${metadata.questionCount}`);
  }

  console.log('\n' + '-'.repeat(60));

  const adminUser = await getAdminUser();
  if (!adminUser) {
    console.error('❌ No admin user found. Please create an admin user first.');
    process.exit(1);
  }

  console.log('\n1️⃣  SELECT SUBJECT');
  const subjects = await getSubjects();
  subjects.forEach((s, idx) => {
    const marker = metadata.suggestedSubject && s.subjectName.toLowerCase().includes(metadata.suggestedSubject.toLowerCase()) ? '✓' : ' ';
    console.log(`   [${idx + 1}] ${marker} ${s.subjectName}`);
  });
  const subjectAnswer = await askQuestion(rl, '\nEnter subject number: ');
  const subjectIndex = parseInt(subjectAnswer) - 1;
  const selectedSubject = subjects[subjectIndex];

  if (!selectedSubject) {
    console.error('❌ Invalid subject selection');
    rl.close();
    process.exit(1);
  }

  console.log('\n2️⃣  SELECT TOPIC (Optional - press Enter to skip)');
  const topics = await getTopics(selectedSubject.id);
  if (topics.length > 0) {
    console.log('   [0] No topic / Skip');
    topics.forEach((t, idx) => {
      console.log(`   [${idx + 1}] ${t.topicName}`);
    });
    const topicAnswer = await askQuestion(rl, '\nEnter topic number (or press Enter to skip): ');
    const topicIndex = parseInt(topicAnswer || '0') - 1;
    var selectedTopic = topicIndex >= 0 ? topics[topicIndex] : null;
  } else {
    console.log('   No topics available for this subject');
    var selectedTopic = null;
  }

  console.log('\n3️⃣  ENTER CLASS LEVEL');
  if (metadata.suggestedClassLevel) {
    console.log(`   Suggested: ${metadata.suggestedClassLevel} (from file)`);
  }
  const classAnswer = await askQuestion(rl, `Enter class level (1-12)${metadata.suggestedClassLevel ? ` [${metadata.suggestedClassLevel}]` : ''}: `);
  const classLevel = parseInt(classAnswer || metadata.suggestedClassLevel?.toString() || '0');

  if (classLevel < 1 || classLevel > 12) {
    console.error('❌ Invalid class level');
    rl.close();
    process.exit(1);
  }

  console.log('\n4️⃣  SELECT EXAM CATEGORY');
  const categories = await getExamCategories();
  categories.forEach((c, idx) => {
    const marker = c.categoryCode === 'CBSE' ? '✓' : ' ';
    console.log(`   [${idx + 1}] ${marker} ${c.categoryName}`);
  });
  const categoryAnswer = await askQuestion(rl, '\nEnter exam category number: ');
  const categoryIndex = parseInt(categoryAnswer) - 1;
  const selectedCategory = categories[categoryIndex];

  if (!selectedCategory) {
    console.error('❌ Invalid category selection');
    rl.close();
    process.exit(1);
  }

  console.log('\n5️⃣  SELECT QUESTION TYPE');
  const types = await getQuestionTypes();
  types.forEach((t, idx) => {
    const marker = t.typeCode === 'MCQ' ? '✓' : ' ';
    console.log(`   [${idx + 1}] ${marker} ${t.typeName}`);
  });
  const typeAnswer = await askQuestion(rl, '\nEnter question type number: ');
  const typeIndex = parseInt(typeAnswer) - 1;
  const selectedType = types[typeIndex];

  if (!selectedType) {
    console.error('❌ Invalid type selection');
    rl.close();
    process.exit(1);
  }

  console.log('\n6️⃣  SELECT DIFFICULTY LEVEL');
  const difficulties = await getDifficultyLevels();
  difficulties.forEach((d, idx) => {
    const marker = d.difficultyCode === 'MEDIUM' ? '✓' : ' ';
    console.log(`   [${idx + 1}] ${marker} ${d.difficultyName}`);
  });
  const difficultyAnswer = await askQuestion(rl, '\nEnter difficulty number: ');
  const difficultyIndex = parseInt(difficultyAnswer) - 1;
  const selectedDifficulty = difficulties[difficultyIndex];

  if (!selectedDifficulty) {
    console.error('❌ Invalid difficulty selection');
    rl.close();
    process.exit(1);
  }

  console.log('\n7️⃣  ENTER MARKS PER QUESTION');
  const marksAnswer = await askQuestion(rl, 'Enter marks per question [1]: ');
  const marks = parseFloat(marksAnswer || '1');

  console.log('\n8️⃣  ENTER NEGATIVE MARKS');
  const negativeMarksAnswer = await askQuestion(rl, 'Enter negative marks per wrong answer [0]: ');
  const negativeMarks = parseFloat(negativeMarksAnswer || '0');

  rl.close();

  return {
    subjectId: selectedSubject.id,
    subjectName: selectedSubject.subjectName,
    topicId: selectedTopic?.id,
    topicName: selectedTopic?.topicName,
    classLevel,
    examCategoryId: selectedCategory.id,
    examCategoryName: selectedCategory.categoryName,
    typeId: selectedType.id,
    typeName: selectedType.typeName,
    difficultyId: selectedDifficulty.id,
    difficultyName: selectedDifficulty.difficultyName,
    marks,
    negativeMarks,
    createdBy: Number(adminUser.id),
  };
}

function parseQuestionsFromHTMLJavaScript(htmlContent: string): QuestionData[] {
  const questions: QuestionData[] = [];
  const quizDataMatch = htmlContent.match(/const\s+quizData\s*=\s*(\[[\s\S]*?\]);/);

  if (!quizDataMatch) {
    return questions;
  }

  try {
    const quizDataString = quizDataMatch[1];
    const quizData = JSON.parse(quizDataString);

    quizData.forEach((q: any) => {
      if (!q.question || !q.options || !Array.isArray(q.options)) {
        return;
      }

      const options: { text: string; isCorrect: boolean }[] = q.options.map(
        (opt: string, idx: number) => ({
          text: opt,
          isCorrect: idx === q.answer,
        })
      );

      questions.push({
        questionText: q.question,
        options,
        correctAnswer: q.answer !== undefined ? String.fromCharCode(65 + q.answer) : undefined,
        explanation: q.explanation,
      });
    });
  } catch (error: any) {
    console.error('❌ Failed to parse quizData:', error.message);
  }

  return questions;
}

/**
 * Save questions to DRAFT tables
 */
async function saveToDraft(
  filePath: string,
  questions: QuestionData[],
  inputs: UserInputs
): Promise<{ batchId: string; success: number; failed: number; errors: string[] }> {
  const batchId = `batch_${Date.now()}_${uuidv4().split('-')[0]}`;

  console.log('\n' + '='.repeat(60));
  console.log('💾 SAVING TO DRAFT FOR REVIEW');
  console.log('='.repeat(60));
  console.log(`📦 Batch ID: ${batchId}`);
  console.log(`📄 Source File: ${path.basename(filePath)}`);
  console.log(`📚 Subject: ${inputs.subjectName}`);
  if (inputs.topicName) {
    console.log(`📖 Topic: ${inputs.topicName}`);
  }
  console.log(`🎓 Class: ${inputs.classLevel}`);
  console.log(`📋 Category: ${inputs.examCategoryName}`);
  console.log(`❓ Type: ${inputs.typeName}`);
  console.log(`⭐ Difficulty: ${inputs.difficultyName}`);
  console.log(`✅ Marks: ${inputs.marks}`);
  console.log(`❌ Negative Marks: ${inputs.negativeMarks}`);
  console.log(`📊 Total Questions: ${questions.length}`);
  console.log('='.repeat(60) + '\n');

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    try {
      await prisma.$executeRaw`
        INSERT INTO questions_draft (
          batch_id, source_file, question_text, type_id, difficulty_id,
          subject_id, topic_id, class_level, exam_category_id, correct_answer,
          marks, negative_marks, created_by, updated_at
        ) VALUES (
          ${batchId}, ${path.basename(filePath)}, ${q.questionText},
          ${inputs.typeId}, ${inputs.difficultyId}, ${inputs.subjectId},
          ${inputs.topicId}, ${inputs.classLevel}, ${inputs.examCategoryId},
          ${q.correctAnswer}, ${inputs.marks}, ${inputs.negativeMarks},
          ${inputs.createdBy}, NOW()
        ) RETURNING question_id
      `;

      // Get the last inserted ID
      const result: any = await prisma.$queryRaw`
        SELECT question_id FROM questions_draft
        WHERE batch_id = ${batchId}
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const questionDraftId = result[0]?.question_id;

      if (questionDraftId) {
        // Insert options
        for (let idx = 0; idx < q.options.length; idx++) {
          const opt = q.options[idx];
          await prisma.$executeRaw`
            INSERT INTO question_options_draft (
              question_draft_id, option_text, option_order, is_correct, updated_at
            ) VALUES (
              ${questionDraftId}, ${opt.text}, ${idx + 1}, ${opt.isCorrect}, NOW()
            )
          `;
        }

        // Insert explanation if exists
        if (q.explanation) {
          await prisma.$executeRaw`
            INSERT INTO question_explanations_draft (
              question_draft_id, explanation_type, explanation_text, display_order, updated_at
            ) VALUES (
              ${questionDraftId}, 'CORRECT_ANSWER', ${q.explanation}, 1, NOW()
            )
          `;
        }
      }

      success++;
      process.stdout.write(`\r💾 Progress: ${i + 1}/${questions.length} questions saved to draft...`);
    } catch (error: any) {
      failed++;
      const errorMsg = `Question ${i + 1} failed: ${error.message}`;
      errors.push(errorMsg);
    }
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('📊 DRAFT SAVE SUMMARY');
  console.log('='.repeat(60));
  console.log(`📦 Batch ID: ${batchId}`);
  console.log(`✅ Saved to Draft: ${success}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((success / questions.length) * 100).toFixed(2)}%`);
  console.log('\n💡 Next Steps:');
  console.log(`   1. Review questions: npm run review-drafts -- ${batchId}`);
  console.log(`   2. Approve and publish: npm run approve-drafts -- ${batchId}`);

  if (errors.length > 0 && errors.length <= 10) {
    console.log('\n🔴 ERRORS:');
    errors.forEach(err => console.log(`   ${err}`));
  }

  return { batchId, success, failed, errors };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
📚 INTERACTIVE BULK LOAD TO DRAFT

Usage:
  npm run bulk-load-draft <html-file-path>

Example:
  npm run bulk-load-draft ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html

This script will:
  1. Extract metadata from the HTML file
  2. Ask you to select subject, topic, class level, etc.
  3. Save all questions to DRAFT tables for review
  4. You can review and approve later before publishing
    `);
    process.exit(0);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const ext = path.extname(filePath).toLowerCase();
  if (ext !== '.html' && ext !== '.htm') {
    console.error(`❌ Only HTML files are supported`);
    process.exit(1);
  }

  try {
    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    const metadata = extractHTMLMetadata(htmlContent);
    const questions = parseQuestionsFromHTMLJavaScript(htmlContent);

    if (questions.length === 0) {
      console.error('❌ No questions found in the HTML file');
      process.exit(1);
    }

    metadata.questionCount = questions.length;

    const inputs = await collectUserInputs(metadata);

    console.log('\n' + '='.repeat(60));
    console.log('⚠️  CONFIRM BEFORE SAVING TO DRAFT');
    console.log('='.repeat(60));
    console.log('Press Ctrl+C to cancel, or press Enter to continue...');

    const rl = createInterface();
    await askQuestion(rl, '');
    rl.close();

    await saveToDraft(filePath, questions, inputs);

  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
