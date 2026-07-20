# READY-TO-USE COMMAND FOR YOUR REQUIREMENTS
# ============================================

# Your Requirements:
# - Subject: Mathematics
# - Question Type: Multiple Choice (MCQ)
# - Marks: 1
# - Negative Marks: 0
# - Exam Category: CBSE Board
# - Difficulty: Medium
# - Class: 4

# STEP 1: Navigate to backend directory
cd backend

# STEP 2: Run this command (update IDs based on your database)
npm run bulk-load-enhanced -- ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html \
  --subject 1 \
  --class 4 \
  --category 1 \
  --created-by 1 \
  --type 1 \
  --difficulty 2 \
  --marks 1 \
  --negative-marks 0

# ============================================
# WHAT EACH PARAMETER MEANS
# ============================================

# --subject 1           = Mathematics (check: SELECT id FROM subjects WHERE subject_name = 'Mathematics')
# --class 4             = Standard 4
# --category 1          = CBSE Board (check: SELECT id FROM exam_categories WHERE category_name LIKE '%CBSE%')
# --created-by 1        = Admin user (check: SELECT id FROM users WHERE role = 'ADMIN')
# --type 1              = Multiple Choice (check: SELECT id FROM question_types WHERE type_code = 'MCQ')
# --difficulty 2        = Medium (check: SELECT id FROM difficulty_levels WHERE difficulty_code = 'MEDIUM')
# --marks 1             = 1 mark per question
# --negative-marks 0    = No negative marking

# ============================================
# OPTIONAL: Add topic if you want to categorize
# ============================================

npm run bulk-load-enhanced -- ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html \
  --subject 1 \
  --topic 5 \
  --class 4 \
  --category 1 \
  --created-by 1 \
  --type 1 \
  --difficulty 2 \
  --marks 1 \
  --negative-marks 0

# --topic 5 = Parts and Wholes (check: SELECT id FROM topics WHERE topic_name LIKE '%Parts%')

# ============================================
# WINDOWS POWERSHELL VERSION
# ============================================

# cd backend
# npm run bulk-load-enhanced -- ..\QnA\CBSE\Maths\Std4\Chapter1_Shapes.html --subject 1 --class 4 --category 1 --created-by 1 --type 1 --difficulty 2 --marks 1 --negative-marks 0

# ============================================
# VERIFY DATABASE IDS FIRST (RUN THESE SQL QUERIES)
# ============================================

# SELECT id, subject_name FROM subjects WHERE subject_name = 'Mathematics';
# SELECT id, category_name FROM exam_categories WHERE category_name LIKE '%CBSE%';
# SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1;
# SELECT id, type_name FROM question_types WHERE type_code = 'MCQ';
# SELECT id, difficulty_name FROM difficulty_levels WHERE difficulty_code = 'MEDIUM';
# SELECT id, topic_name FROM topics WHERE subject_id = 1 AND topic_name LIKE '%Parts%';

# ============================================
# EXPECTED OUTPUT
# ============================================

# 🚀 Starting bulk load from: ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html
# 📋 Config: { subjectId: 1, classLevel: 4, examCategoryId: 1, ... }
# 🌐 Parsing HTML file...
# ✅ Extracted 50 questions from JavaScript array
# ✅ Parsed 50 questions
# ✅ Question 1/50 created (ID: 101)
# ...
# ==================================================
# 📊 BULK LOAD SUMMARY
# ==================================================
# ✅ Success: 50
# ❌ Failed: 0
# 📈 Success Rate: 100.00%
