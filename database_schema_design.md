# Database Schema Design - Student Assessment Platform

**Version:** 1.0  
**Date:** 2026-07-18  
**Database:** PostgreSQL 15+  
**Design Principle:** Configuration-driven, extensible, scalable

---

## 🎯 DESIGN PRINCIPLES

### 1. Configurability First
- **No hardcoded values** in application code
- All categories, subjects, boards stored in database
- Metadata-driven question types
- Admin can add/modify configurations via UI

### 2. Extensibility
- JSONB columns for flexible attributes
- Support for future features without schema changes
- Version tracking for critical entities

### 3. Data Integrity
- Foreign key constraints
- Check constraints for validation
- Unique constraints where needed
- NOT NULL for mandatory fields

### 4. Performance
- Indexes on foreign keys and frequently queried columns
- Partitioning strategy for large tables
- Denormalization where appropriate (leaderboards)

### 5. Audit Trail
- created_at, updated_at timestamps
- Soft deletes (deleted_at)
- Audit log tables for critical changes

---

## 📊 ENTITY RELATIONSHIP OVERVIEW

### Core Entities (15 main tables)

**User Management:**
- users
- user_profiles
- user_sessions

**Configuration (Lookup Tables):**
- exam_categories
- subjects
- boards
- topics
- difficulty_levels
- question_types

**Content:**
- questions
- question_options
- question_explanations
- question_tags
- tags

**Assessment:**
- tests (both practice and mock)
- test_attempts
- test_responses

**Subscription & Payment:**
- subscription_plans
- user_subscriptions
- payments
- user_subject_access

**Gamification:**
- badges
- user_badges
- points_transactions
- leaderboard_snapshots

**Support & Admin:**
- question_reports
- configuration_audit_log
- admin_users

---

## 📐 DETAILED TABLE SCHEMAS

---

### **1. USERS TABLE**

Core user authentication and basic info.

```sql
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- bcrypt hash
    role VARCHAR(20) NOT NULL DEFAULT 'student',  -- student, admin, teacher, parent
    status VARCHAR(20) NOT NULL DEFAULT 'active',  -- active, inactive, suspended
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,  -- soft delete
    
    CONSTRAINT chk_role CHECK (role IN ('student', 'admin', 'teacher', 'parent')),
    CONSTRAINT chk_status CHECK (status IN ('active', 'inactive', 'suspended'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
```

---

### **2. USER_PROFILES TABLE**

Extended user information (student-specific).

```sql
CREATE TABLE user_profiles (
    profile_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    school_name VARCHAR(255),
    class_level INTEGER NOT NULL,  -- 1-10
    board_id INTEGER,  -- FK to boards
    parent_name VARCHAR(255),
    parent_email VARCHAR(255),
    parent_phone VARCHAR(20),
    date_of_birth DATE,
    avatar_url VARCHAR(500),
    bio TEXT,
    preferences JSONB DEFAULT '{}',  -- {theme: 'dark', notifications: true, etc.}
    metadata JSONB DEFAULT '{}',  -- extensible custom fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_board FOREIGN KEY (board_id) REFERENCES boards(board_id),
    CONSTRAINT chk_class_level CHECK (class_level BETWEEN 1 AND 10)
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_class_level ON user_profiles(class_level);
CREATE INDEX idx_user_profiles_board_id ON user_profiles(board_id);
CREATE INDEX idx_user_profiles_school_name ON user_profiles(school_name);
```

---

### **3. USER_SESSIONS TABLE**

JWT refresh tokens and session management.

```sql
CREATE TABLE user_sessions (
    session_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    refresh_token VARCHAR(500) UNIQUE NOT NULL,
    device_info JSONB,  -- {device: 'mobile', os: 'iOS', browser: 'Safari'}
    ip_address INET,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```

---

## 🔧 CONFIGURATION TABLES (Lookup Tables)

---

### **4. BOARDS TABLE**

Educational boards (CBSE, ICSE, etc.) - **Configurable**

```sql
CREATE TABLE boards (
    board_id SERIAL PRIMARY KEY,
    board_name VARCHAR(100) UNIQUE NOT NULL,
    board_code VARCHAR(20) UNIQUE NOT NULL,  -- CBSE, ICSE, STATE_UP
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_boards_is_active ON boards(is_active);
CREATE INDEX idx_boards_board_code ON boards(board_code);

-- Initial Data
INSERT INTO boards (board_name, board_code, description, display_order) VALUES
('CBSE', 'CBSE', 'Central Board of Secondary Education', 1),
('ICSE', 'ICSE', 'Indian Certificate of Secondary Education', 2);
```

---

### **5. EXAM_CATEGORIES TABLE**

Types of exams (Olympiad, Board Exam, etc.) - **Configurable**

```sql
CREATE TABLE exam_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    category_code VARCHAR(50) UNIQUE NOT NULL,  -- MATH_OLYMPIAD, CBSE_BOARD
    description TEXT,
    icon_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',  -- {type: 'competitive', duration_default: 120}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_exam_categories_is_active ON exam_categories(is_active);
CREATE INDEX idx_exam_categories_category_code ON exam_categories(category_code);

-- Initial Data
INSERT INTO exam_categories (category_name, category_code, description, display_order) VALUES
('Math Olympiad', 'MATH_OLYMPIAD', 'International Mathematics Olympiad (IMO/SOF)', 1);
```

---

### **6. SUBJECTS TABLE**

Subjects (Math, Science, etc.) - **Configurable**

```sql
CREATE TABLE subjects (
    subject_id SERIAL PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(50) UNIQUE NOT NULL,  -- MATH, SCIENCE, ENGLISH
    description TEXT,
    icon_url VARCHAR(500),
    color_hex VARCHAR(7),  -- #FF5733 for UI theming
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',  -- {requires_calculator: true, formula_sheet: true}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_subjects_is_active ON subjects(is_active);
CREATE INDEX idx_subjects_subject_code ON subjects(subject_code);

-- Initial Data
INSERT INTO subjects (subject_name, subject_code, color_hex, display_order) VALUES
('Mathematics', 'MATH', '#FF6B6B', 1);
```

---

### **7. TOPICS TABLE**

Hierarchical topics/chapters within subjects - **Configurable**

```sql
CREATE TABLE topics (
    topic_id SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL,
    parent_topic_id INTEGER,  -- for hierarchical structure (Chapter > Sub-topic)
    topic_name VARCHAR(200) NOT NULL,
    topic_code VARCHAR(50),
    description TEXT,
    class_level INTEGER,  -- NULL means applicable to all classes
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_subject FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
    CONSTRAINT fk_parent_topic FOREIGN KEY (parent_topic_id) REFERENCES topics(topic_id),
    CONSTRAINT chk_class_level CHECK (class_level IS NULL OR (class_level BETWEEN 1 AND 10))
);

CREATE INDEX idx_topics_subject_id ON topics(subject_id);
CREATE INDEX idx_topics_parent_topic_id ON topics(parent_topic_id);
CREATE INDEX idx_topics_class_level ON topics(class_level);
CREATE INDEX idx_topics_is_active ON topics(is_active);

-- Example hierarchical structure
-- INSERT INTO topics (subject_id, parent_topic_id, topic_name, topic_code, class_level, display_order) VALUES
-- (1, NULL, 'Algebra', 'ALGEBRA', NULL, 1),  -- parent
-- (1, 1, 'Linear Equations', 'LINEAR_EQ', 8, 1);  -- child
```

---

### **8. DIFFICULTY_LEVELS TABLE**

Question difficulty levels - **Configurable**

```sql
CREATE TABLE difficulty_levels (
    difficulty_id SERIAL PRIMARY KEY,
    difficulty_name VARCHAR(50) UNIQUE NOT NULL,
    difficulty_code VARCHAR(20) UNIQUE NOT NULL,  -- EASY, MEDIUM, HARD
    description TEXT,
    points_multiplier DECIMAL(3,2) DEFAULT 1.0,  -- 1.0 for easy, 1.5 for medium, 2.0 for hard
    display_order INTEGER DEFAULT 0,
    color_hex VARCHAR(7),  -- for UI (green, yellow, red)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_difficulty_levels_is_active ON difficulty_levels(is_active);

-- Initial Data
INSERT INTO difficulty_levels (difficulty_name, difficulty_code, points_multiplier, display_order, color_hex) VALUES
('Easy', 'EASY', 1.0, 1, '#4CAF50'),
('Medium', 'MEDIUM', 1.5, 2, '#FFC107'),
('Hard', 'HARD', 2.0, 3, '#F44336');
```

---

### **9. QUESTION_TYPES TABLE**

Types of questions (MCQ, MSQ, etc.) - **Configurable**

```sql
CREATE TABLE question_types (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) UNIQUE NOT NULL,
    type_code VARCHAR(20) UNIQUE NOT NULL,  -- MCQ, MSQ, TRUE_FALSE, SUBJECTIVE, NUMERICAL
    description TEXT,
    validation_rules JSONB,  -- {min_options: 2, max_options: 6, requires_options: true}
    scoring_rules JSONB,  -- {partial_credit: false, negative_marking: -0.25}
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_question_types_is_active ON question_types(is_active);

-- Initial Data
INSERT INTO question_types (type_name, type_code, validation_rules, scoring_rules, display_order) VALUES
('Multiple Choice Question', 'MCQ', '{"min_options": 2, "max_options": 6, "requires_options": true}', '{"partial_credit": false, "negative_marking": 0}', 1),
('Multiple Select Question', 'MSQ', '{"min_options": 2, "max_options": 6, "requires_options": true}', '{"partial_credit": true, "negative_marking": 0}', 2),
('True/False', 'TRUE_FALSE', '{"min_options": 2, "max_options": 2, "requires_options": true}', '{"partial_credit": false, "negative_marking": 0}', 3),
('Subjective', 'SUBJECTIVE', '{"requires_options": false}', '{"partial_credit": false, "negative_marking": 0}', 4),
('Numerical Answer', 'NUMERICAL', '{"requires_options": false, "answer_type": "number"}', '{"partial_credit": false, "negative_marking": 0, "tolerance": 0.01}', 5);
```

---

## 📝 CONTENT TABLES

---

### **10. QUESTIONS TABLE**

Core questions table with metadata.

```sql
CREATE TABLE questions (
    question_id BIGSERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    question_html TEXT,  -- rich text version with formatting
    question_image_url VARCHAR(500),
    
    -- Classification
    type_id INTEGER NOT NULL,
    difficulty_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    topic_id INTEGER,
    class_level INTEGER NOT NULL,
    exam_category_id INTEGER NOT NULL,
    
    -- Answer
    correct_answer TEXT,  -- for MCQ: option_id, for NUMERICAL: value, for SUBJECTIVE: reference answer
    correct_answer_data JSONB,  -- for MSQ: [option_id1, option_id2], complex answers
    
    -- Metadata
    time_limit_seconds INTEGER DEFAULT 180,  -- expected time (3 mins default)
    marks DECIMAL(5,2) DEFAULT 1.0,
    negative_marks DECIMAL(5,2) DEFAULT 0.0,
    
    -- Quality Metrics (computed)
    times_attempted INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2),  -- computed: (times_correct / times_attempted) * 100
    avg_time_taken_seconds INTEGER,
    
    -- Content metadata
    tags JSONB DEFAULT '[]',  -- ['algebra', 'word-problem']
    metadata JSONB DEFAULT '{}',  -- extensible: {requires_calculator: true, source: 'IMO 2020'}
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft',  -- draft, active, flagged, retired
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit
    created_by BIGINT,  -- FK to users (admin)
    updated_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_type FOREIGN KEY (type_id) REFERENCES question_types(type_id),
    CONSTRAINT fk_difficulty FOREIGN KEY (difficulty_id) REFERENCES difficulty_levels(difficulty_id),
    CONSTRAINT fk_subject FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
    CONSTRAINT fk_topic FOREIGN KEY (topic_id) REFERENCES topics(topic_id),
    CONSTRAINT fk_exam_category FOREIGN KEY (exam_category_id) REFERENCES exam_categories(category_id),
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(user_id),
    CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES users(user_id),
    CONSTRAINT chk_class_level CHECK (class_level BETWEEN 1 AND 10),
    CONSTRAINT chk_status CHECK (status IN ('draft', 'active', 'flagged', 'retired'))
);

CREATE INDEX idx_questions_type_id ON questions(type_id);
CREATE INDEX idx_questions_difficulty_id ON questions(difficulty_id);
CREATE INDEX idx_questions_subject_id ON questions(subject_id);
CREATE INDEX idx_questions_topic_id ON questions(topic_id);
CREATE INDEX idx_questions_class_level ON questions(class_level);
CREATE INDEX idx_questions_exam_category_id ON questions(exam_category_id);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_is_active ON questions(is_active);
CREATE INDEX idx_questions_success_rate ON questions(success_rate);
CREATE INDEX idx_questions_created_at ON questions(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_questions_class_subject_difficulty ON questions(class_level, subject_id, difficulty_id) WHERE is_active = TRUE;
CREATE INDEX idx_questions_category_class ON questions(exam_category_id, class_level) WHERE is_active = TRUE;
```

---

### **11. QUESTION_OPTIONS TABLE**

Options for MCQ/MSQ/True-False questions.

```sql
CREATE TABLE question_options (
    option_id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    option_html TEXT,
    option_image_url VARCHAR(500),
    option_order INTEGER NOT NULL,  -- A=1, B=2, C=3, D=4
    is_correct BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_question FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
    CONSTRAINT uq_question_option_order UNIQUE(question_id, option_order)
);

CREATE INDEX idx_question_options_question_id ON question_options(question_id);
CREATE INDEX idx_question_options_is_correct ON question_options(is_correct);
```

---

### **12. QUESTION_EXPLANATIONS TABLE**

Explanations for questions (text + images, videos later).

```sql
CREATE TABLE question_explanations (
    explanation_id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL,
    explanation_type VARCHAR(20) DEFAULT 'wrong_answer',  -- wrong_answer, correct_answer, hint
    explanation_text TEXT NOT NULL,
    explanation_html TEXT,
    explanation_images JSONB DEFAULT '[]',  -- [{url: '...', caption: '...'}, ...]
    explanation_video_url VARCHAR(500),  -- for Phase 2
    step_by_step JSONB,  -- [{step: 1, text: '...'}, {step: 2, text: '...'}]
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_question FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
    CONSTRAINT chk_explanation_type CHECK (explanation_type IN ('wrong_answer', 'correct_answer', 'hint'))
);

CREATE INDEX idx_question_explanations_question_id ON question_explanations(question_id);
CREATE INDEX idx_question_explanations_type ON question_explanations(explanation_type);
```

---

### **13. TAGS TABLE**

Tags for questions (for advanced filtering).

```sql
CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(50) UNIQUE NOT NULL,
    tag_category VARCHAR(50),  -- concept, skill, exam_type
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_tag_name ON tags(tag_name);
CREATE INDEX idx_tags_category ON tags(tag_category);

-- Example tags: 'algebra', 'geometry', 'word-problem', 'logical-reasoning', 'speed-accuracy'
```

---

### **14. QUESTION_TAGS TABLE**

Many-to-many relationship between questions and tags.

```sql
CREATE TABLE question_tags (
    question_id BIGINT NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (question_id, tag_id),
    CONSTRAINT fk_question FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
    CONSTRAINT fk_tag FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

CREATE INDEX idx_question_tags_question_id ON question_tags(question_id);
CREATE INDEX idx_question_tags_tag_id ON question_tags(tag_id);
```

---

## 🎯 ASSESSMENT TABLES

---

### **15. TESTS TABLE**

Both practice sessions and mock tests.

```sql
CREATE TABLE tests (
    test_id BIGSERIAL PRIMARY KEY,
    test_name VARCHAR(255),
    test_type VARCHAR(20) NOT NULL,  -- practice, mock, diagnostic
    
    -- Configuration
    test_config JSONB NOT NULL,  -- {
                                  --   "duration_minutes": 120,
                                  --   "total_questions": 40,
                                  --   "difficulty_distribution": {"easy": 10, "medium": 20, "hard": 10},
                                  --   "topic_ids": [1, 2, 3],
                                  --   "randomize_questions": true,
                                  --   "randomize_options": true,
                                  --   "show_results_immediately": false,
                                  --   "allow_review": true,
                                  --   "negative_marking": false
                                  -- }
    
    -- Classification
    subject_id INTEGER,
    exam_category_id INTEGER,
    class_level INTEGER,
    
    -- Access control
    access_level VARCHAR(20) DEFAULT 'free',  -- free, premium, points_required
    points_cost INTEGER DEFAULT 0,
    
    -- Meta
    is_template BOOLEAN DEFAULT FALSE,  -- true for admin-created templates
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_subject FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
    CONSTRAINT fk_exam_category FOREIGN KEY (exam_category_id) REFERENCES exam_categories(category_id),
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(user_id),
    CONSTRAINT chk_test_type CHECK (test_type IN ('practice', 'mock', 'diagnostic')),
    CONSTRAINT chk_access_level CHECK (access_level IN ('free', 'premium', 'points_required')),
    CONSTRAINT chk_class_level CHECK (class_level IS NULL OR (class_level BETWEEN 1 AND 10))
);

CREATE INDEX idx_tests_test_type ON tests(test_type);
CREATE INDEX idx_tests_subject_id ON tests(subject_id);
CREATE INDEX idx_tests_exam_category_id ON tests(exam_category_id);
CREATE INDEX idx_tests_class_level ON tests(class_level);
CREATE INDEX idx_tests_is_template ON tests(is_template);
CREATE INDEX idx_tests_is_active ON tests(is_active);
```

---

### **16. TEST_QUESTIONS TABLE**

Maps questions to tests (for pre-configured tests).

```sql
CREATE TABLE test_questions (
    test_question_id BIGSERIAL PRIMARY KEY,
    test_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    question_order INTEGER NOT NULL,
    marks DECIMAL(5,2) DEFAULT 1.0,
    negative_marks DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_test FOREIGN KEY (test_id) REFERENCES tests(test_id) ON DELETE CASCADE,
    CONSTRAINT fk_question FOREIGN KEY (question_id) REFERENCES questions(question_id),
    CONSTRAINT uq_test_question_order UNIQUE(test_id, question_order),
    CONSTRAINT uq_test_question UNIQUE(test_id, question_id)
);

CREATE INDEX idx_test_questions_test_id ON test_questions(test_id);
CREATE INDEX idx_test_questions_question_id ON test_questions(question_id);
```

---

### **17. TEST_ATTEMPTS TABLE**

Student's attempts at tests.

```sql
CREATE TABLE test_attempts (
    attempt_id BIGSERIAL PRIMARY KEY,
    test_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'in_progress',  -- in_progress, completed, abandoned, auto_submitted
    
    -- Timing
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    time_taken_seconds INTEGER,
    
    -- Results
    total_questions INTEGER NOT NULL,
    attempted_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    wrong_answers INTEGER DEFAULT 0,
    unattempted INTEGER DEFAULT 0,
    
    score DECIMAL(6,2) DEFAULT 0.0,
    max_score DECIMAL(6,2) NOT NULL,
    percentage DECIMAL(5,2) DEFAULT 0.0,
    
    -- Data
    questions_data JSONB,  -- snapshot of questions at attempt time (immutable)
    responses_summary JSONB,  -- {question_id: {selected: X, correct: Y, time_taken: Z}}
    
    -- Metadata
    metadata JSONB DEFAULT '{}',  -- {ip_address, device, browser}
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_test FOREIGN KEY (test_id) REFERENCES tests(test_id),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_status CHECK (status IN ('in_progress', 'completed', 'abandoned', 'auto_submitted'))
);

CREATE INDEX idx_test_attempts_test_id ON test_attempts(test_id);
CREATE INDEX idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX idx_test_attempts_status ON test_attempts(status);
CREATE INDEX idx_test_attempts_started_at ON test_attempts(started_at);
CREATE INDEX idx_test_attempts_percentage ON test_attempts(percentage);

-- Composite for leaderboards
CREATE INDEX idx_test_attempts_user_score ON test_attempts(user_id, score DESC) WHERE status = 'completed';
```

---

### **18. TEST_RESPONSES TABLE**

Individual question responses within a test attempt.

```sql
CREATE TABLE test_responses (
    response_id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    
    -- Response data
    selected_option_id BIGINT,  -- for MCQ/True-False
    selected_option_ids JSONB,  -- for MSQ: [option_id1, option_id2]
    text_answer TEXT,  -- for SUBJECTIVE/NUMERICAL
    
    -- Evaluation
    is_correct BOOLEAN,
    marks_awarded DECIMAL(5,2) DEFAULT 0.0,
    marks_possible DECIMAL(5,2) NOT NULL,
    
    -- Timing
    time_taken_seconds INTEGER,
    marked_for_review BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    response_order INTEGER,  -- order in which question was answered
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_attempt FOREIGN KEY (attempt_id) REFERENCES test_attempts(attempt_id) ON DELETE CASCADE,
    CONSTRAINT fk_question FOREIGN KEY (question_id) REFERENCES questions(question_id),
    CONSTRAINT fk_selected_option FOREIGN KEY (selected_option_id) REFERENCES question_options(option_id),
    CONSTRAINT uq_attempt_question UNIQUE(attempt_id, question_id)
);

CREATE INDEX idx_test_responses_attempt_id ON test_responses(attempt_id);
CREATE INDEX idx_test_responses_question_id ON test_responses(question_id);
CREATE INDEX idx_test_responses_is_correct ON test_responses(is_correct);

-- Partition by month for performance (if table grows large)
-- CREATE TABLE test_responses_2026_07 PARTITION OF test_responses
--     FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
```

---

## 💳 SUBSCRIPTION & PAYMENT TABLES

---

### **19. SUBSCRIPTION_PLANS TABLE**

Pricing matrix for class × subject combinations - **Configurable**

```sql
CREATE TABLE subscription_plans (
    plan_id SERIAL PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL,
    plan_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    
    -- Pricing
    price_per_month DECIMAL(10,2) NOT NULL,
    price_per_quarter DECIMAL(10,2),
    price_per_year DECIMAL(10,2),
    
    -- Access control
    class_level INTEGER,  -- NULL = all classes
    subject_id INTEGER,   -- NULL = all subjects
    
    -- Features
    features JSONB DEFAULT '{}',  -- {unlimited_questions: true, mock_tests: true, pdf_download: true}
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_subject FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
    CONSTRAINT chk_class_level CHECK (class_level IS NULL OR (class_level BETWEEN 1 AND 10))
);

CREATE INDEX idx_subscription_plans_class_level ON subscription_plans(class_level);
CREATE INDEX idx_subscription_plans_subject_id ON subscription_plans(subject_id);
CREATE INDEX idx_subscription_plans_is_active ON subscription_plans(is_active);

-- Example: Class 8 Math = ₹200/month
-- INSERT INTO subscription_plans (plan_name, plan_code, price_per_month, class_level, subject_id) VALUES
-- ('Class 8 Mathematics Monthly', 'CLASS_8_MATH_MONTHLY', 200.00, 8, 1);
```

---

### **20. USER_SUBSCRIPTIONS TABLE**

User's active subscriptions.

```sql
CREATE TABLE user_subscriptions (
    subscription_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_id INTEGER NOT NULL,
    
    -- Period
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',  -- active, expired, cancelled, pending
    auto_renewal BOOLEAN DEFAULT FALSE,
    
    -- Payment
    payment_id BIGINT,  -- FK to payments
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(plan_id),
    CONSTRAINT chk_status CHECK (status IN ('active', 'expired', 'cancelled', 'pending'))
);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_end_date ON user_subscriptions(end_date);

-- Composite for checking active subscriptions
CREATE INDEX idx_user_subscriptions_user_active ON user_subscriptions(user_id, status, end_date) WHERE status = 'active';
```

---

### **21. USER_SUBJECT_ACCESS TABLE**

Tracks which subjects each user has access to (based on subscription or free tier).

```sql
CREATE TABLE user_subject_access (
    access_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    subject_id INTEGER NOT NULL,
    
    -- Access type
    access_type VARCHAR(20) NOT NULL,  -- free, premium, trial
    
    -- Free tier tracking
    free_questions_used INTEGER DEFAULT 0,
    free_questions_limit INTEGER DEFAULT 10,
    
    -- Dates
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,  -- NULL for permanent access
    
    -- Metadata
    subscription_id BIGINT,  -- if access from subscription
    metadata JSONB DEFAULT '{}',
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_subject FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
    CONSTRAINT fk_subscription FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(subscription_id),
    CONSTRAINT chk_access_type CHECK (access_type IN ('free', 'premium', 'trial')),
    CONSTRAINT uq_user_subject UNIQUE(user_id, subject_id)
);

CREATE INDEX idx_user_subject_access_user_id ON user_subject_access(user_id);
CREATE INDEX idx_user_subject_access_subject_id ON user_subject_access(subject_id);
CREATE INDEX idx_user_subject_access_access_type ON user_subject_access(access_type);
```

---

### **22. PAYMENTS TABLE**

Payment transactions.

```sql
CREATE TABLE payments (
    payment_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50),  -- razorpay, stripe, upi, card
    
    -- Gateway details
    gateway_transaction_id VARCHAR(255) UNIQUE,
    gateway_name VARCHAR(50),  -- razorpay, stripe
    gateway_response JSONB,  -- raw response from gateway
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',  -- pending, success, failed, refunded
    
    -- Associated entities
    plan_id INTEGER,
    subscription_id BIGINT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',  -- {ip_address, device, etc.}
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_plan FOREIGN KEY (plan_id) REFERENCES subscription_plans(plan_id),
    CONSTRAINT fk_subscription FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(subscription_id),
    CONSTRAINT chk_status CHECK (status IN ('pending', 'success', 'failed', 'refunded'))
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_gateway_transaction_id ON payments(gateway_transaction_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);
```

---

## 🎮 GAMIFICATION TABLES

---

### **23. BADGES TABLE**

Available badges - **Configurable**

```sql
CREATE TABLE badges (
    badge_id SERIAL PRIMARY KEY,
    badge_name VARCHAR(100) UNIQUE NOT NULL,
    badge_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    
    -- Criteria
    criteria JSONB NOT NULL,  -- {type: 'questions_attempted', threshold: 100, class_range: [1,3]}
                              -- {type: 'streak', days: 7}
                              -- {type: 'accuracy', percentage: 90, min_questions: 10}
    
    -- Classification
    category VARCHAR(50),  -- milestone, streak, accuracy, speed
    class_range JSONB,  -- [1, 3] means for Class 1-3
    
    -- Display
    rarity VARCHAR(20) DEFAULT 'common',  -- common, rare, epic, legendary
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_rarity CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'))
);

CREATE INDEX idx_badges_is_active ON badges(is_active);
CREATE INDEX idx_badges_category ON badges(category);

-- Example badges
-- INSERT INTO badges (badge_name, badge_code, description, criteria, category, class_range) VALUES
-- ('First Question', 'FIRST_QUESTION', 'Complete your first question', '{"type": "questions_attempted", "threshold": 1}', 'milestone', '[1, 10]'),
-- ('7-Day Streak', 'STREAK_7', 'Practice for 7 consecutive days', '{"type": "streak", "days": 7}', 'streak', '[1, 10]');
```

---

### **24. USER_BADGES TABLE**

Badges earned by users.

```sql
CREATE TABLE user_badges (
    user_badge_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    badge_id INTEGER NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}',  -- {questions_count: 100, accuracy: 95}
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_badge FOREIGN KEY (badge_id) REFERENCES badges(badge_id),
    CONSTRAINT uq_user_badge UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at);
```

---

### **25. POINTS_TRANSACTIONS TABLE**

Points earned and redeemed by users.

```sql
CREATE TABLE points_transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    
    -- Transaction
    points INTEGER NOT NULL,  -- positive for earn, negative for redeem
    transaction_type VARCHAR(50) NOT NULL,  -- correct_answer, streak_bonus, mock_test_completion, redeem_test
    
    -- Context
    reference_type VARCHAR(50),  -- test_attempt, badge, daily_challenge
    reference_id BIGINT,  -- FK to test_attempts, user_badges, etc.
    
    -- Balance after transaction
    balance_after INTEGER NOT NULL,
    
    -- Description
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX idx_points_transactions_created_at ON points_transactions(created_at);
CREATE INDEX idx_points_transactions_reference ON points_transactions(reference_type, reference_id);

-- User's current points balance = SUM(points) for that user
```

---

### **26. LEADERBOARD_SNAPSHOTS TABLE**

Cached leaderboard data for performance.

```sql
CREATE TABLE leaderboard_snapshots (
    snapshot_id BIGSERIAL PRIMARY KEY,
    
    -- Leaderboard type
    leaderboard_type VARCHAR(50) NOT NULL,  -- global, class, school
    
    -- Filters
    class_level INTEGER,
    school_name VARCHAR(255),
    
    -- Period
    period VARCHAR(20) DEFAULT 'all_time',  -- all_time, monthly, weekly
    snapshot_date DATE NOT NULL,
    
    -- Data
    rankings JSONB NOT NULL,  -- [{rank: 1, user_id: 123, points: 5000, name: 'John'}, ...]
    
    -- Metadata
    total_users INTEGER,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_leaderboard_type CHECK (leaderboard_type IN ('global', 'class', 'school')),
    CONSTRAINT chk_period CHECK (period IN ('all_time', 'monthly', 'weekly'))
);

CREATE INDEX idx_leaderboard_snapshots_type ON leaderboard_snapshots(leaderboard_type);
CREATE INDEX idx_leaderboard_snapshots_class_level ON leaderboard_snapshots(class_level);
CREATE INDEX idx_leaderboard_snapshots_school_name ON leaderboard_snapshots(school_name);
CREATE INDEX idx_leaderboard_snapshots_snapshot_date ON leaderboard_snapshots(snapshot_date);

-- Leaderboards computed via materialized view or cron job, stored here for fast retrieval
```

---

## 🛠️ SUPPORT & ADMIN TABLES

---

### **27. QUESTION_REPORTS TABLE**

User-reported issues with questions.

```sql
CREATE TABLE question_reports (
    report_id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL,
    reported_by BIGINT NOT NULL,
    
    -- Report details
    report_type VARCHAR(50) NOT NULL,  -- incorrect_answer, unclear_question, typo, other
    description TEXT NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',  -- pending, reviewed, resolved, dismissed
    
    -- Resolution
    resolved_by BIGINT,  -- admin user_id
    resolution_notes TEXT,
    resolved_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',  -- {test_attempt_id, user_answer, etc.}
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_question FOREIGN KEY (question_id) REFERENCES questions(question_id),
    CONSTRAINT fk_reported_by FOREIGN KEY (reported_by) REFERENCES users(user_id),
    CONSTRAINT fk_resolved_by FOREIGN KEY (resolved_by) REFERENCES users(user_id),
    CONSTRAINT chk_report_type CHECK (report_type IN ('incorrect_answer', 'unclear_question', 'typo', 'technical_issue', 'other')),
    CONSTRAINT chk_status CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed'))
);

CREATE INDEX idx_question_reports_question_id ON question_reports(question_id);
CREATE INDEX idx_question_reports_reported_by ON question_reports(reported_by);
CREATE INDEX idx_question_reports_status ON question_reports(status);
CREATE INDEX idx_question_reports_created_at ON question_reports(created_at);
```

---

### **28. CONFIGURATION_AUDIT_LOG TABLE**

Track all configuration changes (who changed what).

```sql
CREATE TABLE configuration_audit_log (
    log_id BIGSERIAL PRIMARY KEY,
    
    -- What changed
    table_name VARCHAR(100) NOT NULL,  -- boards, subjects, exam_categories, etc.
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL,  -- created, updated, deleted
    
    -- Changes
    old_values JSONB,  -- snapshot before change
    new_values JSONB,  -- snapshot after change
    changed_fields JSONB,  -- [field1, field2]
    
    -- Who
    changed_by BIGINT NOT NULL,
    
    -- When
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    
    CONSTRAINT fk_changed_by FOREIGN KEY (changed_by) REFERENCES users(user_id),
    CONSTRAINT chk_action CHECK (action IN ('created', 'updated', 'deleted'))
);

CREATE INDEX idx_config_audit_log_table_record ON configuration_audit_log(table_name, record_id);
CREATE INDEX idx_config_audit_log_changed_by ON configuration_audit_log(changed_by);
CREATE INDEX idx_config_audit_log_changed_at ON configuration_audit_log(changed_at);
```

---

## 🔍 VIEWS & MATERIALIZED VIEWS

---

### **29. VIEW: user_statistics**

Aggregated user statistics for dashboards.

```sql
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    u.user_id,
    u.email,
    up.full_name,
    up.class_level,
    up.school_name,
    
    -- Question stats
    COUNT(DISTINCT tr.question_id) AS total_questions_attempted,
    SUM(CASE WHEN tr.is_correct THEN 1 ELSE 0 END) AS correct_answers,
    ROUND(
        (SUM(CASE WHEN tr.is_correct THEN 1 ELSE 0 END)::DECIMAL / 
         NULLIF(COUNT(tr.question_id), 0)) * 100, 
        2
    ) AS overall_accuracy,
    
    -- Test stats
    COUNT(DISTINCT ta.attempt_id) AS total_tests_attempted,
    COUNT(DISTINCT CASE WHEN ta.status = 'completed' THEN ta.attempt_id END) AS tests_completed,
    
    -- Points
    COALESCE(SUM(pt.points), 0) AS total_points,
    
    -- Badges
    COUNT(DISTINCT ub.badge_id) AS badges_earned,
    
    -- Activity
    MAX(ta.started_at) AS last_activity_at
    
FROM users u
LEFT JOIN user_profiles up ON u.user_id = up.user_id
LEFT JOIN test_attempts ta ON u.user_id = ta.user_id
LEFT JOIN test_responses tr ON ta.attempt_id = tr.attempt_id
LEFT JOIN points_transactions pt ON u.user_id = pt.user_id
LEFT JOIN user_badges ub ON u.user_id = ub.user_id

WHERE u.role = 'student' AND u.deleted_at IS NULL

GROUP BY u.user_id, u.email, up.full_name, up.class_level, up.school_name;
```

---

### **30. MATERIALIZED VIEW: leaderboard_class_wise**

Pre-computed class-wise leaderboards (refresh daily or on-demand).

```sql
CREATE MATERIALIZED VIEW leaderboard_class_wise AS
SELECT 
    up.class_level,
    u.user_id,
    up.full_name AS student_name,
    up.school_name,
    COALESCE(SUM(pt.points), 0) AS total_points,
    COUNT(DISTINCT ub.badge_id) AS badges_earned,
    ROW_NUMBER() OVER (PARTITION BY up.class_level ORDER BY COALESCE(SUM(pt.points), 0) DESC) AS rank
    
FROM users u
INNER JOIN user_profiles up ON u.user_id = up.user_id
LEFT JOIN points_transactions pt ON u.user_id = pt.user_id
LEFT JOIN user_badges ub ON u.user_id = ub.user_id

WHERE u.role = 'student' AND u.deleted_at IS NULL AND u.status = 'active'

GROUP BY up.class_level, u.user_id, up.full_name, up.school_name;

CREATE INDEX idx_leaderboard_class_wise_class ON leaderboard_class_wise(class_level);
CREATE INDEX idx_leaderboard_class_wise_rank ON leaderboard_class_wise(class_level, rank);

-- Refresh daily via cron job
-- REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_class_wise;
```

---

## 🔐 DATABASE FUNCTIONS & TRIGGERS

---

### **31. TRIGGER: Update updated_at timestamp**

Auto-update updated_at on row modification.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_attempts_updated_at BEFORE UPDATE ON test_attempts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... apply to all other tables with updated_at
```

---

### **32. TRIGGER: Update question statistics**

Update question success rate and attempt count after each response.

```sql
CREATE OR REPLACE FUNCTION update_question_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update when response is evaluated (is_correct is set)
    IF NEW.is_correct IS NOT NULL THEN
        UPDATE questions
        SET 
            times_attempted = times_attempted + 1,
            times_correct = times_correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
            success_rate = ROUND(
                ((times_correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END)::DECIMAL / 
                 (times_attempted + 1)) * 100, 
                2
            ),
            avg_time_taken_seconds = (
                COALESCE(avg_time_taken_seconds, 0) * times_attempted + COALESCE(NEW.time_taken_seconds, 0)
            ) / (times_attempted + 1)
        WHERE question_id = NEW.question_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_question_stats_after_response 
AFTER INSERT OR UPDATE ON test_responses
FOR EACH ROW EXECUTE FUNCTION update_question_statistics();
```

---

### **33. FUNCTION: Calculate test result**

Calculate score, percentage, and update test_attempt after all responses submitted.

```sql
CREATE OR REPLACE FUNCTION calculate_test_result(p_attempt_id BIGINT)
RETURNS VOID AS $$
DECLARE
    v_total_questions INTEGER;
    v_attempted INTEGER;
    v_correct INTEGER;
    v_wrong INTEGER;
    v_score DECIMAL(6,2);
    v_max_score DECIMAL(6,2);
    v_percentage DECIMAL(5,2);
BEGIN
    -- Count questions
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN is_correct IS NOT NULL THEN 1 END),
        COUNT(CASE WHEN is_correct = TRUE THEN 1 END),
        COUNT(CASE WHEN is_correct = FALSE THEN 1 END),
        SUM(marks_awarded),
        SUM(marks_possible)
    INTO 
        v_total_questions,
        v_attempted,
        v_correct,
        v_wrong,
        v_score,
        v_max_score
    FROM test_responses
    WHERE attempt_id = p_attempt_id;
    
    -- Calculate percentage
    v_percentage := ROUND((v_score / NULLIF(v_max_score, 0)) * 100, 2);
    
    -- Update test attempt
    UPDATE test_attempts
    SET 
        total_questions = v_total_questions,
        attempted_questions = v_attempted,
        correct_answers = v_correct,
        wrong_answers = v_wrong,
        unattempted = v_total_questions - v_attempted,
        score = v_score,
        max_score = v_max_score,
        percentage = v_percentage,
        status = 'completed',
        submitted_at = CURRENT_TIMESTAMP,
        time_taken_seconds = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at))
    WHERE attempt_id = p_attempt_id;
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT calculate_test_result(123);
```

---

### **34. FUNCTION: Check user access to question**

Check if user can access a question based on subscription/free tier.

```sql
CREATE OR REPLACE FUNCTION can_user_access_question(
    p_user_id BIGINT,
    p_question_id BIGINT
) RETURNS BOOLEAN AS $$
DECLARE
    v_subject_id INTEGER;
    v_access_type VARCHAR(20);
    v_free_used INTEGER;
    v_free_limit INTEGER;
BEGIN
    -- Get question's subject
    SELECT subject_id INTO v_subject_id
    FROM questions
    WHERE question_id = p_question_id;
    
    -- Check user's access to this subject
    SELECT access_type, free_questions_used, free_questions_limit
    INTO v_access_type, v_free_used, v_free_limit
    FROM user_subject_access
    WHERE user_id = p_user_id AND subject_id = v_subject_id;
    
    -- No access record = no access
    IF v_access_type IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Premium access = allowed
    IF v_access_type = 'premium' THEN
        RETURN TRUE;
    END IF;
    
    -- Free access = check limit
    IF v_access_type = 'free' THEN
        RETURN v_free_used < v_free_limit;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT can_user_access_question(123, 456);
```

---

### **35. FUNCTION: Award points to user**

Award points and update balance.

```sql
CREATE OR REPLACE FUNCTION award_points(
    p_user_id BIGINT,
    p_points INTEGER,
    p_transaction_type VARCHAR(50),
    p_description TEXT DEFAULT NULL,
    p_reference_type VARCHAR(50) DEFAULT NULL,
    p_reference_id BIGINT DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_transaction_id BIGINT;
BEGIN
    -- Get current balance
    SELECT COALESCE(SUM(points), 0) INTO v_current_balance
    FROM points_transactions
    WHERE user_id = p_user_id;
    
    -- Calculate new balance
    v_new_balance := v_current_balance + p_points;
    
    -- Insert transaction
    INSERT INTO points_transactions (
        user_id, points, transaction_type, description, 
        reference_type, reference_id, balance_after
    ) VALUES (
        p_user_id, p_points, p_transaction_type, p_description,
        p_reference_type, p_reference_id, v_new_balance
    ) RETURNING transaction_id INTO v_transaction_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT award_points(123, 10, 'correct_answer', 'Answered question correctly', 'test_response', 456);
```

---

## 📈 INDEXES & PERFORMANCE OPTIMIZATION

### Composite Indexes (Already defined above, summary here)

```sql
-- Questions - common query patterns
CREATE INDEX idx_questions_class_subject_difficulty 
    ON questions(class_level, subject_id, difficulty_id) 
    WHERE is_active = TRUE;

CREATE INDEX idx_questions_category_class 
    ON questions(exam_category_id, class_level) 
    WHERE is_active = TRUE;

-- Test Attempts - leaderboards
CREATE INDEX idx_test_attempts_user_score 
    ON test_attempts(user_id, score DESC) 
    WHERE status = 'completed';

-- User Subscriptions - active check
CREATE INDEX idx_user_subscriptions_user_active 
    ON user_subscriptions(user_id, status, end_date) 
    WHERE status = 'active';
```

### Partitioning Strategy (for large tables)

```sql
-- Partition test_responses by month (example for 2026)
CREATE TABLE test_responses_2026_07 PARTITION OF test_responses
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

CREATE TABLE test_responses_2026_08 PARTITION OF test_responses
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

-- Automate partition creation with cron or pg_partman extension
```

### Vacuum & Analyze

```sql
-- Schedule regular VACUUM ANALYZE for performance
-- Via cron or pg_cron extension:
-- SELECT cron.schedule('vacuum-analyze', '0 2 * * *', 'VACUUM ANALYZE');
```

---

## 🚀 INITIAL DATA SEEDING

### Seed Configuration Tables

```sql
-- Boards
INSERT INTO boards (board_name, board_code, description, display_order) VALUES
('CBSE', 'CBSE', 'Central Board of Secondary Education', 1),
('ICSE', 'ICSE', 'Indian Certificate of Secondary Education', 2);

-- Exam Categories
INSERT INTO exam_categories (category_name, category_code, description, display_order) VALUES
('Math Olympiad', 'MATH_OLYMPIAD', 'International Mathematics Olympiad (IMO/SOF)', 1);

-- Subjects
INSERT INTO subjects (subject_name, subject_code, color_hex, display_order) VALUES
('Mathematics', 'MATH', '#FF6B6B', 1);

-- Difficulty Levels
INSERT INTO difficulty_levels (difficulty_name, difficulty_code, points_multiplier, display_order, color_hex) VALUES
('Easy', 'EASY', 1.0, 1, '#4CAF50'),
('Medium', 'MEDIUM', 1.5, 2, '#FFC107'),
('Hard', 'HARD', 2.0, 3, '#F44336');

-- Question Types
INSERT INTO question_types (type_name, type_code, validation_rules, scoring_rules, display_order) VALUES
('Multiple Choice Question', 'MCQ', '{"min_options": 2, "max_options": 6, "requires_options": true}', '{"partial_credit": false, "negative_marking": 0}', 1),
('Multiple Select Question', 'MSQ', '{"min_options": 2, "max_options": 6, "requires_options": true}', '{"partial_credit": true, "negative_marking": 0}', 2),
('True/False', 'TRUE_FALSE', '{"min_options": 2, "max_options": 2, "requires_options": true}', '{"partial_credit": false, "negative_marking": 0}', 3),
('Subjective', 'SUBJECTIVE', '{"requires_options": false}', '{"partial_credit": false, "negative_marking": 0}', 4),
('Numerical Answer', 'NUMERICAL', '{"requires_options": false, "answer_type": "number"}', '{"partial_credit": false, "negative_marking": 0, "tolerance": 0.01}', 5);

-- Topics for Class 8 Math (example)
INSERT INTO topics (subject_id, parent_topic_id, topic_name, topic_code, class_level, display_order) VALUES
(1, NULL, 'Algebra', 'ALGEBRA', 8, 1),
(1, 1, 'Linear Equations', 'LINEAR_EQ', 8, 1),
(1, 1, 'Factorization', 'FACTORIZATION', 8, 2),
(1, NULL, 'Geometry', 'GEOMETRY', 8, 2),
(1, 4, 'Triangles', 'TRIANGLES', 8, 1),
(1, NULL, 'Number Systems', 'NUMBER_SYSTEMS', 8, 3);

-- Badges
INSERT INTO badges (badge_name, badge_code, description, criteria, category, class_range, rarity, display_order) VALUES
('First Question', 'FIRST_QUESTION', 'Complete your first question', '{"type": "questions_attempted", "threshold": 1}', 'milestone', '[1, 10]', 'common', 1),
('10 Questions', 'QUESTIONS_10', 'Complete 10 questions', '{"type": "questions_attempted", "threshold": 10}', 'milestone', '[1, 10]', 'common', 2),
('50 Questions', 'QUESTIONS_50', 'Complete 50 questions', '{"type": "questions_attempted", "threshold": 50}', 'milestone', '[1, 10]', 'rare', 3),
('100 Questions', 'QUESTIONS_100', 'Complete 100 questions', '{"type": "questions_attempted", "threshold": 100}', 'milestone', '[1, 10]', 'epic', 4),
('3-Day Streak', 'STREAK_3', 'Practice for 3 consecutive days', '{"type": "streak", "days": 3}', 'streak', '[1, 10]', 'common', 5),
('7-Day Streak', 'STREAK_7', 'Practice for 7 consecutive days', '{"type": "streak", "days": 7}', 'streak', '[1, 10]', 'rare', 6),
('30-Day Streak', 'STREAK_30', 'Practice for 30 consecutive days', '{"type": "streak", "days": 30}', 'streak', '[1, 10]', 'legendary', 7),
('High Accuracy', 'ACCURACY_90', '90%+ accuracy in 10 questions', '{"type": "accuracy", "percentage": 90, "min_questions": 10}', 'accuracy', '[1, 10]', 'rare', 8),
('Perfect Score', 'PERFECT_100', '100% accuracy in a practice session', '{"type": "perfect_score"}', 'accuracy', '[1, 10]', 'epic', 9),
('Mock Test Hero', 'MOCK_FIRST', 'Complete your first mock test', '{"type": "mock_completed", "threshold": 1}', 'milestone', '[1, 10]', 'rare', 10);

-- Subscription Plans (example: Class 8 Math)
INSERT INTO subscription_plans (plan_name, plan_code, price_per_month, class_level, subject_id, display_order) VALUES
('Class 8 Mathematics Monthly', 'CLASS_8_MATH_MONTHLY', 200.00, 8, 1, 1);
```

---

## ✅ SCHEMA VALIDATION & CONSTRAINTS

### Check Constraints Summary

```sql
-- Users
CHECK (role IN ('student', 'admin', 'teacher', 'parent'))
CHECK (status IN ('active', 'inactive', 'suspended'))

-- User Profiles
CHECK (class_level BETWEEN 1 AND 10)

-- Questions
CHECK (class_level BETWEEN 1 AND 10)
CHECK (status IN ('draft', 'active', 'flagged', 'retired'))

-- Topics
CHECK (class_level IS NULL OR (class_level BETWEEN 1 AND 10))

-- Tests
CHECK (test_type IN ('practice', 'mock', 'diagnostic'))
CHECK (access_level IN ('free', 'premium', 'points_required'))
CHECK (class_level IS NULL OR (class_level BETWEEN 1 AND 10))

-- Test Attempts
CHECK (status IN ('in_progress', 'completed', 'abandoned', 'auto_submitted'))

-- Question Explanations
CHECK (explanation_type IN ('wrong_answer', 'correct_answer', 'hint'))

-- User Subject Access
CHECK (access_type IN ('free', 'premium', 'trial'))

-- Subscription Plans
CHECK (class_level IS NULL OR (class_level BETWEEN 1 AND 10))

-- User Subscriptions
CHECK (status IN ('active', 'expired', 'cancelled', 'pending'))

-- Payments
CHECK (status IN ('pending', 'success', 'failed', 'refunded'))

-- Badges
CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'))

-- Question Reports
CHECK (report_type IN ('incorrect_answer', 'unclear_question', 'typo', 'technical_issue', 'other'))
CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed'))

-- Configuration Audit Log
CHECK (action IN ('created', 'updated', 'deleted'))
```

---

## 📊 ER DIAGRAM SUMMARY

### Entity Relationships

```
USERS (1) ----< (M) USER_PROFILES
USERS (1) ----< (M) USER_SESSIONS
USERS (1) ----< (M) TEST_ATTEMPTS
USERS (1) ----< (M) USER_SUBSCRIPTIONS
USERS (1) ----< (M) USER_BADGES
USERS (1) ----< (M) POINTS_TRANSACTIONS
USERS (1) ----< (M) QUESTION_REPORTS
USERS (1) ----< (M) USER_SUBJECT_ACCESS

BOARDS (1) ----< (M) USER_PROFILES

SUBJECTS (1) ----< (M) TOPICS
SUBJECTS (1) ----< (M) QUESTIONS
SUBJECTS (1) ----< (M) TESTS
SUBJECTS (1) ----< (M) SUBSCRIPTION_PLANS
SUBJECTS (1) ----< (M) USER_SUBJECT_ACCESS

EXAM_CATEGORIES (1) ----< (M) QUESTIONS
EXAM_CATEGORIES (1) ----< (M) TESTS

DIFFICULTY_LEVELS (1) ----< (M) QUESTIONS

QUESTION_TYPES (1) ----< (M) QUESTIONS

TOPICS (1) ----< (M) QUESTIONS
TOPICS (1) ----< (M) TOPICS (self-referencing hierarchy)

QUESTIONS (1) ----< (M) QUESTION_OPTIONS
QUESTIONS (1) ----< (M) QUESTION_EXPLANATIONS
QUESTIONS (1) ----< (M) TEST_QUESTIONS
QUESTIONS (1) ----< (M) TEST_RESPONSES
QUESTIONS (1) ----< (M) QUESTION_REPORTS
QUESTIONS (M) ----< (M) TAGS (via QUESTION_TAGS)

TESTS (1) ----< (M) TEST_QUESTIONS
TESTS (1) ----< (M) TEST_ATTEMPTS

TEST_ATTEMPTS (1) ----< (M) TEST_RESPONSES

SUBSCRIPTION_PLANS (1) ----< (M) USER_SUBSCRIPTIONS
SUBSCRIPTION_PLANS (1) ----< (M) PAYMENTS

USER_SUBSCRIPTIONS (1) ----< (1) PAYMENTS
USER_SUBSCRIPTIONS (1) ----< (M) USER_SUBJECT_ACCESS

BADGES (1) ----< (M) USER_BADGES
```

---

## 🔐 SECURITY CONSIDERATIONS

### Row-Level Security (RLS)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Example policy: Students can only see their own data
CREATE POLICY student_own_data ON test_attempts
    FOR SELECT
    USING (user_id = current_setting('app.current_user_id')::BIGINT);

-- Admin can see all data
CREATE POLICY admin_all_data ON test_attempts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = current_setting('app.current_user_id')::BIGINT 
            AND role = 'admin'
        )
    );
```

### Database User Roles

```sql
-- Application user (limited permissions)
CREATE ROLE app_user WITH LOGIN PASSWORD 'secure_password';
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Admin user (full permissions)
CREATE ROLE admin_user WITH LOGIN PASSWORD 'secure_admin_password';
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin_user;

-- Read-only user (for analytics/reporting)
CREATE ROLE readonly_user WITH LOGIN PASSWORD 'readonly_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
```

---

## 📝 MIGRATION STRATEGY

### Version Control for Schema

```sql
-- Create migrations table to track applied migrations
CREATE TABLE schema_migrations (
    migration_id SERIAL PRIMARY KEY,
    version VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example migration record
INSERT INTO schema_migrations (version, description) VALUES
('001_initial_schema', 'Initial database schema with all tables');
```

### Backup Strategy

```bash
# Daily automated backups
pg_dump -h localhost -U postgres -d student_platform > backup_$(date +%Y%m%d).sql

# Backup to S3
pg_dump -h localhost -U postgres -d student_platform | gzip | aws s3 cp - s3://backups/db_backup_$(date +%Y%m%d).sql.gz
```

---

## ✅ NEXT STEPS

### After Schema Review

1. **Generate ER Diagram Visualization**
   - Use tool like dbdiagram.io or draw.io
   - Visual representation of all relationships

2. **Create SQL Migration Files**
   - Split schema into sequential migration files
   - 001_create_users_tables.sql
   - 002_create_configuration_tables.sql
   - 003_create_content_tables.sql
   - etc.

3. **Setup Database**
   - Create PostgreSQL database
   - Run migrations in order
   - Seed initial data
   - Test all constraints and triggers

4. **API Design**
   - Design REST endpoints based on schema
   - Define request/response models
   - Plan authentication flow

5. **ORM Setup**
   - Configure Prisma or SQLAlchemy
   - Generate models from schema
   - Test CRUD operations

---

**END OF DATABASE SCHEMA DESIGN DOCUMENT**

*Schema designed for: PostgreSQL 15+*  
*Design principles: Configurability, Extensibility, Performance, Data Integrity*  
*Ready for: Development, Testing, Production deployment*
