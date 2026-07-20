# Complete Setup Guide for Bulk Loading Chapter1_Shapes.html

## Your Requirements

- ✅ Subject: **Mathematics**
- ✅ Question Type: **Multiple Choice (MCQ)**
- ✅ Marks: **1**
- ✅ Negative Marks: **0**
- ✅ Exam Category: **CBSE Board**
- ✅ Difficulty: **Medium**
- ✅ Class: **4** (Standard 4)

## Step 1: Get Database IDs

You need to run these SQL queries to get the correct IDs:

### 1.1 Get Subject ID (Mathematics)

```sql
SELECT id, subject_name, subject_code 
FROM subjects 
WHERE subject_name = 'Mathematics' OR subject_code = 'MATH';
```

**Expected Result:**
```
id | subject_name | subject_code
----+--------------+--------------
 1 | Mathematics  | MATH
```
➡️ **Subject ID = 1** (use this in your command)

---

### 1.2 Get Question Type ID (Multiple Choice)

```sql
SELECT id, type_name, type_code 
FROM question_types 
WHERE type_name = 'Multiple Choice' OR type_code = 'MCQ';
```

**Expected Result:**
```
id | type_name        | type_code
----+------------------+-----------
 1 | Multiple Choice  | MCQ
```
➡️ **Type ID = 1** (use this in your command)

---

### 1.3 Get Difficulty ID (Medium)

```sql
SELECT id, difficulty_name, difficulty_code 
FROM difficulty_levels 
WHERE difficulty_name = 'Medium' OR difficulty_code = 'MEDIUM';
```

**Expected Result:**
```
id | difficulty_name | difficulty_code
----+-----------------+-----------------
 2 | Medium          | MEDIUM
```
➡️ **Difficulty ID = 2** (use this in your command)

---

### 1.4 Get Exam Category ID (CBSE)

```sql
SELECT id, category_name, category_code 
FROM exam_categories 
WHERE category_name LIKE '%CBSE%' OR category_code = 'CBSE';
```

**Expected Result:**
```
id | category_name | category_code
----+---------------+---------------
 1 | CBSE Board    | CBSE
```
➡️ **Category ID = 1** (use this in your command)

---

### 1.5 Get User ID (Admin/Creator)

```sql
SELECT id, email, role 
FROM users 
WHERE role = 'ADMIN' 
LIMIT 1;
```

**Expected Result:**
```
id | email              | role
----+--------------------+-------
 1 | admin@example.com  | ADMIN
```
➡️ **User ID = 1** (use this in your command)

---

### 1.6 (Optional) Get Topic ID

If you want to associate questions with a specific topic like "Parts and Wholes":

```sql
SELECT id, topic_name 
FROM topics 
WHERE subject_id = 1 
  AND (topic_name LIKE '%Parts%' OR topic_name LIKE '%Fractions%');
```

**Expected Result:**
```
id | topic_name
----+----------------
 5 | Parts and Wholes
```
➡️ **Topic ID = 5** (optional - use if you want to tag questions by topic)

---

## Step 2: Verify Database Has Required Data

If any of the above queries return **no results**, you need to seed your database first:

```bash
cd backend
npm run db:seed
```

This will populate:
- Subjects (Mathematics, Science, etc.)
- Question Types (MCQ, True/False, etc.)
- Difficulty Levels (Easy, Medium, Hard)
- Exam Categories (CBSE, ICSE, etc.)

---

## Step 3: Install Dependencies

```bash
cd backend
npm install pdf-parse jsdom @types/pdf-parse
```

---

## Step 4: Run the Bulk Load Command

### Option A: Without Topic ID (Simpler)

```bash
npm run bulk-load-enhanced -- ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html \
  --subject 1 \
  --class 4 \
  --category 1 \
  --created-by 1 \
  --type 1 \
  --difficulty 2
```

### Option B: With Topic ID (Recommended)

```bash
npm run bulk-load-enhanced -- ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html \
  --subject 1 \
  --topic 5 \
  --class 4 \
  --category 1 \
  --created-by 1 \
  --type 1 \
  --difficulty 2
```

### Windows PowerShell Version

```powershell
npm run bulk-load-enhanced -- ..\QnA\CBSE\Maths\Std4\Chapter1_Shapes.html --subject 1 --topic 5 --class 4 --category 1 --created-by 1 --type 1 --difficulty 2
```

---

## Step 5: What the Script Does

The enhanced script will:

1. ✅ Extract 50 questions from the JavaScript array in your HTML file
2. ✅ Set marks to **1.0** (default, already in script)
3. ✅ Set negative marks to **0.25** (default, but you want 0 - see note below)
4. ✅ Set question type to **Multiple Choice (MCQ)**
5. ✅ Set difficulty to **Medium**
6. ✅ Set exam category to **CBSE**
7. ✅ Associate with **Mathematics** subject
8. ✅ Set class level to **4**
9. ✅ Create 4 options per question with correct answer marked
10. ✅ Add explanation for each question

---

## ⚠️ Important Note: Negative Marks

You want **negative marks = 0**, but the current script has **default of 0.25**.

### Quick Fix Option 1: Accept 0.25 for now
The script will load with `negativeMarks: 0.25`. You can update this later in the database:

```sql
UPDATE questions 
SET negative_marks = 0 
WHERE class_level = 4 AND subject_id = 1;
```

### Quick Fix Option 2: Modify the Script
I can update the script to make negative marks configurable via command line parameter.

Would you like me to add `--negative-marks` parameter to the script?

---

## Step 6: Expected Output

```bash
🚀 Starting bulk load from: ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html
📋 Config: {
  subjectId: 1,
  topicId: 5,
  classLevel: 4,
  examCategoryId: 1,
  createdBy: 1,
  typeId: 1,
  difficultyId: 2
}
🌐 Parsing HTML file...
✅ Extracted 50 questions from JavaScript array
✅ Parsed 50 questions
✅ Question 1/50 created (ID: 101)
✅ Question 2/50 created (ID: 102)
✅ Question 3/50 created (ID: 103)
...
✅ Question 50/50 created (ID: 150)

==================================================
📊 BULK LOAD SUMMARY
==================================================
✅ Success: 50
❌ Failed: 0
📈 Success Rate: 100.00%
```

---

## Step 7: Verify in Database

```sql
-- Check total questions loaded
SELECT COUNT(*) as total_questions
FROM questions 
WHERE class_level = 4 AND subject_id = 1;

-- View first 5 questions
SELECT 
  id,
  question_text,
  marks,
  negative_marks,
  class_level
FROM questions 
WHERE class_level = 4 AND subject_id = 1
LIMIT 5;

-- Check options for a question
SELECT 
  option_text,
  is_correct,
  option_order
FROM question_options 
WHERE question_id = 101  -- Replace with actual question ID
ORDER BY option_order;

-- Check explanations
SELECT 
  question_id,
  explanation_text
FROM question_explanations 
WHERE question_id IN (
  SELECT id FROM questions WHERE class_level = 4 AND subject_id = 1
)
LIMIT 5;
```

---

## Complete Parameter Reference

| Parameter | Your Value | Description |
|-----------|------------|-------------|
| `--subject` | `1` | Mathematics |
| `--topic` | `5` | Parts and Wholes (optional) |
| `--class` | `4` | Standard 4 |
| `--category` | `1` | CBSE Board |
| `--created-by` | `1` | Admin user |
| `--type` | `1` | Multiple Choice (MCQ) |
| `--difficulty` | `2` | Medium |
| Marks (auto) | `1.0` | Set in script (default) |
| Negative Marks (auto) | `0.25` | Set in script (needs update to 0) |

---

## Quick Command (Copy-Paste Ready)

Replace the IDs based on your actual database values from Step 1:

```bash
# Navigate to backend directory
cd backend

# Run the bulk load with all your requirements
npm run bulk-load-enhanced -- ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html \
  --subject 1 \
  --topic 5 \
  --class 4 \
  --category 1 \
  --created-by 1 \
  --type 1 \
  --difficulty 2
```

---

## Troubleshooting

### Error: "File not found"
```bash
# Make sure you're in the backend directory
pwd  # Should show: /path/to/my_LearningHuB/backend

# Try with absolute path
npm run bulk-load-enhanced -- C:/Tech/my_LearningHuB/QnA/CBSE/Maths/Std4/Chapter1_Shapes.html ...
```

### Error: "Foreign key constraint"
This means one of your IDs doesn't exist. Re-run the SQL queries from Step 1 and update your command.

### Error: "No questions found"
The HTML file format is correct. This shouldn't happen with your file. If it does, check that the file wasn't modified.

---

## Next Steps After Loading

1. **Test in Application**:
   - Start backend: `npm run dev`
   - Login as admin
   - Go to "Create Assessment"
   - Filter by Class 4 → Mathematics
   - You should see all 50 questions

2. **Create a Test Assessment**:
   - Select 10-15 questions
   - Create an assessment
   - Take the quiz to verify everything works

3. **Load More Chapters**:
   - Create more HTML files in the same format
   - Use the same command with updated file path
