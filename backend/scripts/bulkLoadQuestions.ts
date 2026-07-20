import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient, QuestionStatus } from '@prisma/client';
// @ts-ignore
import pdfParse from 'pdf-parse';
import { JSDOM } from 'jsdom';

const prisma = new PrismaClient();

interface QuestionData {
  questionText: string;
  options: { text: string; isCorrect: boolean }[];
  correctAnswer?: string;
  explanation?: string;
  difficultyLevel?: 'EASY' | 'MEDIUM' | 'HARD';
  marks?: number;
}

interface BulkLoadConfig {
  subjectId: number;
  topicId?: number;
  classLevel: number;
  examCategoryId: number;
  createdBy: number;
  difficultyId?: number; // Default difficulty if not specified in question
  typeId?: number; // Question type (1=MCQ, 2=True/False, etc.)
}

/**
 * Parse questions from PDF file
 *
 * Expected PDF Format:
 * Q1. Question text here?
 * A) Option 1
 * B) Option 2
 * C) Option 3
 * D) Option 4
 * Answer: C
 * Explanation: [Optional] Explanation text
 * Difficulty: [Optional] EASY/MEDIUM/HARD
 *
 * Q2. Next question...
 */
async function parseQuestionsFromPDF(filePath: string): Promise<QuestionData[]> {
  const dataBuffer = fs.readFileSync(filePath);
  // @ts-ignore
  const pdfData = await pdfParse.default(dataBuffer);
  const text = pdfData.text;

  const questions: QuestionData[] = [];

  // Split by question numbers (Q1., Q2., etc.)
  const questionBlocks = text.split(/Q\d+\./i).filter((block: string) => block.trim());

  for (const block of questionBlocks) {
    const lines = block.split('\n').map((line: string) => line.trim()).filter((line: string) => line);

    if (lines.length === 0) continue;

    const questionText = lines[0];
    const options: { text: string; isCorrect: boolean }[] = [];
    let correctAnswer = '';
    let explanation = '';
    let difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD' | undefined;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      // Parse options (A), B), C), D) or A. B. C. D.
      const optionMatch = line.match(/^([A-D])[.)]\s*(.+)$/i);
      if (optionMatch) {
        options.push({
          text: optionMatch[2].trim(),
          isCorrect: false, // Will be set after we find the answer
        });
        continue;
      }

      // Parse answer
      const answerMatch = line.match(/^Answer:\s*([A-D])/i);
      if (answerMatch) {
        correctAnswer = answerMatch[1].toUpperCase();
        continue;
      }

      // Parse explanation
      const explanationMatch = line.match(/^Explanation:\s*(.+)$/i);
      if (explanationMatch) {
        explanation = explanationMatch[1].trim();
        continue;
      }

      // Parse difficulty
      const difficultyMatch = line.match(/^Difficulty:\s*(EASY|MEDIUM|HARD)/i);
      if (difficultyMatch) {
        difficultyLevel = difficultyMatch[1].toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD';
        continue;
      }
    }

    // Mark correct answer
    if (correctAnswer) {
      const correctIndex = correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0);
      if (options[correctIndex]) {
        options[correctIndex].isCorrect = true;
      }
    }

    if (questionText && options.length > 0) {
      questions.push({
        questionText,
        options,
        correctAnswer,
        explanation: explanation || undefined,
        difficultyLevel,
      });
    }
  }

  return questions;
}

/**
 * Parse questions from HTML file
 *
 * Expected HTML Format:
 * <div class="question">
 *   <p class="question-text">Question text here?</p>
 *   <ul class="options">
 *     <li data-correct="false">Option 1</li>
 *     <li data-correct="false">Option 2</li>
 *     <li data-correct="true">Option 3</li>
 *     <li data-correct="false">Option 4</li>
 *   </ul>
 *   <p class="explanation">Explanation text</p>
 *   <p class="difficulty">MEDIUM</p>
 * </div>
 */
async function parseQuestionsFromHTML(filePath: string): Promise<QuestionData[]> {
  const htmlContent = fs.readFileSync(filePath, 'utf-8');
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;

  const questions: QuestionData[] = [];
  const questionElements = document.querySelectorAll('.question');

  questionElements.forEach((questionEl) => {
    const questionTextEl = questionEl.querySelector('.question-text');
    const optionsEl = questionEl.querySelectorAll('.options li');
    const explanationEl = questionEl.querySelector('.explanation');
    const difficultyEl = questionEl.querySelector('.difficulty');

    if (!questionTextEl || optionsEl.length === 0) return;

    const questionText = questionTextEl.textContent?.trim() || '';
    const options: { text: string; isCorrect: boolean }[] = [];

    optionsEl.forEach((optionEl) => {
      const text = optionEl.textContent?.trim() || '';
      const isCorrect = optionEl.getAttribute('data-correct') === 'true';
      options.push({ text, isCorrect });
    });

    const explanation = explanationEl?.textContent?.trim();
    const difficultyText = difficultyEl?.textContent?.trim().toUpperCase();
    const difficultyLevel = ['EASY', 'MEDIUM', 'HARD'].includes(difficultyText || '')
      ? (difficultyText as 'EASY' | 'MEDIUM' | 'HARD')
      : undefined;

    questions.push({
      questionText,
      options,
      explanation,
      difficultyLevel,
    });
  });

  return questions;
}

/**
 * Get or create difficulty ID based on level
 */
async function getDifficultyId(level: string): Promise<number> {
  const difficultyMap: { [key: string]: string } = {
    EASY: 'EASY',
    MEDIUM: 'MEDIUM',
    HARD: 'HARD',
  };

  const code = difficultyMap[level] || 'MEDIUM';

  const difficulty = await prisma.difficultyLevel.findFirst({
    where: { difficultyCode: code },
  });

  return difficulty?.id || 2; // Default to MEDIUM (ID: 2)
}

/**
 * Bulk load questions into database
 */
async function bulkLoadQuestions(
  filePath: string,
  config: BulkLoadConfig
): Promise<{ success: number; failed: number; errors: string[] }> {
  console.log(`🚀 Starting bulk load from: ${filePath}`);
  console.log('📋 Config:', config);

  const ext = path.extname(filePath).toLowerCase();
  let questions: QuestionData[] = [];

  // Parse based on file type
  if (ext === '.pdf') {
    console.log('📄 Parsing PDF file...');
    questions = await parseQuestionsFromPDF(filePath);
  } else if (ext === '.html' || ext === '.htm') {
    console.log('🌐 Parsing HTML file...');
    questions = await parseQuestionsFromHTML(filePath);
  } else {
    throw new Error(`Unsupported file type: ${ext}. Use .pdf or .html`);
  }

  console.log(`✅ Parsed ${questions.length} questions`);

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  // Insert questions into database
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    try {
      // Determine difficulty ID
      const difficultyId = q.difficultyLevel
        ? await getDifficultyId(q.difficultyLevel)
        : (config.difficultyId || 2);

      // Create question with options
      const createdQuestion = await prisma.question.create({
        data: {
          questionText: q.questionText,
          typeId: config.typeId || 1, // Default to MCQ
          difficultyId,
          subjectId: config.subjectId,
          topicId: config.topicId,
          classLevel: config.classLevel,
          examCategoryId: config.examCategoryId,
          correctAnswer: q.correctAnswer,
          marks: q.marks || 1.0,
          negativeMarks: 0.25,
          status: QuestionStatus.ACTIVE, // Use ACTIVE instead of PUBLISHED
          isActive: true,
          createdBy: BigInt(config.createdBy),
          options: {
            create: q.options.map((opt, idx) => ({
              optionText: opt.text,
              optionOrder: idx + 1,
              isCorrect: opt.isCorrect,
            })),
          },
          explanations: q.explanation
            ? {
                create: {
                  explanationType: 'CORRECT_ANSWER',
                  explanationText: q.explanation,
                  displayOrder: 1,
                },
              }
            : undefined,
        },
      });

      success++;
      console.log(`✅ Question ${i + 1}/${questions.length} created (ID: ${createdQuestion.id})`);
    } catch (error: any) {
      failed++;
      const errorMsg = `❌ Question ${i + 1} failed: ${error.message}`;
      errors.push(errorMsg);
      console.error(errorMsg);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 BULK LOAD SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((success / questions.length) * 100).toFixed(2)}%`);

  if (errors.length > 0) {
    console.log('\n🔴 ERRORS:');
    errors.forEach(err => console.log(err));
  }

  return { success, failed, errors };
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
📚 BULK LOAD QUESTIONS SCRIPT

Usage:
  npm run bulk-load <file-path> [options]

Options:
  --subject <id>          Subject ID (required)
  --topic <id>            Topic ID (optional)
  --class <level>         Class level (required)
  --category <id>         Exam category ID (required)
  --created-by <id>       User ID who created questions (required)
  --difficulty <id>       Default difficulty ID (optional, default: 2)
  --type <id>             Question type ID (optional, default: 1 for MCQ)

Example:
  npm run bulk-load questions.pdf --subject 1 --class 10 --category 1 --created-by 1
  npm run bulk-load questions.html --subject 2 --class 9 --category 2 --created-by 1 --topic 5

Supported file formats:
  - PDF (.pdf)
  - HTML (.html, .htm)
    `);
    process.exit(0);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  // Parse arguments
  const getArg = (name: string): string | undefined => {
    const index = args.indexOf(`--${name}`);
    return index !== -1 && args[index + 1] ? args[index + 1] : undefined;
  };

  const config: BulkLoadConfig = {
    subjectId: parseInt(getArg('subject') || '0'),
    topicId: getArg('topic') ? parseInt(getArg('topic')!) : undefined,
    classLevel: parseInt(getArg('class') || '0'),
    examCategoryId: parseInt(getArg('category') || '0'),
    createdBy: parseInt(getArg('created-by') || '0'),
    difficultyId: getArg('difficulty') ? parseInt(getArg('difficulty')!) : undefined,
    typeId: getArg('type') ? parseInt(getArg('type')!) : 1,
  };

  // Validate required fields
  if (!config.subjectId || !config.classLevel || !config.examCategoryId || !config.createdBy) {
    console.error('❌ Missing required parameters: --subject, --class, --category, --created-by');
    process.exit(1);
  }

  try {
    await bulkLoadQuestions(filePath, config);
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
