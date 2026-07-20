# AI LLM Question Generation Guide

**Purpose:** Use AI LLMs (like Claude, GPT-4, Gemini) to automatically generate educational questions based on syllabus, existing questions, or topics.

---

## 🎯 OVERVIEW

**Yes, you can absolutely use AI LLMs to generate questions!** This is a powerful feature that can:

✅ Generate unlimited practice questions  
✅ Create variations of existing questions  
✅ Generate questions for specific difficulty levels  
✅ Adapt questions to different class levels  
✅ Create questions covering entire syllabus  
✅ Generate questions in bulk (100s or 1000s)  
✅ Ensure curriculum alignment  

---

## 🏗️ ARCHITECTURE OPTIONS

### **Option 1: On-Demand Generation (Recommended for MVP)**
- Generate questions when user requests a test
- No storage cost (generate fresh each time)
- Always up-to-date content
- Can personalize based on student performance

### **Option 2: Pre-Generation + Storage (Recommended for Scale)**
- Generate questions in bulk using AI
- Store in database for instant access
- Admin reviews/approves before activating
- Better for production performance
- Hybrid: Store popular topics, generate rare ones on-demand

### **Option 3: Hybrid Approach (Best of Both)**
- Pre-generate common questions (Class 1-5, basic topics)
- On-demand generation for advanced topics (Class 6-10, Olympiad)
- Cache frequently requested questions

---

## 🤖 RECOMMENDED AI MODELS FOR QUESTION GENERATION

### **1. Claude (Anthropic) - ⭐ Highly Recommended**
**Why Claude:**
- Excellent at following structured output formats (JSON)
- Strong reasoning for math and science questions
- Can generate detailed explanations
- Good at maintaining difficulty levels
- Follows instructions precisely

**Pricing:**
- Claude 3.5 Sonnet: $3/M input tokens, $15/M output tokens
- Claude 3 Haiku: $0.25/M input tokens, $1.25/M output tokens (budget-friendly)

**Best For:** Math Olympiad, complex reasoning, detailed explanations

### **2. GPT-4 / GPT-4o (OpenAI)**
**Why GPT-4:**
- Strong general knowledge
- Good at creative question variations
- Large context window (128K tokens)
- Reliable structured outputs

**Pricing:**
- GPT-4o: $2.50/M input tokens, $10/M output tokens
- GPT-4o-mini: $0.15/M input tokens, $0.60/M output tokens (cheapest)

**Best For:** Bulk generation, simple questions, vocabulary/grammar

### **3. Gemini Pro (Google)**
**Why Gemini:**
- Free tier available (60 requests/min)
- Good for CBSE/ICSE syllabus (trained on Indian content)
- Multimodal (can analyze images from textbooks)

**Pricing:**
- Gemini 1.5 Flash: Free tier available, then $0.075/M tokens
- Gemini 1.5 Pro: $1.25/M input tokens, $5/M output tokens

**Best For:** CBSE/ICSE aligned questions, budget projects, image analysis

### **4. Llama 3.1 (Open Source - Self-Hosted)**
**Why Llama:**
- Completely free (self-hosted)
- No API costs
- Privacy (data never leaves your server)

**Costs:**
- GPU server rental (~$0.50-1/hour on RunPod/vast.ai)
- Or free with local GPU (RTX 4090, A100)

**Best For:** High volume, privacy-sensitive content, offline generation

---

## 📋 IMPLEMENTATION STRATEGY

### **Phase 1: Manual Review Workflow (Recommended Start)**
```
AI Generates → Admin Reviews → Approve/Reject → Store in DB → Publish
```

### **Phase 2: Semi-Automated**
```
AI Generates → Auto Quality Check → Flag suspicious → Admin Reviews Flags → Publish
```

### **Phase 3: Fully Automated**
```
AI Generates → Multi-Model Validation → Auto-publish → User Reports → Fix
```

---

## 🛠️ IMPLEMENTATION: CLAUDE API (Recommended)

### **Step 1: Install Dependencies**

```bash
npm install @anthropic-ai/sdk
npm install dotenv
```

### **Step 2: Setup Environment Variables**

```bash
# .env file
ANTHROPIC_API_KEY=sk-ant-api03-...
DATABASE_URL=postgresql://user:pass@localhost:5432/assessment_db
```

### **Step 3: Question Generation Script**

```javascript
// generate-questions.js
import Anthropic from '@anthropic-ai/sdk';
import { Pool } from 'pg';
import 'dotenv/config';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Generate questions using Claude AI
 */
async function generateQuestions(params) {
  const {
    subject = 'Mathematics',
    topic = 'Fractions',
    class_level = 4,
    difficulty = 'medium',
    count = 5,
    exam_category = 'Board Exam'
  } = params;

  const prompt = `You are an expert educational content creator for Indian students (CBSE/ICSE boards).

Generate ${count} high-quality multiple-choice questions (MCQs) for:

**Subject:** ${subject}
**Topic:** ${topic}
**Class:** ${class_level}
**Difficulty:** ${difficulty}
**Exam Type:** ${exam_category}

**Requirements:**
1. Questions must be age-appropriate for Class ${class_level}
2. Follow NCERT/CBSE curriculum standards
3. Include 4 options (A, B, C, D) with exactly ONE correct answer
4. Provide detailed explanations for correct AND wrong answers
5. Use proper mathematical notation where needed
6. Ensure questions test conceptual understanding, not just memorization

**Output Format (JSON):**
Return a JSON array with this exact structure:

{
  "questions": [
    {
      "question_text": "Plain text question",
      "question_html": "<p>HTML formatted question with <sup>superscripts</sup> or <sub>subscripts</sub></p>",
      "difficulty": "easy|medium|hard",
      "marks": 1.0,
      "time_limit_seconds": 120,
      "correct_answer": "B",
      "options": [
        {
          "option_text": "Option A plain text",
          "option_html": "<p>Option A HTML</p>",
          "option_order": 1,
          "is_correct": false
        },
        {
          "option_text": "Option B plain text",
          "option_html": "<p>Option B HTML</p>",
          "option_order": 2,
          "is_correct": true
        },
        {
          "option_text": "Option C plain text",
          "option_html": "<p>Option C HTML</p>",
          "option_order": 3,
          "is_correct": false
        },
        {
          "option_text": "Option D plain text",
          "option_html": "<p>Option D HTML</p>",
          "option_order": 4,
          "is_correct": false
        }
      ],
      "explanation": {
        "explanation_text": "Plain text explanation",
        "explanation_html": "<div><h4>Solution:</h4><ol><li>Step 1...</li><li>Step 2...</li></ol></div>",
        "step_by_step": [
          {"step": 1, "text": "First, identify..."},
          {"step": 2, "text": "Then, calculate..."}
        ]
      }
    }
  ]
}

**Important:**
- question_text must ALWAYS be filled (plain text fallback)
- question_html should have proper HTML formatting when needed
- All options must have both option_text and option_html
- Explanation must be detailed and educational
- Ensure ONLY ONE option has is_correct: true

Generate ${count} questions now.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = message.content[0].text;
    
    // Extract JSON from response (Claude might wrap it in markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const generatedData = JSON.parse(jsonMatch[0]);
    return generatedData.questions;

  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

/**
 * Insert generated questions into database
 */
async function insertQuestionsToDatabase(questions, metadata) {
  const client = await pool.connect();
  const insertedQuestions = [];

  try {
    await client.query('BEGIN');

    for (const q of questions) {
      // Map difficulty text to difficulty_id (assuming these IDs exist)
      const difficultyMap = { 'easy': 1, 'medium': 2, 'hard': 3 };
      const difficulty_id = difficultyMap[q.difficulty.toLowerCase()] || 2;

      // Insert question
      const questionResult = await client.query(`
        INSERT INTO questions (
          question_text,
          question_html,
          type_id,
          difficulty_id,
          subject_id,
          topic_id,
          class_level,
          exam_category_id,
          correct_answer,
          time_limit_seconds,
          marks,
          status,
          created_by,
          metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING question_id
      `, [
        q.question_text,
        q.question_html,
        metadata.type_id || 1, // MCQ type
        difficulty_id,
        metadata.subject_id,
        metadata.topic_id || null,
        metadata.class_level,
        metadata.exam_category_id,
        q.correct_answer,
        q.time_limit_seconds || 180,
        q.marks || 1.0,
        'draft', // AI-generated questions start as draft
        metadata.created_by || null,
        JSON.stringify({ ai_generated: true, model: 'claude-3-5-sonnet' })
      ]);

      const question_id = questionResult.rows[0].question_id;

      // Insert options
      for (const opt of q.options) {
        await client.query(`
          INSERT INTO question_options (
            question_id,
            option_text,
            option_html,
            option_order,
            is_correct
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
          question_id,
          opt.option_text,
          opt.option_html,
          opt.option_order,
          opt.is_correct
        ]);
      }

      // Insert explanation
      if (q.explanation) {
        await client.query(`
          INSERT INTO question_explanations (
            question_id,
            explanation_type,
            explanation_text,
            explanation_html,
            step_by_step
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
          question_id,
          'correct_answer',
          q.explanation.explanation_text,
          q.explanation.explanation_html,
          JSON.stringify(q.explanation.step_by_step || [])
        ]);
      }

      insertedQuestions.push({
        question_id,
        question_text: q.question_text
      });
    }

    await client.query('COMMIT');
    console.log(`✅ Successfully inserted ${insertedQuestions.length} questions`);
    return insertedQuestions;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error inserting questions:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting AI question generation...\n');

    // Example: Generate math questions for Class 4
    const questions = await generateQuestions({
      subject: 'Mathematics',
      topic: 'Fractions - Addition and Subtraction',
      class_level: 4,
      difficulty: 'medium',
      count: 5,
      exam_category: 'Board Exam'
    });

    console.log(`✅ Generated ${questions.length} questions\n`);

    // Preview first question
    console.log('📝 Preview of first question:');
    console.log(JSON.stringify(questions[0], null, 2));
    console.log('\n');

    // Insert into database
    const metadata = {
      subject_id: 1,        // Math subject ID
      topic_id: 10,         // Fractions topic ID (example)
      class_level: 4,
      exam_category_id: 1,  // Board Exam category ID
      type_id: 1,           // MCQ type
      created_by: null      // System generated
    };

    const inserted = await insertQuestionsToDatabase(questions, metadata);
    console.log('\n✅ All questions inserted successfully!');
    console.log('Question IDs:', inserted.map(q => q.question_id));

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
main();
```

---

## 🚀 USAGE EXAMPLES

### **Example 1: Generate Questions from Command Line**

```bash
node generate-questions.js --subject "Mathematics" --topic "Algebra" --class 8 --count 10
```

### **Example 2: REST API Endpoint**

```javascript
// api/routes/questions.js
import express from 'express';
import { generateQuestions, insertQuestionsToDatabase } from '../services/ai-questions.js';

const router = express.Router();

/**
 * POST /api/questions/generate
 * Generate questions using AI
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      subject,
      topic,
      class_level,
      difficulty,
      count = 5,
      exam_category,
      subject_id,
      topic_id,
      exam_category_id,
      auto_publish = false // Default: save as draft
    } = req.body;

    // Validate admin permission
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can generate questions' });
    }

    // Generate questions using AI
    const questions = await generateQuestions({
      subject,
      topic,
      class_level,
      difficulty,
      count,
      exam_category
    });

    // Insert into database
    const metadata = {
      subject_id,
      topic_id,
      class_level,
      exam_category_id,
      type_id: 1, // MCQ
      created_by: req.user.user_id
    };

    const inserted = await insertQuestionsToDatabase(questions, metadata);

    // If auto_publish = true, mark as active
    if (auto_publish) {
      const questionIds = inserted.map(q => q.question_id);
      await pool.query(`
        UPDATE questions 
        SET status = 'active', is_active = true
        WHERE question_id = ANY($1)
      `, [questionIds]);
    }

    res.json({
      success: true,
      message: `Generated ${inserted.length} questions`,
      questions: inserted,
      status: auto_publish ? 'published' : 'draft'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

export default router;
```

---

## 📊 BULK GENERATION STRATEGY

### **Generate 10,000 Questions for Entire Syllabus**

```javascript
// bulk-generation.js
const syllabusConfig = [
  // Class 1-5: Basic topics
  { class_level: 1, subject: 'Mathematics', topics: ['Numbers 1-100', 'Addition', 'Subtraction'], count_per_topic: 50 },
  { class_level: 2, subject: 'Mathematics', topics: ['Multiplication Tables', 'Division', 'Shapes'], count_per_topic: 50 },
  { class_level: 3, subject: 'Mathematics', topics: ['Fractions', 'Measurement', 'Time'], count_per_topic: 50 },
  
  // Class 6-10: Advanced topics
  { class_level: 6, subject: 'Mathematics', topics: ['Integers', 'Fractions', 'Decimals', 'Algebra'], count_per_topic: 100 },
  { class_level: 7, subject: 'Mathematics', topics: ['Linear Equations', 'Geometry', 'Ratios'], count_per_topic: 100 },
  { class_level: 8, subject: 'Mathematics', topics: ['Quadratic Equations', 'Trigonometry'], count_per_topic: 150 },
  
  // Science topics
  { class_level: 6, subject: 'Science', topics: ['Physics - Motion', 'Chemistry - Matter', 'Biology - Cells'], count_per_topic: 100 },
  // ... add more
];

async function bulkGenerate() {
  let totalGenerated = 0;

  for (const config of syllabusConfig) {
    for (const topic of config.topics) {
      console.log(`Generating ${config.count_per_topic} questions for ${config.subject} - ${topic} (Class ${config.class_level})`);

      // Generate in batches of 10 to avoid timeout
      const batches = Math.ceil(config.count_per_topic / 10);
      
      for (let i = 0; i < batches; i++) {
        try {
          const questions = await generateQuestions({
            subject: config.subject,
            topic: topic,
            class_level: config.class_level,
            difficulty: 'medium',
            count: 10,
            exam_category: 'Board Exam'
          });

          await insertQuestionsToDatabase(questions, {
            subject_id: getSubjectId(config.subject),
            class_level: config.class_level,
            exam_category_id: 1,
            type_id: 1
          });

          totalGenerated += questions.length;
          console.log(`✅ Batch ${i + 1}/${batches} completed. Total: ${totalGenerated}`);

          // Rate limiting: wait 2 seconds between batches
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
          console.error(`❌ Error in batch ${i + 1}:`, error.message);
          // Continue to next batch
        }
      }
    }
  }

  console.log(`\n🎉 Bulk generation complete! Total questions: ${totalGenerated}`);
}

bulkGenerate();
```

**Estimated Cost for 10,000 questions:**
- Claude 3.5 Sonnet: ~$50-100
- GPT-4o-mini: ~$10-20
- Gemini Flash: ~$5-10 (or free with tier)

---

## 🎨 VARIATION GENERATION

### **Create Variations of Existing Questions**

```javascript
async function generateVariations(originalQuestionId, count = 5) {
  // Fetch original question
  const result = await pool.query(`
    SELECT q.*, 
           array_agg(qo.*) as options,
           qe.explanation_text
    FROM questions q
    LEFT JOIN question_options qo ON q.question_id = qo.question_id
    LEFT JOIN question_explanations qe ON q.question_id = qe.question_id
    WHERE q.question_id = $1
    GROUP BY q.question_id, qe.explanation_text
  `, [originalQuestionId]);

  const original = result.rows[0];

  const prompt = `Given this original question:

**Question:** ${original.question_text}
**Options:**
${original.options.map(o => `- ${o.option_text} ${o.is_correct ? '(CORRECT)' : ''}`).join('\n')}
**Explanation:** ${original.explanation_text}

Generate ${count} NEW variations of this question that:
1. Test the same concept/skill
2. Use different numbers/contexts
3. Maintain same difficulty level
4. Have different correct answers
5. Are NOT too similar to the original

Output in the same JSON format as before.`;

  // Use Claude to generate variations
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }]
  });

  // Parse and insert variations
  // ... (same insertion logic)
}
```

---

## 🔍 QUALITY ASSURANCE

### **Automated Quality Checks**

```javascript
async function validateGeneratedQuestion(question) {
  const issues = [];

  // Check 1: Exactly one correct answer
  const correctCount = question.options.filter(o => o.is_correct).length;
  if (correctCount !== 1) {
    issues.push(`Expected 1 correct answer, found ${correctCount}`);
  }

  // Check 2: All options have text
  const emptyOptions = question.options.filter(o => !o.option_text || o.option_text.trim() === '');
  if (emptyOptions.length > 0) {
    issues.push('Some options have empty text');
  }

  // Check 3: Question text exists
  if (!question.question_text || question.question_text.trim() === '') {
    issues.push('Question text is empty');
  }

  // Check 4: Explanation exists
  if (!question.explanation || !question.explanation.explanation_text) {
    issues.push('Missing explanation');
  }

  // Check 5: Difficulty is valid
  if (!['easy', 'medium', 'hard'].includes(question.difficulty.toLowerCase())) {
    issues.push('Invalid difficulty level');
  }

  // Check 6: Options are distinct
  const optionTexts = question.options.map(o => o.option_text.toLowerCase());
  const uniqueTexts = new Set(optionTexts);
  if (uniqueTexts.size !== optionTexts.length) {
    issues.push('Duplicate options detected');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

// Use in generation pipeline
const questions = await generateQuestions(params);
const validatedQuestions = [];

for (const q of questions) {
  const validation = await validateGeneratedQuestion(q);
  if (validation.isValid) {
    validatedQuestions.push(q);
  } else {
    console.warn(`Question rejected:`, validation.issues);
  }
}

console.log(`✅ ${validatedQuestions.length}/${questions.length} questions passed validation`);
```

---

## 🎯 ADMIN REVIEW DASHBOARD

### **Database View for Pending AI Questions**

```sql
-- View for admin review
CREATE VIEW ai_generated_questions_pending AS
SELECT 
    q.question_id,
    q.question_text,
    q.question_html,
    q.class_level,
    s.subject_name,
    t.topic_name,
    d.difficulty_name,
    q.created_at,
    (SELECT COUNT(*) FROM question_options WHERE question_id = q.question_id) as option_count,
    (SELECT COUNT(*) FROM question_explanations WHERE question_id = q.question_id) as has_explanation
FROM questions q
JOIN subjects s ON q.subject_id = s.subject_id
LEFT JOIN topics t ON q.topic_id = t.topic_id
JOIN difficulty_levels d ON q.difficulty_id = d.difficulty_id
WHERE q.status = 'draft'
  AND q.metadata->>'ai_generated' = 'true'
ORDER BY q.created_at DESC;
```

### **Admin Approval Endpoint**

```javascript
router.post('/questions/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { approved, feedback } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }

  if (approved) {
    // Approve question
    await pool.query(`
      UPDATE questions 
      SET status = 'active', 
          is_active = true,
          updated_at = CURRENT_TIMESTAMP
      WHERE question_id = $1
    `, [id]);

    res.json({ success: true, message: 'Question approved' });
  } else {
    // Reject question (soft delete or mark as rejected)
    await pool.query(`
      UPDATE questions 
      SET status = 'rejected', 
          metadata = metadata || jsonb_build_object('rejection_reason', $2)
      WHERE question_id = $1
    `, [id, feedback]);

    res.json({ success: true, message: 'Question rejected' });
  }
});
```

---

## 📈 COST OPTIMIZATION STRATEGIES

### **1. Use Cheaper Models for Simple Questions**
```javascript
function selectModel(classLevel, difficulty) {
  // Class 1-3, Easy questions → Use GPT-4o-mini (cheapest)
  if (classLevel <= 3 && difficulty === 'easy') {
    return 'gpt-4o-mini';
  }
  
  // Class 4-7, Medium → Use Claude Haiku
  if (classLevel <= 7) {
    return 'claude-3-haiku-20240307';
  }
  
  // Class 8-10, Hard, Olympiad → Use Claude 3.5 Sonnet (best quality)
  return 'claude-3-5-sonnet-20241022';
}
```

### **2. Batch Requests**
```javascript
// Generate 10 questions per API call instead of 1
// Reduces overhead costs
const questions = await generateQuestions({ count: 10 }); // Not 1
```

### **3. Cache Generated Questions**
```javascript
// Store generated questions in Redis cache
// Reuse for similar requests
await redis.set(`questions:${cacheKey}`, JSON.stringify(questions), 'EX', 3600);
```

### **4. Use Prompt Caching (Claude)**
```javascript
// Claude offers prompt caching for repeated prompts
// Up to 90% cost reduction for bulk generation
const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 8000,
  system: [
    {
      type: 'text',
      text: SYSTEM_PROMPT, // This gets cached
      cache_control: { type: 'ephemeral' }
    }
  ],
  messages: [{ role: 'user', content: userPrompt }]
});
```

---

## 🔐 SECURITY & ETHICAL CONSIDERATIONS

### **1. Data Privacy**
- ✅ Don't send student PII to AI APIs
- ✅ Generate generic questions only
- ✅ Review AI outputs before publishing

### **2. Content Quality**
- ✅ Always have human review for production
- ✅ Track question performance (success_rate)
- ✅ Remove low-performing AI questions

### **3. Copyright**
- ✅ Don't feed copyrighted textbook content directly
- ✅ Use syllabus topics, not exact textbook text
- ✅ AI-generated content is generally copyright-free

### **4. Bias Detection**
- ✅ Review for cultural/gender/regional bias
- ✅ Ensure diversity in examples and contexts

---

## 📊 MONITORING & ANALYTICS

### **Track AI Question Performance**

```sql
-- Compare AI-generated vs human-created questions
SELECT 
    CASE 
        WHEN metadata->>'ai_generated' = 'true' THEN 'AI Generated'
        ELSE 'Human Created'
    END as source,
    COUNT(*) as total_questions,
    AVG(success_rate) as avg_success_rate,
    AVG(times_attempted) as avg_attempts,
    COUNT(CASE WHEN status = 'flagged' THEN 1 END) as flagged_count
FROM questions
WHERE is_active = true
GROUP BY metadata->>'ai_generated';
```

---

## 🎉 FULL EXAMPLE: END-TO-END WORKFLOW

```javascript
// complete-workflow.js

async function completeWorkflow() {
  // Step 1: Fetch syllabus topics from database
  const topics = await pool.query(`
    SELECT topic_id, topic_name, subject_id, class_level
    FROM topics
    WHERE is_active = true AND class_level = 5
  `);

  // Step 2: Generate questions for each topic
  for (const topic of topics.rows) {
    console.log(`Generating for: ${topic.topic_name}`);

    const questions = await generateQuestions({
      subject: 'Mathematics',
      topic: topic.topic_name,
      class_level: topic.class_level,
      difficulty: 'medium',
      count: 10
    });

    // Step 3: Validate questions
    const validQuestions = [];
    for (const q of questions) {
      const validation = await validateGeneratedQuestion(q);
      if (validation.isValid) {
        validQuestions.push(q);
      }
    }

    // Step 4: Insert to database as draft
    const inserted = await insertQuestionsToDatabase(validQuestions, {
      subject_id: topic.subject_id,
      topic_id: topic.topic_id,
      class_level: topic.class_level,
      exam_category_id: 1,
      type_id: 1
    });

    console.log(`✅ Inserted ${inserted.length} valid questions`);

    // Step 5: Notify admin for review
    await notifyAdmin({
      message: `${inserted.length} new AI questions ready for review`,
      topic: topic.topic_name,
      question_ids: inserted.map(q => q.question_id)
    });

    // Rate limiting
    await sleep(2000);
  }
}

completeWorkflow();
```

---

## 🚀 NEXT STEPS

### **Immediate (MVP)**
1. ✅ Setup Claude API / GPT-4 API
2. ✅ Create generation script with validation
3. ✅ Build admin review dashboard
4. ✅ Generate 100 sample questions
5. ✅ Test with real students

### **Phase 2**
1. ✅ Bulk generation for entire syllabus (5,000+ questions)
2. ✅ Variation generator for personalization
3. ✅ Multi-model validation (consensus)
4. ✅ Performance analytics dashboard

### **Phase 3**
1. ✅ On-demand generation during tests
2. ✅ Adaptive difficulty (based on student performance)
3. ✅ Image generation for diagrams (DALL-E)
4. ✅ Audio/video explanation generation

---

## 📚 RECOMMENDED RESOURCES

- **Claude API Docs:** https://docs.anthropic.com/
- **OpenAI API Docs:** https://platform.openai.com/docs
- **Google Gemini Docs:** https://ai.google.dev/docs
- **Prompt Engineering Guide:** https://www.promptingguide.ai/

---

**END OF GUIDE**

*You can absolutely use AI to generate questions at scale while maintaining quality through validation and human review!*
