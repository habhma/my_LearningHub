# Bulk Load Questions Script

This script allows you to bulk load questions from PDF or HTML files into the database.

## Prerequisites

Install required dependencies:

```bash
cd backend
npm install pdf-parse jsdom @types/pdf-parse
```

## File Formats

### 1. PDF Format (`.pdf`)

```
Q1. Question text here?
A) Option 1
B) Option 2
C) Option 3
D) Option 4
Answer: C
Explanation: [Optional] Explanation text
Difficulty: [Optional] EASY/MEDIUM/HARD

Q2. Next question...
```

### 2. HTML Format (`.html` or `.htm`)

```html
<div class="question">
  <p class="question-text">Question text here?</p>
  <ul class="options">
    <li data-correct="false">Option 1</li>
    <li data-correct="false">Option 2</li>
    <li data-correct="true">Option 3</li>
    <li data-correct="false">Option 4</li>
  </ul>
  <p class="explanation">Explanation text</p>
  <p class="difficulty">MEDIUM</p>
</div>
```

## Usage

### Basic Command

```bash
cd backend
npx ts-node scripts/bulkLoadQuestions.ts <file-path> --subject <id> --class <level> --category <id> --created-by <user-id>
```

### Parameters

**Required:**
- `<file-path>` - Path to the PDF or HTML file containing questions
- `--subject <id>` - Subject ID from the database
- `--class <level>` - Class level (1-12)
- `--category <id>` - Exam category ID
- `--created-by <user-id>` - User ID of the creator

**Optional:**
- `--topic <id>` - Topic ID (if questions belong to specific topic)
- `--difficulty <id>` - Default difficulty ID (1=Easy, 2=Medium, 3=Hard)
- `--type <id>` - Question type ID (1=MCQ, 2=True/False, etc.)

### Examples

#### Load questions from HTML file:
```bash
npx ts-node scripts/bulkLoadQuestions.ts scripts/sample-questions.html \
  --subject 1 \
  --class 10 \
  --category 1 \
  --created-by 1
```

#### Load questions from PDF with topic:
```bash
npx ts-node scripts/bulkLoadQuestions.ts questions.pdf \
  --subject 2 \
  --topic 5 \
  --class 9 \
  --category 2 \
  --created-by 1 \
  --difficulty 2
```

## Getting IDs

### Get Subject IDs:
```sql
SELECT id, subject_name FROM subjects;
```

### Get Exam Category IDs:
```sql
SELECT id, category_name FROM exam_categories;
```

### Get Topic IDs:
```sql
SELECT id, topic_name FROM topics WHERE subject_id = <subject-id>;
```

### Get Difficulty IDs:
```sql
SELECT id, difficulty_name FROM question_difficulties;
```

### Get Question Type IDs:
```sql
SELECT id, type_name FROM question_types;
```

## Sample Files

Sample files are provided in the `scripts` directory:

1. `sample-questions.html` - HTML format example
2. `sample-questions-format.txt` - PDF format example (convert to PDF)

## Output

The script will display:
- Progress for each question
- Summary with success/failure counts
- List of any errors encountered

Example output:
```
🚀 Starting bulk load from: questions.pdf
📋 Config: { subjectId: 1, classLevel: 10, ... }
📄 Parsing PDF file...
✅ Parsed 20 questions
✅ Question 1/20 created (ID: 101)
✅ Question 2/20 created (ID: 102)
...

==================================================
📊 BULK LOAD SUMMARY
==================================================
✅ Success: 18
❌ Failed: 2
📈 Success Rate: 90.00%

🔴 ERRORS:
❌ Question 5 failed: Invalid option format
❌ Question 12 failed: Missing correct answer
```

## Tips

1. **Test with small files first** - Start with 5-10 questions to verify the format
2. **Check database IDs** - Make sure subject, category, and other IDs exist
3. **Review errors** - The script will show which questions failed and why
4. **Backup database** - Always backup before bulk loading large datasets
5. **Format consistency** - Ensure all questions follow the exact format

## Troubleshooting

### "File not found" error
- Check the file path is correct
- Use absolute path if relative path doesn't work

### "Missing required parameters" error
- Ensure all required flags are provided
- Check parameter names are correct (--subject, not -subject)

### Questions not parsing correctly
- Verify the file format matches the expected structure
- Check for extra spaces or formatting issues
- Ensure question numbers follow Q1., Q2., etc. pattern for PDF

### Database constraint errors
- Verify subject_id, category_id exist in the database
- Check that created_by user ID exists
- Ensure class_level is between 1 and 12

## Advanced Usage

### Adding script to package.json

Add this to `backend/package.json`:

```json
{
  "scripts": {
    "bulk-load": "ts-node scripts/bulkLoadQuestions.ts"
  }
}
```

Then use:
```bash
npm run bulk-load questions.pdf -- --subject 1 --class 10 --category 1 --created-by 1
```

## Support

For issues or questions, check:
1. The sample files for correct formatting
2. Database for valid IDs
3. Console output for detailed error messages
