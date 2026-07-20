# Bulk Load Questions - Complete Summary

## ✅ What You Already Have

Your project already has a comprehensive bulk-loading system:

1. **Original Script**: `backend/scripts/bulkLoadQuestions.ts`
   - Supports PDF and HTML with CSS classes
   - Full documentation in `README-BULK-LOAD.md`

2. **Enhanced Script**: `backend/scripts/bulkLoadQuestionsEnhanced.ts` (NEW)
   - Supports your JavaScript array format (`Chapter1_Shapes.html`)
   - Auto-detects format
   - Backward compatible with original formats
   - Full documentation in `README-ENHANCED-BULK-LOAD.md`

## 📁 Your HTML File Format

Your file `QnA/CBSE/Maths/Std4/Chapter1_Shapes.html` contains:
- **50 questions** about "Parts and Wholes" (fractions)
- **JavaScript array format**: `const quizData = [{...}]`
- Each question has: question text, 4 options, correct answer index, explanation

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd backend
npm install pdf-parse jsdom @types/pdf-parse
```

### Step 2: Get Database IDs

Connect to your database and run:

```sql
-- Get subject ID for Mathematics
SELECT id, subject_name FROM subjects WHERE subject_name = 'Mathematics';

-- Get exam category ID for CBSE
SELECT id, category_name FROM exam_categories WHERE category_name = 'CBSE';

-- Get user ID (admin)
SELECT id, email FROM users WHERE role = 'ADMIN';

-- Optional: Get topic ID
SELECT id, topic_name FROM topics WHERE subject_id = 1 AND topic_name LIKE '%Shapes%';
```

### Step 3: Run the Script

```bash
cd backend

# Basic command (replace IDs with your actual database IDs)
npm run bulk-load-enhanced -- ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html \
  --subject 1 \
  --class 4 \
  --category 1 \
  --created-by 1

# With topic ID
npm run bulk-load-enhanced -- ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html \
  --subject 1 \
  --topic 5 \
  --class 4 \
  --category 1 \
  --created-by 1
```

### Step 4: Verify

Check the console output:
```
🚀 Starting bulk load from: ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html
✅ Extracted 50 questions from JavaScript array
✅ Question 1/50 created (ID: 101)
...
📊 BULK LOAD SUMMARY
✅ Success: 50
❌ Failed: 0
📈 Success Rate: 100.00%
```

## 📚 All Supported Formats

### 1. JavaScript Array (Your files)
```javascript
const quizData = [
  {
    "question": "What is 2+2?",
    "options": ["2", "3", "4", "5"],
    "answer": 2,
    "explanation": "2+2=4"
  }
];
```

### 2. HTML with CSS Classes
```html
<div class="question">
  <p class="question-text">What is 2+2?</p>
  <ul class="options">
    <li data-correct="false">2</li>
    <li data-correct="true">4</li>
  </ul>
  <p class="explanation">2+2=4</p>
</div>
```

### 3. PDF Format
```
Q1. What is 2+2?
A) 2
B) 3
C) 4
D) 5
Answer: C
Explanation: 2+2=4
```

## 📝 Command Line Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `<file-path>` | ✅ | Path to PDF/HTML file | `../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html` |
| `--subject` | ✅ | Subject ID | `1` (Mathematics) |
| `--class` | ✅ | Class level (1-12) | `4` |
| `--category` | ✅ | Exam category ID | `1` (CBSE) |
| `--created-by` | ✅ | User ID | `1` (Admin) |
| `--topic` | ❌ | Topic ID | `5` (Parts and Wholes) |
| `--difficulty` | ❌ | Difficulty ID (1-3) | `2` (Medium) |
| `--type` | ❌ | Question type | `1` (MCQ) |

## 🔧 Troubleshooting

### Issue: "File not found"
**Solution**: Use correct relative path from `backend/` directory
```bash
# From backend directory:
npm run bulk-load-enhanced -- ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html ...

# Or use absolute path:
npm run bulk-load-enhanced -- C:/Tech/my_LearningHuB/QnA/CBSE/Maths/Std4/Chapter1_Shapes.html ...
```

### Issue: "No questions found"
**Solution**: Check if `quizData` variable exists in HTML file
```bash
# Search for quizData in your file:
grep -n "const quizData" ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html
```

### Issue: "Missing required parameters"
**Solution**: Ensure all required flags are provided
```bash
npm run bulk-load-enhanced -- <file> --subject 1 --class 4 --category 1 --created-by 1
```

### Issue: "Foreign key constraint error"
**Solution**: Verify IDs exist in database
```sql
SELECT id FROM subjects WHERE id = 1;
SELECT id FROM exam_categories WHERE id = 1;
SELECT id FROM users WHERE id = 1;
```

## 📂 File Structure

```
backend/
├── scripts/
│   ├── bulkLoadQuestions.ts              # Original script
│   ├── bulkLoadQuestionsEnhanced.ts      # Enhanced script (NEW)
│   ├── README-BULK-LOAD.md               # Original docs
│   ├── README-ENHANCED-BULK-LOAD.md      # Enhanced docs (NEW)
│   ├── example-commands.sh               # Example commands (NEW)
│   └── sample-questions.html             # CSS format example
└── package.json                          # Contains npm scripts

QnA/
└── CBSE/
    └── Maths/
        └── Std4/
            └── Chapter1_Shapes.html      # Your file (50 questions)
```

## 🎯 Next Steps

1. **Test with your file**:
   ```bash
   npm run bulk-load-enhanced -- ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html --subject 1 --class 4 --category 1 --created-by 1
   ```

2. **Verify in database**:
   ```sql
   SELECT COUNT(*) FROM questions WHERE class_level = 4 AND subject_id = 1;
   SELECT * FROM questions LIMIT 5;
   ```

3. **Test in application**:
   - Start the backend: `npm run dev`
   - Create an assessment using the loaded questions
   - Take the quiz to verify everything works

4. **Add more files**:
   - Create more HTML files with quiz data
   - Use the same format as `Chapter1_Shapes.html`
   - Bulk load them with the same commands

## 📊 What Gets Created

For each question in your HTML file, the script creates:

1. **Question record**:
   - Question text
   - Subject, topic, class associations
   - Difficulty level
   - Marks and negative marks
   - Status (ACTIVE)

2. **4 Option records**:
   - Option text
   - Option order (1-4)
   - isCorrect flag

3. **Explanation record** (if provided):
   - Explanation type: CORRECT_ANSWER
   - Explanation text

## 🎓 Example Output

```
🚀 Starting bulk load from: ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html
📋 Config: { subjectId: 1, classLevel: 4, examCategoryId: 1, createdBy: 1 }
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

## 🔍 Files You Need

All files are ready in `backend/scripts/`:

1. ✅ `bulkLoadQuestionsEnhanced.ts` - Enhanced script
2. ✅ `README-ENHANCED-BULK-LOAD.md` - Complete documentation
3. ✅ `example-commands.sh` - Copy-paste examples
4. ✅ `SUMMARY.md` - This file

## 💡 Tips

1. **Start small**: Test with 5-10 questions first
2. **Backup database**: Before bulk loading large files
3. **Check IDs**: Verify all database IDs before running
4. **Monitor output**: Watch for errors in console
5. **Verify results**: Check database and test in UI

## 📞 Support

For issues:
1. Check console output for error messages
2. Review `README-ENHANCED-BULK-LOAD.md` for detailed troubleshooting
3. Verify file format matches examples
4. Ensure database IDs are correct
