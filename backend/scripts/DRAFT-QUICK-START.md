# 🎯 DRAFT SYSTEM - Quick Start

## Perfect! Your 2-Step Import System

### ✅ What You Asked For

1. **Script 1**: Import → Save to `questions_draft` table
2. **Script 2**: Review → Approve → Move to `questions` table

**Done! ✨**

## 🚀 Super Simple Workflow

### Step 1: Import to Draft

```bash
cd backend
npm run bulk-load-draft -- ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html
```

- Interactive wizard (same UI as before)
- Saves to `questions_draft`
- Gets a **Batch ID** (e.g., `batch_1737123456_a1b2c3`)

### Step 2: List Batches

```bash
npm run review-drafts list
```

Shows all pending batches.

### Step 3: Review Questions

```bash
npm run review-drafts view batch_1737123456_a1b2c3
```

See all 50 questions with options, answers, explanations.

### Step 4: Approve & Publish

```bash
npm run review-drafts approve batch_1737123456_a1b2c3
```

Moves questions from `questions_draft` → `questions` table. **Now live!** ✅

## 📊 What Got Created

### 3 New Database Tables

1. **questions_draft** - Stores imported questions
2. **question_options_draft** - Stores options for draft questions
3. **question_explanations_draft** - Stores explanations for draft questions

### 2 New Scripts

1. **bulkLoadToDraft.ts** - Import questions to draft
2. **reviewDrafts.ts** - Review & approve drafts

### 5 New Commands

```bash
npm run bulk-load-draft <file>           # Import to draft
npm run review-drafts list               # List batches
npm run review-drafts view <batch-id>    # Review questions
npm run review-drafts approve <batch-id> # Approve & publish
npm run review-drafts delete <batch-id>  # Delete batch
```

## 🛡️ Safety Features

✅ Review before publishing  
✅ Batch tracking (group by import)  
✅ Source file tracking  
✅ Approval audit trail (who & when)  
✅ Easy rollback (delete draft)  
✅ No live data affected until approved

## 📝 Setup (One-time)

### 1. Run Migration

```bash
cd backend
psql -d your_database -f prisma/migrations/create_draft_tables.sql
```

### 2. Install UUID Package

```bash
npm install uuid @types/uuid
```

### 3. Test It!

```bash
npm run bulk-load-draft -- ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html
npm run review-drafts list
```

## 🎓 Example Output

```bash
$ npm run bulk-load-draft -- Chapter1_Shapes.html

# ... interactive prompts ...

📦 Batch ID: batch_1737123456_a1b2c3
✅ Saved to Draft: 50

💡 Next Steps:
   1. Review: npm run review-drafts view batch_1737123456_a1b2c3
   2. Approve: npm run review-drafts approve batch_1737123456_a1b2c3

$ npm run review-drafts approve batch_1737123456_a1b2c3

✅ Successfully Published: 50
📈 Success Rate: 100.00%

💡 Questions are now ACTIVE and ready to use!
```

## 📚 Full Documentation

See `README-DRAFT-SYSTEM.md` for:
- Complete workflow details
- Database schema
- All commands
- Verification queries
- Best practices
- FAQ

## 🎉 Benefits

| Before | After |
|--------|-------|
| Direct to live | Review first |
| No undo | Easy delete |
| One-shot | Two-step safety |
| Risky | Safe |

---

**Your production-ready import system is ready! 🚀**

Simple workflow:
1. Import → Draft
2. Review → Questions
3. Approve → Live!
