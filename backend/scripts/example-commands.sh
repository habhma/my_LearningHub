#!/bin/bash
# Example commands for bulk loading questions

# =============================================================
# PREREQUISITES: Get database IDs first
# =============================================================
# Run these SQL queries in your database:
#
# SELECT id, subject_name FROM subjects;
# SELECT id, category_name FROM exam_categories;
# SELECT id, topic_name FROM topics WHERE subject_id = 1;
# SELECT id, email FROM users;

# =============================================================
# EXAMPLE 1: Load Chapter1_Shapes.html (JavaScript array format)
# =============================================================
# Subject: Mathematics (id=1)
# Class: 4
# Category: CBSE (id=1)
# Created by: Admin user (id=1)

npm run bulk-load-enhanced -- ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html \
  --subject 1 \
  --class 4 \
  --category 1 \
  --created-by 1

# =============================================================
# EXAMPLE 2: With topic ID (e.g., "Parts and Wholes" topic)
# =============================================================

npm run bulk-load-enhanced -- ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html \
  --subject 1 \
  --topic 5 \
  --class 4 \
  --category 1 \
  --created-by 1

# =============================================================
# EXAMPLE 3: With custom difficulty (1=Easy, 2=Medium, 3=Hard)
# =============================================================

npm run bulk-load-enhanced -- ../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html \
  --subject 1 \
  --class 4 \
  --category 1 \
  --created-by 1 \
  --difficulty 2

# =============================================================
# EXAMPLE 4: Load from PDF file
# =============================================================

npm run bulk-load-enhanced -- questions.pdf \
  --subject 1 \
  --class 10 \
  --category 1 \
  --created-by 1

# =============================================================
# EXAMPLE 5: Load CSS-based HTML (original format)
# =============================================================

npm run bulk-load-enhanced -- sample-questions.html \
  --subject 1 \
  --class 10 \
  --category 1 \
  --created-by 1

# =============================================================
# BATCH PROCESSING: Load multiple files
# =============================================================

FILES=(
  "../QnA/CBSE/Maths/Std4/Chapter1_Shapes.html"
  "../QnA/CBSE/Maths/Std4/Chapter2_Numbers.html"
  "../QnA/CBSE/Maths/Std4/Chapter3_Patterns.html"
)

for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    echo "Loading $FILE..."
    npm run bulk-load-enhanced -- "$FILE" \
      --subject 1 \
      --class 4 \
      --category 1 \
      --created-by 1
    echo "Completed $FILE"
    echo "----------------------------------------"
  else
    echo "File not found: $FILE"
  fi
done

# =============================================================
# WINDOWS POWERSHELL VERSION (for Windows users)
# =============================================================
# Run these commands in PowerShell instead:

# Single file:
# npm run bulk-load-enhanced -- ..\QnA\CBSE\Maths\Std4\Chapter1_Shapes.html --subject 1 --class 4 --category 1 --created-by 1

# Batch processing:
# $files = @(
#   "..\QnA\CBSE\Maths\Std4\Chapter1_Shapes.html",
#   "..\QnA\CBSE\Maths\Std4\Chapter2_Numbers.html"
# )
# foreach ($file in $files) {
#   if (Test-Path $file) {
#     Write-Host "Loading $file..."
#     npm run bulk-load-enhanced -- $file --subject 1 --class 4 --category 1 --created-by 1
#   }
# }
