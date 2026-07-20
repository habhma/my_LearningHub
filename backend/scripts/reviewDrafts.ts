import * as readline from 'readline';
import { PrismaClient, QuestionStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface DraftBatch {
  batchId: string;
  questionCount: number;
  sourceFile: string;
  subject: string;
  classLevel: number;
  createdAt: Date;
  createdBy: string;
}

interface DraftQuestion {
  id: bigint;
  questionText: string;
  options: Array<{
    id: bigint;
    optionText: string;
    optionOrder: number;
    isCorrect: boolean;
  }>;
  explanation?: string;
  metadata: any;
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

/**
 * List all draft batches
 */
async function listDraftBatches(): Promise<void> {
  const batches: any[] = await prisma.$queryRaw`
    SELECT
      qd.batch_id,
      COUNT(qd.question_id) as question_count,
      qd.source_file,
      s.subject_name,
      qd.class_level,
      MIN(qd.created_at) as created_at,
      u.email as created_by,
      SUM(CASE WHEN qd.is_approved = true THEN 1 ELSE 0 END) as approved_count
    FROM questions_draft qd
    LEFT JOIN subjects s ON qd.subject_id = s.subject_id
    LEFT JOIN users u ON qd.created_by = u.user_id
    GROUP BY qd.batch_id, qd.source_file, s.subject_name, qd.class_level, u.email
    ORDER BY MIN(qd.created_at) DESC
    LIMIT 20
  `;

  console.log('\n' + '='.repeat(80));
  console.log('📦 DRAFT BATCHES - Pending Review');
  console.log('='.repeat(80));

  if (batches.length === 0) {
    console.log('\n   No draft batches found.');
    console.log('\n💡 Use "npm run bulk-load-draft <file>" to import questions to draft first.');
    return;
  }

  batches.forEach((batch, idx) => {
    const approvedCount = Number(batch.approved_count);
    const totalCount = Number(batch.question_count);
    const pendingCount = totalCount - approvedCount;

    console.log(`\n[${idx + 1}] Batch: ${batch.batch_id}`);
    console.log(`    📄 File: ${batch.source_file}`);
    console.log(`    📚 Subject: ${batch.subject_name} | Class: ${batch.class_level}`);
    console.log(`    📊 Questions: ${totalCount} (${approvedCount} approved, ${pendingCount} pending)`);
    console.log(`    👤 Created by: ${batch.created_by}`);
    console.log(`    📅 Created: ${new Date(batch.created_at).toLocaleString()}`);
  });

  console.log('\n' + '='.repeat(80));
}

/**
 * Review questions in a batch
 */
async function reviewBatch(batchId: string): Promise<void> {
  const questions: any[] = await prisma.$queryRaw`
    SELECT
      qd.question_id,
      qd.question_text,
      qd.is_approved,
      s.subject_name,
      qt.type_name,
      dl.difficulty_name,
      qd.marks,
      qd.negative_marks
    FROM questions_draft qd
    LEFT JOIN subjects s ON qd.subject_id = s.subject_id
    LEFT JOIN question_types qt ON qd.type_id = qt.type_id
    LEFT JOIN difficulty_levels dl ON qd.difficulty_id = dl.difficulty_id
    WHERE qd.batch_id = ${batchId}
    ORDER BY qd.question_id
  `;

  if (questions.length === 0) {
    console.error(`\n❌ No questions found for batch: ${batchId}`);
    return;
  }

  console.log('\n' + '='.repeat(80));
  console.log(`📋 REVIEWING BATCH: ${batchId}`);
  console.log('='.repeat(80));
  console.log(`Total Questions: ${questions.length}\n`);

  for (const [idx, q] of questions.entries()) {
    const options: any[] = await prisma.$queryRaw`
      SELECT option_text, option_order, is_correct
      FROM question_options_draft
      WHERE question_draft_id = ${q.question_id}
      ORDER BY option_order
    `;

    const explanation: any[] = await prisma.$queryRaw`
      SELECT explanation_text
      FROM question_explanations_draft
      WHERE question_draft_id = ${q.question_id}
      LIMIT 1
    `;

    console.log(`\n${'-'.repeat(80)}`);
    console.log(`Question ${idx + 1}/${questions.length} ${q.is_approved ? '✅ APPROVED' : '⏳ PENDING'}`);
    console.log(`${'-'.repeat(80)}`);
    console.log(`\n📝 ${q.question_text}`);
    console.log(`\n📊 Type: ${q.type_name} | Difficulty: ${q.difficulty_name} | Marks: ${q.marks} | Negative: ${q.negative_marks}`);

    console.log(`\n📌 Options:`);
    options.forEach(opt => {
      const marker = opt.is_correct ? '✓' : ' ';
      console.log(`   [${opt.option_order}] ${marker} ${opt.option_text}`);
    });

    if (explanation.length > 0) {
      console.log(`\n💡 Explanation: ${explanation[0].explanation_text}`);
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`\n💡 To approve this batch, run: npm run approve-drafts -- ${batchId}`);
}

/**
 * Approve and publish a batch
 */
async function approveBatch(batchId: string, userId: number): Promise<void> {
  console.log('\n' + '='.repeat(80));
  console.log(`✅ APPROVING AND PUBLISHING BATCH: ${batchId}`);
  console.log('='.repeat(80));

  try {
    // Get all questions from draft
    const draftQuestions: any[] = await prisma.$queryRaw`
      SELECT * FROM questions_draft
      WHERE batch_id = ${batchId}
      AND is_approved = false
    `;

    if (draftQuestions.length === 0) {
      console.log('\n⚠️  No pending questions to approve in this batch.');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const draft of draftQuestions) {
      try {
        // Insert into main questions table
        const createdQuestion = await prisma.question.create({
          data: {
            questionText: draft.question_text,
            typeId: draft.type_id,
            difficultyId: draft.difficulty_id,
            subjectId: draft.subject_id,
            topicId: draft.topic_id,
            classLevel: draft.class_level,
            examCategoryId: draft.exam_category_id,
            correctAnswer: draft.correct_answer,
            marks: draft.marks,
            negativeMarks: draft.negative_marks,
            status: QuestionStatus.ACTIVE,
            isActive: true,
            createdBy: draft.created_by ? BigInt(draft.created_by) : null,
          },
        });

        // Copy options
        const options: any[] = await prisma.$queryRaw`
          SELECT * FROM question_options_draft
          WHERE question_draft_id = ${draft.question_id}
          ORDER BY option_order
        `;

        for (const opt of options) {
          await prisma.questionOption.create({
            data: {
              questionId: createdQuestion.id,
              optionText: opt.option_text,
              optionOrder: opt.option_order,
              isCorrect: opt.is_correct,
            },
          });
        }

        // Copy explanations
        const explanations: any[] = await prisma.$queryRaw`
          SELECT * FROM question_explanations_draft
          WHERE question_draft_id = ${draft.question_id}
        `;

        for (const exp of explanations) {
          await prisma.questionExplanation.create({
            data: {
              questionId: createdQuestion.id,
              explanationType: exp.explanation_type as any,
              explanationText: exp.explanation_text,
              displayOrder: exp.display_order,
            },
          });
        }

        // Mark as approved in draft
        await prisma.$executeRaw`
          UPDATE questions_draft
          SET is_approved = true,
              reviewed_by = ${userId},
              reviewed_at = NOW()
          WHERE question_id = ${draft.question_id}
        `;

        successCount++;
        process.stdout.write(`\r✅ Published: ${successCount}/${draftQuestions.length} questions...`);

      } catch (error: any) {
        failCount++;
        console.error(`\n❌ Failed to publish question ${draft.question_id}: ${error.message}`);
      }
    }

    console.log('\n\n' + '='.repeat(80));
    console.log('📊 PUBLICATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successfully Published: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📈 Success Rate: ${((successCount / draftQuestions.length) * 100).toFixed(2)}%`);
    console.log('\n💡 Published questions are now ACTIVE and can be used in assessments!');

  } catch (error: any) {
    console.error(`\n❌ Error approving batch: ${error.message}`);
  }
}

/**
 * Delete a draft batch
 */
async function deleteBatch(batchId: string): Promise<void> {
  const rl = createInterface();

  const confirm = await askQuestion(rl, `\n⚠️  Are you sure you want to DELETE batch "${batchId}"? This cannot be undone! (yes/no): `);

  if (confirm.toLowerCase() !== 'yes') {
    console.log('\n❌ Deletion cancelled.');
    rl.close();
    return;
  }

  rl.close();

  try {
    await prisma.$executeRaw`
      DELETE FROM questions_draft
      WHERE batch_id = ${batchId}
    `;

    console.log(`\n✅ Batch "${batchId}" has been deleted.`);
  } catch (error: any) {
    console.error(`\n❌ Error deleting batch: ${error.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const batchId = args[1];

  if (!command) {
    console.log(`
📋 DRAFT REVIEW & APPROVAL SYSTEM

Commands:
  npm run review-drafts list                    - List all draft batches
  npm run review-drafts view <batch-id>         - Review questions in a batch
  npm run review-drafts approve <batch-id>      - Approve and publish a batch
  npm run review-drafts delete <batch-id>       - Delete a draft batch

Examples:
  npm run review-drafts list
  npm run review-drafts view batch_1234567890_abc123
  npm run review-drafts approve batch_1234567890_abc123
  npm run review-drafts delete batch_1234567890_abc123

Workflow:
  1. Import questions to draft: npm run bulk-load-draft <file>
  2. List batches: npm run review-drafts list
  3. Review questions: npm run review-drafts view <batch-id>
  4. Approve & publish: npm run review-drafts approve <batch-id>
    `);
    process.exit(0);
  }

  try {
    switch (command) {
      case 'list':
        await listDraftBatches();
        break;

      case 'view':
      case 'review':
        if (!batchId) {
          console.error('❌ Please provide a batch ID');
          process.exit(1);
        }
        await reviewBatch(batchId);
        break;

      case 'approve':
      case 'publish':
        if (!batchId) {
          console.error('❌ Please provide a batch ID');
          process.exit(1);
        }
        const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (!adminUser) {
          console.error('❌ No admin user found');
          process.exit(1);
        }
        await approveBatch(batchId, Number(adminUser.id));
        break;

      case 'delete':
      case 'remove':
        if (!batchId) {
          console.error('❌ Please provide a batch ID');
          process.exit(1);
        }
        await deleteBatch(batchId);
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Run "npm run review-drafts" to see available commands');
        process.exit(1);
    }
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
