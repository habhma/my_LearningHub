# 🎯 Interactive Bulk Load - User-Friendly Question Import

## ✨ What Makes This Special?

This interactive script provides a **guided wizard** that:
- ✅ **Extracts metadata** from your HTML file automatically
- ✅ **Shows available options** from your database
- ✅ **Guides you step-by-step** through selections
- ✅ **No need to remember IDs** - just pick from the list!
- ✅ **Suggests values** based on file content
- ✅ **Confirms before importing** to prevent mistakes

## 🚀 Quick Start (Super Simple!)

### Step 1: Navigate to backend

```bash
cd backend
```

### Step 2: Run the interactive script

```bash
npm run bulk-load-interactive -- ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html
```

### Step 3: Follow the wizard!

The script will guide you through 8 simple steps with clear prompts and options.

## 📸 What It Looks Like

```
============================================================
📚 INTERACTIVE BULK LOAD - Question Import Wizard
============================================================

📄 File Title: Parts and Wholes Quiz
📖 Chapter Info: Chapter 5: Sharing and Measuring Practice Problems
📊 Total Questions: 50

------------------------------------------------------------

1️⃣  SELECT SUBJECT
   [1] ✓ Mathematics
   [2]   Science
   [3]   English
   [4]   Social Studies
   [5]   Hindi

Enter subject number: 1

2️⃣  SELECT TOPIC (Optional - press Enter to skip)
   [0] No topic / Skip
   [1] Parts and Wholes
   [2] Numbers
   [3] Patterns

Enter topic number (or press Enter to skip): 1

3️⃣  ENTER CLASS LEVEL
   Suggested: 4 (from file)
Enter class level (1-12) [4]: 4

4️⃣  SELECT EXAM CATEGORY
   [1] ✓ CBSE Board
   [2]   ICSE Board
   [3]   State Board

Enter exam category number: 1

5️⃣  SELECT QUESTION TYPE
   [1] ✓ Multiple Choice
   [2]   True/False
   [3]   Fill in the Blanks

Enter question type number: 1

6️⃣  SELECT DIFFICULTY LEVEL
   [1]   Easy
   [2] ✓ Medium
   [3]   Hard

Enter difficulty number: 2

7️⃣  ENTER MARKS PER QUESTION
Enter marks per question [1]: 1

8️⃣  ENTER NEGATIVE MARKS
Enter negative marks per wrong answer [0]: 0

============================================================
⚠️  CONFIRM SETTINGS BEFORE LOADING
============================================================
Press Ctrl+C to cancel, or press Enter to continue...

============================================================
🚀 STARTING BULK LOAD
============================================================
📄 File: ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html
📚 Subject: Mathematics
📖 Topic: Parts and Wholes
🎓 Class: 4
📋 Category: CBSE Board
❓ Type: Multiple Choice
⭐ Difficulty: Medium
✅ Marks: 1
❌ Negative Marks: 0
📊 Total Questions: 50
============================================================

✅ Progress: 50/50 questions loaded...

============================================================
📊 BULK LOAD SUMMARY
============================================================
✅ Success: 50
❌ Failed: 0
📈 Success Rate: 100.00%
```

## 🎯 The 8 Simple Steps

| Step | What You Choose | How It Helps |
|------|-----------------|--------------|
| 1️⃣ | **Subject** | Pick from list (e.g., Mathematics) |
| 2️⃣ | **Topic** | Optional - organize by chapter/topic |
| 3️⃣ | **Class Level** | Auto-suggested from file! |
| 4️⃣ | **Exam Category** | Pick from list (e.g., CBSE Board) |
| 5️⃣ | **Question Type** | Pick from list (e.g., Multiple Choice) |
| 6️⃣ | **Difficulty** | Pick from list (e.g., Medium) |
| 7️⃣ | **Marks** | Enter value (default: 1) |
| 8️⃣ | **Negative Marks** | Enter value (default: 0) |

## ✅ Smart Features

### 1. Auto-Detection from File

The script automatically detects:
- ✅ **Quiz Title** - from `<h1>` or `<title>` tag
- ✅ **Chapter Info** - from `.subtitle` element
- ✅ **Class Level** - from file path or content (e.g., "Std4" → suggests 4)
- ✅ **Subject** - from file path or content
- ✅ **Question Count** - from quizData array

### 2. Helpful Markers

- ✓ = **Recommended option** based on common choices
- [Default] = **Suggested value** you can accept by pressing Enter

### 3. Database Integration

The script fetches **live data** from your database:
- Only shows **active** subjects, categories, types
- Displays in proper **display order**
- Shows actual **names** instead of IDs

### 4. Safety Confirmation

Before loading:
- Shows all your selections
- Gives you a chance to cancel (Ctrl+C)
- Confirms you want to proceed

## 📋 Prerequisites

### 1. Database Must Be Seeded

Make sure your database has:
- ✅ Subjects (Mathematics, Science, etc.)
- ✅ Exam Categories (CBSE, ICSE, etc.)
- ✅ Question Types (MCQ, True/False, etc.)
- ✅ Difficulty Levels (Easy, Medium, Hard)
- ✅ At least one Admin user

**Seed the database:**
```bash
npm run db:seed
```

### 2. Dependencies Installed

```bash
npm install pdf-parse jsdom @types/pdf-parse
```

## 🎓 Complete Example

```bash
# Navigate to backend
cd backend

# Run the interactive script
npm run bulk-load-interactive -- ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html

# Follow the prompts:
# 1. Select subject: Mathematics [1]
# 2. Select topic: Parts and Wholes [1] or skip [Enter]
# 3. Enter class: 4 (or press Enter to use suggested)
# 4. Select category: CBSE Board [1]
# 5. Select type: Multiple Choice [1]
# 6. Select difficulty: Medium [2]
# 7. Enter marks: 1 (or press Enter for default)
# 8. Enter negative marks: 0 (or press Enter for default)
# 9. Press Enter to confirm and start loading

# Done! 50 questions loaded ✅
```

## 🆚 Comparison with Other Scripts

| Feature | Interactive | Enhanced | Original |
|---------|------------|----------|----------|
| User-friendly wizard | ✅ | ❌ | ❌ |
| Shows available options | ✅ | ❌ | ❌ |
| Auto-suggests values | ✅ | ❌ | ❌ |
| No need to remember IDs | ✅ | ❌ | ❌ |
| Extracts file metadata | ✅ | ❌ | ❌ |
| Supports command-line args | ❌ | ✅ | ✅ |
| Supports PDF files | ❌ | ✅ | ✅ |
| JavaScript array HTML | ✅ | ✅ | ❌ |
| CSS class HTML | ❌ | ✅ | ✅ |

## 💡 When to Use Each Script

### Use Interactive (Recommended for beginners)
- ✅ You want a guided experience
- ✅ You're not sure about database IDs
- ✅ You have HTML files with JavaScript arrays
- ✅ First time loading questions

### Use Enhanced
- ✅ You know all the database IDs
- ✅ You want to script/automate batch loading
- ✅ You need to support PDF files
- ✅ You prefer command-line parameters

### Use Original
- ✅ You have CSS-based HTML files
- ✅ You're already familiar with the old script
- ✅ Backward compatibility needed

## 🔍 What Gets Extracted from Your HTML

From your `Chapter1_Shapes.html`:

```javascript
// Extracted automatically:
✅ Title: "Parts and Wholes Quiz"
✅ Subtitle: "Chapter 5: Sharing and Measuring Practice Problems"
✅ Question Count: 50
✅ Suggested Class: 4 (from file path)
✅ Suggested Subject: Mathematics (from file path)

// You still choose:
📝 Exact subject from your database
📝 Topic (Parts and Wholes)
📝 Exam category (CBSE)
📝 Question type (Multiple Choice)
📝 Difficulty (Medium)
📝 Marks (1)
📝 Negative marks (0)
```

## 🛠️ Troubleshooting

### Issue: "No admin user found"

**Solution:** Create an admin user first
```sql
INSERT INTO users (email, password_hash, role, email_verified)
VALUES ('admin@example.com', 'hash', 'ADMIN', true);
```

Or use the seed script:
```bash
npm run db:seed
```

### Issue: "No questions found in the HTML file"

**Solution:** Verify your HTML has a `quizData` array
```bash
grep -n "const quizData" ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html
```

### Issue: No subjects/categories shown

**Solution:** Seed your database
```bash
npm run db:seed
```

### Issue: Invalid selection

Make sure you enter the **number** shown in brackets, not the name.

## 📊 Verify After Loading

```sql
-- Check total questions
SELECT COUNT(*) FROM questions
WHERE class_level = 4 AND subject_id = (SELECT id FROM subjects WHERE subject_name = 'Mathematics');

-- View sample questions
SELECT id, LEFT(question_text, 50) as question, marks, negative_marks
FROM questions
WHERE class_level = 4
LIMIT 5;

-- Check options
SELECT q.question_text, qo.option_text, qo.is_correct
FROM questions q
JOIN question_options qo ON q.id = qo.question_id
WHERE q.class_level = 4
LIMIT 20;
```

## 🎉 Benefits of Interactive Mode

1. **No SQL Queries Needed** - Script fetches everything from database
2. **No Memorizing IDs** - Pick from dropdown-style lists
3. **Auto-Suggestions** - Smart defaults based on file content
4. **Error Prevention** - Validates inputs at each step
5. **User-Friendly** - Clear prompts and helpful markers
6. **Safe** - Confirmation before loading
7. **Fast** - Once you know the flow, takes < 1 minute

## 📝 Tips for Best Results

1. **Organize Your Files** - Use clear folder structure like `QnA/CBSE/Maths/Std4/`
2. **Include Metadata** - Add clear titles and chapter info in HTML
3. **Test Small First** - Create a test file with 5 questions
4. **Seed Database** - Always seed before first use
5. **Check Results** - Verify in database after loading

## 🚀 Next Steps

After loading questions:

1. **Start the backend**
   ```bash
   npm run dev
   ```

2. **Login as admin** in your application

3. **Create an assessment**
   - Filter by Class 4 → Mathematics
   - Select questions
   - Create test

4. **Take a quiz** to verify everything works!

## 📞 Need Help?

The interactive script provides clear error messages. If you see an error:
1. Read the error message carefully
2. Check that database is seeded
3. Verify HTML file format is correct
4. Check that file path exists

## ⭐ Why This Is Better

**Before (Command-line):**
```bash
npm run bulk-load file.html --subject 1 --class 4 --category 1 --created-by 1 --type 1 --difficulty 2 --marks 1 --negative-marks 0
```
❌ Complex command
❌ Need to know all IDs
❌ Easy to make mistakes

**Now (Interactive):**
```bash
npm run bulk-load-interactive file.html
```
✅ Simple command
✅ Guided step-by-step
✅ Pick from lists
✅ Auto-suggestions
✅ Error prevention

---

**Ready to try? Just run:**
```bash
npm run bulk-load-interactive ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html
```

🎉 **That's it! The script will guide you through everything!**
