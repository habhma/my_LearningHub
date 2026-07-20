# Enhanced Bulk Load Questions Script

This enhanced script supports **multiple HTML formats** including JavaScript-based quiz files like `Chapter1_Shapes.html`.

## What's New?

✅ **JavaScript Array Format Support** - Extracts questions from `const quizData = [...]` arrays  
✅ **Auto-Detection** - Automatically detects which HTML format to use  
✅ **Backward Compatible** - Still supports the original CSS class format and PDF files  

## Supported Formats

### 1. HTML with JavaScript Array (NEW)

Your `Chapter1_Shapes.html` file format:

```javascript
const quizData = [
  {
    "id": 1,
    "question": "What is the capital of France?",
    "options": ["London", "Paris", "Berlin", "Madrid"],
    "answer": 1,  // Index of correct answer (0-based)
    "explanation": "Paris is the capital of France."
  },
  // ... more questions
];
```

### 2. HTML with CSS Classes (Original)

```html
<div class="question">
  <p class="question-text">Question text here?</p>
  <ul class="options">
    <li data-correct="false">Option 1</li>
    <li data-correct="true">Option 2</li>
  </ul>
  <p class="explanation">Explanation text</p>
  <p class="difficulty">MEDIUM</p>
</div>
```

### 3. PDF Format

```
Q1. Question text here?
A) Option 1
B) Option 2
C) Option 3
D) Option 4
Answer: C
Explanation: Explanation text
Difficulty: MEDIUM
```

## Installation

```bash
cd backend
npm install pdf-parse jsdom @types/pdf-parse
```

## Usage

### Basic Command

```bash
npx ts-node scripts/bulkLoadQuestionsEnhanced.ts <file-path> --subject <id> --class <level> --category <id> --created-by <user-id>
```

### Load Your Chapter1_Shapes.html File

```bash
npx ts-node scripts/bulkLoadQuestionsEnhanced.ts QnA/CBSE/Maths/Std4/Chapter1_Shapes.html \
  --subject 1 \
  --class 4 \
  --category 1 \
  --created-by 1
```

### Parameters

**Required:**
- `<file-path>` - Path to PDF or HTML file
- `--subject <id>` - Subject ID (e.g., 1 for Mathematics)
- `--class <level>` - Class level (1-12)
- `--category <id>` - Exam category ID (e.g., 1 for CBSE)
- `--created-by <user-id>` - User ID of creator

**Optional:**
- `--topic <id>` - Topic ID (e.g., 5 for "Shapes and Patterns")
- `--difficulty <id>` - Default difficulty (1=Easy, 2=Medium, 3=Hard)
- `--type <id>` - Question type (1=MCQ, 2=True/False, etc.)

## Getting Database IDs

Before running the script, you need to know the correct IDs from your database.

### Get Subject ID

```sql
SELECT id, subject_name FROM subjects WHERE subject_name = 'Mathematics';
```

Example result: `id: 1, subject_name: Mathematics`

### Get Exam Category ID

```sql
SELECT id, category_name FROM exam_categories WHERE category_name = 'CBSE';
```

Example result: `id: 1, category_name: CBSE`

### Get Topic ID (Optional)

```sql
SELECT id, topic_name FROM topics 
WHERE subject_id = 1 AND topic_name LIKE '%Shapes%';
```

Example result: `id: 5, topic_name: Parts and Wholes`

### Get User ID

```sql
SELECT id, email FROM users WHERE email = 'admin@example.com';
```

Example result: `id: 1, email: admin@example.com`

## Complete Example Workflow

### Step 1: Check Database IDs

```bash
# Connect to your database
psql -d learning_hub  # or use your DB tool

# Run queries
SELECT id, subject_name FROM subjects;
SELECT id, category_name FROM exam_categories;
SELECT id, email FROM users;
```

### Step 2: Run Bulk Load

```bash
cd backend

# Example: Load Chapter1_Shapes.html for Std 4 Mathematics
npx ts-node scripts/bulkLoadQuestionsEnhanced.ts \
  ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html \
  --subject 1 \
  --topic 5 \
  --class 4 \
  --category 1 \
  --created-by 1 \
  --difficulty 2
```

### Step 3: Verify Results

The script will output:

```
🚀 Starting bulk load from: ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html
📋 Config: { subjectId: 1, topicId: 5, classLevel: 4, ... }
🌐 Parsing HTML file...
✅ Extracted 50 questions from JavaScript array
✅ Parsed 50 questions
✅ Question 1/50 created (ID: 101)
✅ Question 2/50 created (ID: 102)
...

==================================================
📊 BULK LOAD SUMMARY
==================================================
✅ Success: 50
❌ Failed: 0
📈 Success Rate: 100.00%
```

## Output Details

Each successfully loaded question includes:
- ✅ Question text
- ✅ 4 options with correct answer marked
- ✅ Explanation (if available)
- ✅ Difficulty level
- ✅ Subject, topic, and class associations
- ✅ Marks (default: 1.0)
- ✅ Negative marks (default: 0.25)

## Troubleshooting

### "No questions found in file"

**Problem:** Script couldn't parse questions from the file.

**Solutions:**
1. For JavaScript format: Ensure the array is named `quizData`
2. For CSS format: Check that elements have correct classes (`.question`, `.question-text`, `.options`)
3. Verify the file is not corrupted
4. Check the file encoding (should be UTF-8)

### "Missing required parameters"

**Problem:** Required command-line arguments not provided.

**Solution:**
```bash
# Make sure all required flags are present:
--subject <id>
--class <level>
--category <id>
--created-by <user-id>
```

### "Question X failed: Foreign key constraint"

**Problem:** Referenced IDs (subject, category, topic, user) don't exist in database.

**Solution:**
1. Verify IDs exist in database
2. Check for typos in command-line arguments
3. Ensure database is properly seeded with initial data

### "Invalid option format"

**Problem:** Question options are malformed.

**Solution:**
- For JavaScript format: Ensure `options` is an array of strings
- For JavaScript format: Ensure `answer` is a valid index (0-3)
- Check that all questions have at least 2 options

## Advanced Features

### Batch Processing Multiple Files

Create a bash script to process multiple HTML files:

```bash
#!/bin/bash
# bulk-load-all.sh

FILES=(
  "QnA/CBSE/Maths/Std4/Chapter1_Shapes.html"
  "QnA/CBSE/Maths/Std4/Chapter2_Numbers.html"
  "QnA/CBSE/Maths/Std4/Chapter3_Patterns.html"
)

for FILE in "${FILES[@]}"; do
  echo "Processing $FILE..."
  npx ts-node scripts/bulkLoadQuestionsEnhanced.ts "$FILE" \
    --subject 1 \
    --class 4 \
    --category 1 \
    --created-by 1
done
```

### Add to package.json

Add this to `backend/package.json`:

```json
{
  "scripts": {
    "bulk-load": "ts-node scripts/bulkLoadQuestionsEnhanced.ts"
  }
}
```

Then use:

```bash
npm run bulk-load -- QnA/CBSE/Maths/Std4/Chapter1_Shapes.html --subject 1 --class 4 --category 1 --created-by 1
```

## Format Detection Logic

The script automatically detects the format:

1. **File Extension Check**
   - `.pdf` → PDF parser
   - `.html` or `.htm` → HTML parser

2. **HTML Format Detection**
   - First tries: JavaScript array (`const quizData = [...]`)
   - Falls back to: CSS classes (`.question`, `.question-text`, etc.)

3. **Auto-Selection**
   - No manual configuration needed
   - Works with mixed file formats in batch processing

## Data Mapping

### JavaScript Array to Database

```javascript
// JavaScript object
{
  "question": "What is 2+2?",
  "options": ["2", "3", "4", "5"],
  "answer": 2,  // index 2 = "4"
  "explanation": "2+2 equals 4"
}

// Becomes in database:
Question {
  questionText: "What is 2+2?",
  options: [
    { optionText: "2", optionOrder: 1, isCorrect: false },
    { optionText: "3", optionOrder: 2, isCorrect: false },
    { optionText: "4", optionOrder: 3, isCorrect: true },  // ✓
    { optionText: "5", optionOrder: 4, isCorrect: false }
  ],
  correctAnswer: "C",  // Converted from index 2
  explanations: [{
    explanationType: "CORRECT_ANSWER",
    explanationText: "2+2 equals 4"
  }]
}
```

## Best Practices

1. **Test with Small Files First**
   - Start with 5-10 questions
   - Verify format and database connections
   - Then scale up to full files

2. **Backup Database**
   - Always backup before bulk loading
   - `pg_dump learning_hub > backup.sql`

3. **Verify IDs Before Running**
   - Double-check subject, category, topic, user IDs
   - Invalid IDs will cause all questions to fail

4. **Check Question Quality**
   - Review questions in the database after loading
   - Test in the application UI
   - Verify explanations display correctly

5. **Monitor Performance**
   - 50 questions takes ~5-10 seconds
   - For 500+ questions, consider batch processing
   - Watch for memory usage with very large files

## Differences from Original Script

| Feature | Original | Enhanced |
|---------|----------|----------|
| JavaScript Array Format | ❌ | ✅ |
| CSS Class Format | ✅ | ✅ |
| PDF Format | ✅ | ✅ |
| Auto-Detection | ❌ | ✅ |
| Error Handling | Basic | Improved |
| Format Validation | Limited | Comprehensive |

## Support

For issues or questions:
1. Check the console output for detailed error messages
2. Verify file format matches one of the supported formats
3. Ensure database IDs are correct
4. Review the example files in `scripts/` directory

## Files in This Directory

- `bulkLoadQuestionsEnhanced.ts` - Enhanced script (use this for new files)
- `bulkLoadQuestions.ts` - Original script (kept for compatibility)
- `README-ENHANCED-BULK-LOAD.md` - This file
- `README-BULK-LOAD.md` - Original documentation
- `sample-questions.html` - CSS class format example

## Quick Reference Commands

```bash
# Load from JavaScript array HTML
npm run bulk-load QnA/CBSE/Maths/Std4/Chapter1_Shapes.html --subject 1 --class 4 --category 1 --created-by 1

# Load with topic
npm run bulk-load file.html --subject 1 --topic 5 --class 4 --category 1 --created-by 1

# Load with custom difficulty
npm run bulk-load file.html --subject 1 --class 4 --category 1 --created-by 1 --difficulty 3

# Load from PDF
npm run bulk-load questions.pdf --subject 1 --class 10 --category 1 --created-by 1
```
