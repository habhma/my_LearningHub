# 🎯 DRAFT & APPROVAL SYSTEM - Complete Guide

## ✨ What's New?

A **two-step review system** for safer bulk imports:

1. **Step 1**: Import → Save to `questions_draft` table
2. **Step 2**: Review → Approve → Move to `questions` table

This prevents bad data from going directly into your live question bank!

## 🚀 Quick Start

### 1. Import Questions to Draft

```bash
cd backend
npm run bulk-load-draft -- ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html
```

Follow the interactive prompts (same as before). Questions saved to draft with a **Batch ID**.

### 2. List All Draft Batches

```bash
npm run review-drafts list
```

Shows all pending batches with details.

### 3. Review Questions

```bash
npm run review-drafts view batch_1234567890_abc123
```

See all questions, options, and explanations in the batch.

### 4. Approve & Publish

```bash
npm run review-drafts approve batch_1234567890_abc123
```

Moves approved questions from `questions_draft` → `questions` table.

## 📊 Database Schema

### New Tables Created

#### 1. `questions_draft`
```sql
- question_id (primary key)
- batch_id (groups questions from same import)
- source_file (original filename)
- question_text, options, etc. (same as questions table)
- is_approved (false by default)
- reviewed_by (user who approved)
- reviewed_at (approval timestamp)
- approval_notes (optional notes)
```

#### 2. `question_options_draft`
```sql
- option_id (primary key)
- question_draft_id (foreign key)
- option_text, is_correct, etc.
```

#### 3. `question_explanations_draft`
```sql
- explanation_id (primary key)
- question_draft_id (foreign key)
- explanation_text, etc.
```

## 🔄 Complete Workflow

```
┌─────────────────────┐
│  1. Import to Draft │
│  (Interactive UI)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  questions_draft    │
│  (Batch stored)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  2. List Batches    │
│  (Review available) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  3. Review Batch    │
│  (Check questions)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  4. Approve & Pub   │
│  (Move to questions)│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     questions       │
│  (Live & Active!)   │
└─────────────────────┘
```

## 📋 All Commands

### Import Commands

| Command | Description |
|---------|-------------|
| `npm run bulk-load-draft <file>` | Import to draft (recommended) |
| `npm run bulk-load-interactive <file>` | Direct import (skip draft) |
| `npm run bulk-load-enhanced <file> [args]` | Command-line import |

### Review Commands

| Command | Description |
|---------|-------------|
| `npm run review-drafts list` | List all draft batches |
| `npm run review-drafts view <batch-id>` | Review batch questions |
| `npm run review-drafts approve <batch-id>` | Approve & publish |
| `npm run review-drafts delete <batch-id>` | Delete draft batch |

## 🎓 Complete Example

### Step 1: Import Questions to Draft

```bash
$ cd backend
$ npm run bulk-load-draft -- ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html

============================================================
📚 INTERACTIVE BULK LOAD - Question Import Wizard
   (Saves to DRAFT for review before publishing)
============================================================

📄 File Title: Parts and Wholes Quiz
📖 Chapter Info: Chapter 5: Sharing and Measuring Practice Problems
📊 Total Questions: 50

... [Follow prompts] ...

============================================================
💾 SAVING TO DRAFT FOR REVIEW
============================================================
📦 Batch ID: batch_1737123456_a1b2c3
📄 Source File: Chapter1_Shapes.html
...

💾 Progress: 50/50 questions saved to draft...

============================================================
📊 DRAFT SAVE SUMMARY
============================================================
📦 Batch ID: batch_1737123456_a1b2c3
✅ Saved to Draft: 50
❌ Failed: 0
📈 Success Rate: 100.00%

💡 Next Steps:
   1. Review questions: npm run review-drafts view batch_1737123456_a1b2c3
   2. Approve and publish: npm run review-drafts approve batch_1737123456_a1b2c3
```

### Step 2: List Draft Batches

```bash
$ npm run review-drafts list

================================================================================
📦 DRAFT BATCHES - Pending Review
================================================================================

[1] Batch: batch_1737123456_a1b2c3
    📄 File: Chapter1_Shapes.html
    📚 Subject: Mathematics | Class: 4
    📊 Questions: 50 (0 approved, 50 pending)
    👤 Created by: admin@example.com
    📅 Created: 1/17/2026, 3:30:45 PM

================================================================================
```

### Step 3: Review Questions

```bash
$ npm run review-drafts view batch_1737123456_a1b2c3

================================================================================
📋 REVIEWING BATCH: batch_1737123456_a1b2c3
================================================================================
Total Questions: 50

--------------------------------------------------------------------------------
Question 1/50 ⏳ PENDING
--------------------------------------------------------------------------------

📝 In the story at the beginning of the chapter, Ikra and Samina have a single drawing sheet. If Ikra divides it in half, how many equal parts is the sheet divided into?

📊 Type: Multiple Choice | Difficulty: Medium | Marks: 1 | Negative: 0

📌 Options:
   [1]   1 part
   [2] ✓ 2 equal parts
   [3]   3 equal parts
   [4]   4 equal parts

💡 Explanation: When an object is divided in half, it means it is divided into 2 equal parts.

... [49 more questions] ...

================================================================================

💡 To approve this batch, run: npm run approve-drafts batch_1737123456_a1b2c3
```

### Step 4: Approve & Publish

```bash
$ npm run review-drafts approve batch_1737123456_a1b2c3

================================================================================
✅ APPROVING AND PUBLISHING BATCH: batch_1737123456_a1b2c3
================================================================================

✅ Published: 50/50 questions...

================================================================================
📊 PUBLICATION SUMMARY
================================================================================
✅ Successfully Published: 50
❌ Failed: 0
📈 Success Rate: 100.00%

💡 Published questions are now ACTIVE and can be used in assessments!
```

## 🛡️ Safety Features

### 1. Batch Tracking
- Every import gets a unique `batch_id`
- Track which file questions came from
- Group related questions together

### 2. Review Before Publish
- See ALL questions before they go live
- Check options, answers, explanations
- Verify marks and difficulty settings

### 3. Approval Workflow
- Questions marked as `is_approved = false` by default
- Admin must explicitly approve
- Tracks who approved and when

### 4. Rollback Capability
- Delete draft batches without affecting live questions
- Keep drafts for historical reference
- Re-import if needed

## 🔍 Verification Queries

### Check Draft Status

```sql
-- See all draft batches
SELECT batch_id, COUNT(*) as total,
       SUM(CASE WHEN is_approved THEN 1 ELSE 0 END) as approved
FROM questions_draft
GROUP BY batch_id;

-- View specific batch
SELECT qd.*, s.subject_name, qt.type_name
FROM questions_draft qd
JOIN subjects s ON qd.subject_id = s.subject_id
JOIN question_types qt ON qd.type_id = qt.type_id
WHERE batch_id = 'batch_1737123456_a1b2c3';
```

### Verify Published Questions

```sql
-- Check questions added from a batch
SELECT COUNT(*) FROM questions
WHERE created_at > '2026-01-17'
  AND subject_id = 1
  AND class_level = 4;
```

## 💡 Best Practices

### 1. Always Review First
```bash
# ✅ Good: Review before approving
npm run review-drafts view <batch-id>
npm run review-drafts approve <batch-id>

# ❌ Don't: Approve blindly
npm run review-drafts approve <batch-id>  # without reviewing
```

### 2. Delete Bad Imports
```bash
# If import had errors, delete and re-import
npm run review-drafts delete <bad-batch-id>
npm run bulk-load-draft <file>  # try again
```

### 3. Keep Track of Batches
```bash
# Regularly check what's pending
npm run review-drafts list
```

### 4. Use Meaningful Filenames
```bash
# ✅ Good: Clear, descriptive names
Chapter1_Shapes.html
Std4_Maths_Fractions.html

# ❌ Poor: Generic names
questions.html
test.html
```

## 🆚 Draft vs Direct Import

### Use Draft (Recommended)
```bash
npm run bulk-load-draft <file>
```
✅ Review before publishing  
✅ Catch errors early  
✅ Group by batch  
✅ Safe for production  
✅ Rollback if needed

### Use Direct (For Testing)
```bash
npm run bulk-load-interactive <file>
```
❌ No review step  
❌ Goes live immediately  
✅ Faster for dev/testing  
❌ Harder to rollback

## 📁 File Structure

```
backend/
├── scripts/
│   ├── bulkLoadToDraft.ts              ← Import to draft (NEW)
│   ├── reviewDrafts.ts                 ← Review & approve (NEW)
│   ├── bulkLoadInteractive.ts          ← Direct import (old)
│   ├── bulkLoadQuestionsEnhanced.ts    ← Command-line import
│   └── README-DRAFT-SYSTEM.md          ← This file
├── prisma/
│   ├── migrations/
│   │   └── create_draft_tables.sql     ← Draft tables SQL (NEW)
│   └── schema.prisma                    ← Updated schema
└── package.json                         ← New npm commands
```

## 🔧 Setup Instructions

### 1. Run Migration (One-time)

```bash
cd backend

# Apply the draft tables migration
psql -d your_database -f prisma/migrations/create_draft_tables.sql

# Or use Prisma (if schema is updated)
npx prisma db push
```

### 2. Install Dependencies (If needed)

```bash
npm install uuid @types/uuid
```

### 3. Test the System

```bash
# Import a test file
npm run bulk-load-draft test-file.html

# List batches
npm run review-drafts list

# Review
npm run review-drafts view <batch-id>

# Approve
npm run review-drafts approve <batch-id>
```

## ❓ FAQ

### Q: Can I edit questions in draft?
**A:** Currently no, but you can:
- Delete the batch
- Modify the HTML file
- Re-import

### Q: What happens to old drafts?
**A:** They stay in `questions_draft` unless you delete them. Consider cleaning up approved batches periodically.

### Q: Can I partially approve a batch?
**A:** Not yet in this version. It's all-or-nothing per batch. Future enhancement could add per-question approval.

### Q: Are draft tables backed up?
**A:** Yes, if your database backup includes all tables.

## 🎉 Benefits

| Before (Direct Import) | After (Draft System) |
|------------------------|----------------------|
| Questions go live immediately | Review before publish |
| Hard to undo mistakes | Easy to delete drafts |
| No batch tracking | Track by batch & file |
| No audit trail | Know who approved when |
| Risky for production | Safe for production |

## 📞 Support

For issues:
1. Check console output for errors
2. Verify database migration ran successfully
3. Check that batch_id exists: `npm run review-drafts list`
4. Review SQL logs for constraint errors

---

**You now have a production-ready question import system with review & approval workflow!** 🎊
