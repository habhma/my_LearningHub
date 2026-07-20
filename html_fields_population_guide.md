# HTML Fields Population Guide - Questions Table

**Purpose:** This guide explains how to populate HTML-related fields in the questions, question_options, and question_explanations tables for rich text formatting.

---

## 📋 OVERVIEW

### HTML Fields in Schema

| Table | Field | Purpose | Required? |
|-------|-------|---------|-----------|
| `questions` | `question_text` | Plain text question | ✅ Required |
| `questions` | `question_html` | Rich HTML formatted question | ⚪ Optional |
| `questions` | `question_image_url` | Image URL for question | ⚪ Optional |
| `question_options` | `option_text` | Plain text option | ✅ Required |
| `question_options` | `option_html` | Rich HTML formatted option | ⚪ Optional |
| `question_options` | `option_image_url` | Image URL for option | ⚪ Optional |
| `question_explanations` | `explanation_text` | Plain text explanation | ✅ Required |
| `question_explanations` | `explanation_html` | Rich HTML formatted explanation | ⚪ Optional |
| `question_explanations` | `explanation_images` | JSONB array of images | ⚪ Optional |

---

## 🎯 WHEN TO USE HTML FIELDS

### Use `question_html` when:
- ✅ Mathematical equations (fractions, exponents, roots)
- ✅ Subscripts/Superscripts (H₂O, x², CO₂)
- ✅ Special formatting (bold, italic, underline)
- ✅ Tables or structured data
- ✅ Multiple paragraphs with formatting
- ✅ Chemical formulas
- ✅ Code snippets

### Use Plain Text (`question_text`) when:
- Simple text questions without formatting
- Always populate BOTH fields for consistency

---

## 📝 EXAMPLE 1: Simple Text Question

**Scenario:** Basic arithmetic question

```sql
INSERT INTO questions (
    question_text,
    question_html,
    type_id,
    difficulty_id,
    subject_id,
    class_level,
    exam_category_id,
    marks,
    correct_answer
) VALUES (
    'What is 5 + 3?',  -- Plain text
    '<p>What is <strong>5 + 3</strong>?</p>',  -- HTML version
    1,  -- MCQ type
    1,  -- Easy difficulty
    1,  -- Math subject
    1,  -- Class 1
    1,  -- Board Exam category
    1.0,
    'B'
);

-- Options (Plain text is enough here)
INSERT INTO question_options (question_id, option_text, option_html, option_order, is_correct) VALUES
(1, '5', '<p>5</p>', 1, FALSE),
(1, '8', '<p>8</p>', 2, TRUE),
(1, '10', '<p>10</p>', 3, FALSE),
(1, '15', '<p>15</p>', 4, FALSE);
```

---

## 📝 EXAMPLE 2: Mathematical Equation with Fractions

**Scenario:** Fraction problem requiring proper formatting

```sql
INSERT INTO questions (
    question_text,
    question_html,
    type_id,
    difficulty_id,
    subject_id,
    class_level,
    exam_category_id,
    marks,
    correct_answer
) VALUES (
    'Simplify: 3/4 + 1/4',  -- Plain text fallback
    '<p>Simplify: <span class="fraction"><sup>3</sup>&frasl;<sub>4</sub></span> + <span class="fraction"><sup>1</sup>&frasl;<sub>4</sub></span></p>',  -- HTML with proper fractions
    1,  -- MCQ
    2,  -- Medium difficulty
    1,  -- Math
    4,  -- Class 4
    1,  -- Board Exam
    2.0,
    'C'
);

-- Options with fractions
INSERT INTO question_options (question_id, option_text, option_html, option_order, is_correct) VALUES
(2, '1/2', '<p><span class="fraction"><sup>1</sup>&frasl;<sub>2</sub></span></p>', 1, FALSE),
(2, '3/8', '<p><span class="fraction"><sup>3</sup>&frasl;<sub>8</sub></span></p>', 2, FALSE),
(2, '1', '<p>1</p>', 3, TRUE),
(2, '4/8', '<p><span class="fraction"><sup>4</sup>&frasl;<sub>8</sub></span></p>', 4, FALSE);
```

---

## 📝 EXAMPLE 3: Science Question with Chemical Formula

**Scenario:** Chemistry question with subscripts/superscripts

```sql
INSERT INTO questions (
    question_text,
    question_html,
    type_id,
    difficulty_id,
    subject_id,
    class_level,
    exam_category_id,
    marks,
    correct_answer
) VALUES (
    'What is the chemical formula for water?',  -- Plain text
    '<p>What is the chemical formula for <strong>water</strong>?</p>',  -- HTML
    1,  -- MCQ
    1,  -- Easy
    2,  -- Science subject
    6,  -- Class 6
    1,  -- Board Exam
    1.0,
    'B'
);

-- Options with chemical formulas
INSERT INTO question_options (question_id, option_text, option_html, option_order, is_correct) VALUES
(3, 'H2O2', '<p>H<sub>2</sub>O<sub>2</sub></p>', 1, FALSE),
(3, 'H2O', '<p>H<sub>2</sub>O</p>', 2, TRUE),
(3, 'CO2', '<p>CO<sub>2</sub></p>', 3, FALSE),
(3, 'O2', '<p>O<sub>2</sub></p>', 4, FALSE);
```

---

## 📝 EXAMPLE 4: Math Question with Exponents

**Scenario:** Algebra with superscripts

```sql
INSERT INTO questions (
    question_text,
    question_html,
    type_id,
    difficulty_id,
    subject_id,
    class_level,
    exam_category_id,
    marks,
    correct_answer
) VALUES (
    'What is the value of 2^3?',  -- Plain text fallback
    '<p>What is the value of <strong>2<sup>3</sup></strong>?</p>',  -- HTML with superscript
    1,  -- MCQ
    2,  -- Medium
    1,  -- Math
    7,  -- Class 7
    2,  -- Math Olympiad
    2.0,
    'B'
);

INSERT INTO question_options (question_id, option_text, option_html, option_order, is_correct) VALUES
(4, '6', '<p>6</p>', 1, FALSE),
(4, '8', '<p>8</p>', 2, TRUE),
(4, '9', '<p>9</p>', 3, FALSE),
(4, '16', '<p>16</p>', 4, FALSE);
```

---

## 📝 EXAMPLE 5: Complex Math with MathML (Advanced)

**Scenario:** Complex equation using MathML or LaTeX rendering

```sql
INSERT INTO questions (
    question_text,
    question_html,
    type_id,
    difficulty_id,
    subject_id,
    class_level,
    exam_category_id,
    marks,
    correct_answer
) VALUES (
    'Solve: square root of 16',  -- Plain text
    '<p>Solve: <span class="math-inline">√16</span></p>',  -- HTML (or use MathJax/KaTeX)
    1,  -- MCQ
    2,  -- Medium
    1,  -- Math
    8,  -- Class 8
    2,  -- Olympiad
    3.0,
    'D'
);

INSERT INTO question_options (question_id, option_text, option_html, option_order, is_correct) VALUES
(5, '2', '<p>2</p>', 1, FALSE),
(5, '8', '<p>8</p>', 2, FALSE),
(5, '256', '<p>256</p>', 3, FALSE),
(5, '4', '<p>4</p>', 4, TRUE);
```

---

## 📝 EXAMPLE 6: Question with Explanation HTML

**Scenario:** Detailed explanation with step-by-step formatting

```sql
-- Insert question
INSERT INTO questions (
    question_text,
    question_html,
    type_id,
    difficulty_id,
    subject_id,
    class_level,
    exam_category_id,
    marks,
    correct_answer
) VALUES (
    'What is 15% of 200?',
    '<p>What is <strong>15%</strong> of <strong>200</strong>?</p>',
    1,  -- MCQ
    2,  -- Medium
    1,  -- Math
    7,  -- Class 7
    1,  -- Board Exam
    2.0,
    'C'
) RETURNING question_id;  -- Let's say it returns question_id = 6

-- Insert options
INSERT INTO question_options (question_id, option_text, option_html, option_order, is_correct) VALUES
(6, '15', '<p>15</p>', 1, FALSE),
(6, '20', '<p>20</p>', 2, FALSE),
(6, '30', '<p>30</p>', 3, TRUE),
(6, '50', '<p>50</p>', 4, FALSE);

-- Insert explanation with rich HTML
INSERT INTO question_explanations (
    question_id,
    explanation_type,
    explanation_text,
    explanation_html,
    step_by_step
) VALUES (
    6,
    'correct_answer',
    'To find 15% of 200: (15/100) × 200 = 30',  -- Plain text
    '<div class="explanation">
        <h4>Solution:</h4>
        <ol>
            <li><strong>Convert percentage to decimal:</strong> 15% = 15/100 = 0.15</li>
            <li><strong>Multiply:</strong> 0.15 × 200 = 30</li>
        </ol>
        <p class="answer">Therefore, <strong>15% of 200 = 30</strong></p>
    </div>',  -- Rich HTML explanation
    '[
        {"step": 1, "text": "Convert 15% to decimal: 15/100 = 0.15"},
        {"step": 2, "text": "Multiply: 0.15 × 200 = 30"}
    ]'::jsonb
);
```

---

## 🎨 RECOMMENDED HTML TAGS & CLASSES

### Safe HTML Tags (Whitelist)
```html
<p>         - Paragraphs
<strong>    - Bold text
<em>        - Italic text
<u>         - Underline
<sup>       - Superscript (exponents, powers)
<sub>       - Subscript (chemical formulas)
<span>      - Inline styling
<div>       - Block container
<ul>, <ol>, <li> - Lists
<table>, <tr>, <td> - Tables
<br>        - Line break
```

### Recommended CSS Classes
```css
.fraction       - Fraction formatting
.math-inline    - Inline math expressions
.equation       - Block equations
.highlight      - Highlighted text
.explanation    - Explanation container
.step           - Step-by-step items
```

---

## 🔐 SECURITY: HTML SANITIZATION

**⚠️ CRITICAL:** Always sanitize HTML input to prevent XSS attacks!

### Backend Sanitization (Node.js Example)
```javascript
const sanitizeHtml = require('sanitize-html');

const cleanOptions = {
    allowedTags: ['p', 'strong', 'em', 'u', 'sup', 'sub', 'span', 'div', 
                  'ul', 'ol', 'li', 'br', 'table', 'tr', 'td', 'th'],
    allowedAttributes: {
        'span': ['class'],
        'div': ['class'],
        'p': ['class']
    },
    allowedClasses: {
        'span': ['fraction', 'math-inline', 'highlight'],
        'div': ['explanation', 'equation'],
        'p': ['answer', 'note']
    }
};

function sanitizeQuestionHTML(html) {
    return sanitizeHtml(html, cleanOptions);
}

// Usage
const userInputHTML = req.body.question_html;
const cleanHTML = sanitizeQuestionHTML(userInputHTML);
```

---

## 📊 BULK INSERT EXAMPLE

**Scenario:** Inserting multiple questions with HTML in one transaction

```sql
BEGIN;

-- Insert question 1
INSERT INTO questions (question_text, question_html, type_id, difficulty_id, 
                       subject_id, class_level, exam_category_id, marks, correct_answer)
VALUES 
('What is 2 + 2?', '<p>What is <strong>2 + 2</strong>?</p>', 1, 1, 1, 1, 1, 1.0, 'D'),
('What is 10 - 5?', '<p>What is <strong>10 - 5</strong>?</p>', 1, 1, 1, 1, 1, 1.0, 'B'),
('What is 3 × 4?', '<p>What is <strong>3 × 4</strong>?</p>', 1, 2, 1, 2, 1, 1.0, 'C');

-- Insert options for question 1 (assuming question_id = 1)
INSERT INTO question_options (question_id, option_text, option_html, option_order, is_correct)
VALUES 
(1, '3', '<p>3</p>', 1, FALSE),
(1, '4', '<p>4</p>', 2, FALSE),
(1, '5', '<p>5</p>', 3, FALSE),
(1, '4', '<p>4</p>', 4, TRUE);

COMMIT;
```

---

## 🛠️ BACKEND API EXAMPLE (Node.js/Express)

```javascript
const express = require('express');
const { Pool } = require('pg');
const sanitizeHtml = require('sanitize-html');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Create question endpoint
app.post('/api/questions', async (req, res) => {
    const {
        question_text,
        question_html,
        question_image_url,
        type_id,
        difficulty_id,
        subject_id,
        class_level,
        exam_category_id,
        marks,
        correct_answer,
        options = []
    } = req.body;

    // Sanitize HTML
    const cleanHTML = question_html ? sanitizeHtml(question_html, cleanOptions) : null;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Insert question
        const questionResult = await client.query(`
            INSERT INTO questions (
                question_text, question_html, question_image_url,
                type_id, difficulty_id, subject_id, class_level,
                exam_category_id, marks, correct_answer
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING question_id
        `, [question_text, cleanHTML, question_image_url, type_id, difficulty_id, 
            subject_id, class_level, exam_category_id, marks, correct_answer]);

        const questionId = questionResult.rows[0].question_id;

        // Insert options
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            const cleanOptionHTML = option.option_html ? 
                sanitizeHtml(option.option_html, cleanOptions) : null;

            await client.query(`
                INSERT INTO question_options (
                    question_id, option_text, option_html, 
                    option_order, is_correct
                ) VALUES ($1, $2, $3, $4, $5)
            `, [questionId, option.option_text, cleanOptionHTML, 
                i + 1, option.is_correct]);
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            question_id: questionId,
            message: 'Question created successfully'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating question:', error);
        res.status(500).json({ error: 'Failed to create question' });
    } finally {
        client.release();
    }
});
```

---

## 🎯 FRONTEND RICH TEXT EDITOR OPTIONS

### Option 1: TinyMCE (Recommended)
```javascript
import { Editor } from '@tinymce/tinymce-react';

<Editor
  apiKey="your-api-key"
  init={{
    height: 300,
    menubar: false,
    plugins: ['lists', 'link', 'image', 'code'],
    toolbar: 'bold italic underline | superscript subscript | bullist numlist',
    valid_elements: 'p,strong,em,u,sup,sub,span[class],div[class],ul,ol,li,br'
  }}
  onEditorChange={(content) => setQuestionHTML(content)}
/>
```

### Option 2: Quill
```javascript
import ReactQuill from 'react-quill';

<ReactQuill 
  value={questionHTML}
  onChange={setQuestionHTML}
  modules={{
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }]
    ]
  }}
/>
```

### Option 3: ContentEditable with Math Support
```javascript
import { MathfieldElement } from 'mathlive';

<div 
  contentEditable
  dangerouslySetInnerHTML={{ __html: questionHTML }}
  onBlur={(e) => setQuestionHTML(e.target.innerHTML)}
/>
```

---

## 📊 DISPLAY ON FRONTEND

```javascript
// React Component
function QuestionDisplay({ question }) {
    return (
        <div className="question-container">
            {/* Use HTML version if available, fallback to text */}
            {question.question_html ? (
                <div 
                    className="question-html"
                    dangerouslySetInnerHTML={{ 
                        __html: DOMPurify.sanitize(question.question_html) 
                    }}
                />
            ) : (
                <p className="question-text">{question.question_text}</p>
            )}

            {question.question_image_url && (
                <img 
                    src={question.question_image_url} 
                    alt="Question illustration"
                    className="question-image"
                />
            )}

            <div className="options">
                {question.options.map((option, idx) => (
                    <div key={option.option_id} className="option">
                        <input 
                            type="radio" 
                            id={`option-${option.option_id}`}
                            name="answer"
                            value={option.option_id}
                        />
                        <label htmlFor={`option-${option.option_id}`}>
                            {option.option_html ? (
                                <span dangerouslySetInnerHTML={{ 
                                    __html: DOMPurify.sanitize(option.option_html) 
                                }} />
                            ) : (
                                option.option_text
                            )}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

---

## ✅ BEST PRACTICES

1. **Always Populate Both Fields**
   - `question_text` (plain text) - Required, fallback
   - `question_html` (rich HTML) - Optional, enhanced display

2. **Sanitize All HTML Input**
   - Use libraries like `sanitize-html` (Node.js) or `DOMPurify` (Frontend)
   - Whitelist only safe tags

3. **Keep HTML Simple**
   - Avoid complex CSS or JavaScript
   - Use semantic HTML tags

4. **Test Rendering**
   - Ensure HTML renders correctly on all devices
   - Test with math symbols, fractions, subscripts

5. **Use CSS Classes Instead of Inline Styles**
   - Easier to maintain consistent styling
   - Better security (no inline styles)

6. **Fallback Strategy**
   - Always check if HTML exists before rendering
   - Gracefully degrade to plain text

---

## 🔍 TESTING QUERIES

### Check Questions with HTML
```sql
SELECT 
    question_id,
    question_text,
    question_html IS NOT NULL as has_html,
    LENGTH(question_html) as html_length
FROM questions
WHERE question_html IS NOT NULL;
```

### Find Questions Missing HTML (but should have it)
```sql
SELECT question_id, question_text
FROM questions
WHERE question_text LIKE '%^%'  -- Contains exponent symbol
   OR question_text LIKE '%/%'  -- Contains fraction
   OR question_text LIKE '%₂%'  -- Contains subscript
   AND question_html IS NULL;
```

---

**END OF GUIDE**

*This guide covers HTML field population for questions, options, and explanations with security best practices.*
