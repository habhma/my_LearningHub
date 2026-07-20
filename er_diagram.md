# Entity Relationship Diagram - Student Assessment Platform

**Generated:** 2026-07-18  
**Format:** dbdiagram.io (DBML) format  
**Database:** PostgreSQL

---

## How to Use This Diagram

1. Copy the DBML code below
2. Go to https://dbdiagram.io/
3. Paste the code in the editor
4. The diagram will render automatically
5. You can export as PDF, PNG, or SQL

---

## DBML CODE (Copy from here)

```dbml
// Student Assessment Platform - ER Diagram
// Database: PostgreSQL
// Date: 2026-07-18

Project StudentAssessmentPlatform {
  database_type: 'PostgreSQL'
  Note: 'Educational platform for students (Class 1-10) - Math Olympiad and Board Exams'
}

// =============================================
// USER MANAGEMENT TABLES
// =============================================

Table users {
  user_id bigserial [pk, increment]
  email varchar(255) [unique, not null]
  password_hash varchar(255) [not null]
  role varchar(20) [not null, default: 'student', note: 'student, admin, teacher, parent']
  status varchar(20) [not null, default: 'active', note: 'active, inactive, suspended']
  email_verified boolean [default: false]
  email_verification_token varchar(255)
  password_reset_token varchar(255)
  password_reset_expires_at timestamp
  last_login_at timestamp
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  updated_at timestamp [default: `CURRENT_TIMESTAMP`]
  deleted_at timestamp [note: 'Soft delete']
  
  Indexes {
    email
    role
    status
    deleted_at
  }
  
  Note: 'Core user authentication and role management'
}

Table user_profiles {
  profile_id bigserial [pk, increment]
  user_id bigint [unique, not null, ref: > users.user_id]
  full_name varchar(255) [not null]
  school_name varchar(255)
  class_level integer [not null, note: '1-10']
  board_id integer [ref: > boards.board_id]
  parent_name varchar(255)
  parent_email varchar(255)
  parent_phone varchar(20)
  date_of_birth date
  avatar_url varchar(500)
  bio text
  preferences jsonb [default: '{}', note: 'UI preferences']
  metadata jsonb [default: '{}', note: 'Extensible fields']
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  updated_at timestamp [default: `CURRENT_TIMESTAMP`]
  
  Indexes {
    user_id
    class_level
    board_id
    school_name
  }
  
  Note: 'Student profile with educational details'
}

Table user_sessions {
  session_id bigserial [pk, increment]
  user_id bigint [not null, ref: > users.user_id]
  refresh_token varchar(500) [unique, not null]
  device_info jsonb [note: 'Device, OS, browser']
  ip_address inet
  expires_at timestamp [not null]
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  
  Indexes {
    user_id
    refresh_token
    expires_at
  }
  
  Note: 'JWT refresh tokens and session tracking'
}

// =============================================
// CONFIGURATION TABLES (Lookup Tables)
// =============================================

Table boards {
  board_id serial [pk, increment]
  board_name varchar(100) [unique, not null]
  board_code varchar(20) [unique, not null, note: 'CBSE, ICSE, etc']
  description text
  is_active boolean [default: true]
  display_order integer [default: 0]
  metadata jsonb [default: '{}']
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  updated_at timestamp [default: `CURRENT_TIMESTAMP`]
  deleted_at timestamp
  
  Indexes {
    is_active
    board_code
  }
  
  Note: 'Educational boards - Configurable'
}

Table exam_categories {
  category_id serial [pk, increment]
  category_name varchar(100) [unique, not null]
  category_code varchar(50) [unique, not null, note: 'MATH_OLYMPIAD, CBSE_BOARD']
  description text
  icon_url varchar(500)
  is_active boolean [default: true]
  display_order integer [default: 0]
  metadata jsonb [default: '{}']
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  updated_at timestamp [default: `CURRENT_TIMESTAMP`]
  deleted_at timestamp
  
  Indexes {
    is_active
    category_code
  }
  
  Note: 'Exam types - Configurable (Olympiad, Board, etc)'
}

Table subjects {
  subject_id serial [pk, increment]
  subject_name varchar(100) [not null]
  subject_code varchar(50) [unique, not null, note: 'MATH, SCIENCE']
  description text
  icon_url varchar(500)
  color_hex varchar(7) [note: 'UI theme color']
  is_active boolean [default: true]
  display_order integer [default: 0]
  metadata jsonb [default: '{}']
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  updated_at timestamp [default: `CURRENT_TIMESTAMP`]
  deleted_at timestamp
  
  Indexes {
    is_active
    subject_code
  }
  
  Note: 'Subjects - Configurable (Math, Science, etc)'
}

Table topics {
  topic_id serial [pk, increment]
  subject_id integer [not null, ref: > subjects.subject_id]
  parent_topic_id integer [ref: > topics.topic_id, note: 'Hierarchical']
  topic_name varchar(200) [not null]
  topic_code varchar(50)
  description text
  class_level integer [note: 'NULL = all classes']
  display_order integer [default: 0]
  is_active boolean [default: true]
  metadata jsonb [default: '{}']
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  updated_at timestamp [default: `CURRENT_TIMESTAMP`]
  deleted_at timestamp
  
  Indexes {
    subject_id
    parent_topic_id
    class_level
    is_active
  }
  
  Note: 'Topics/Chapters within subjects - Hierarchical'
}

Table difficulty_levels {
  difficulty_id serial [pk, increment]
  difficulty_name varchar(50) [unique, not null]
  difficulty_code varchar(20) [unique, not null, note: 'EASY, MEDIUM, HARD']
  description text
  points_multiplier decimal(3,2) [default: 1.0]
  display_order integer [default: 0]
  color_hex varchar(7) [note: 'UI color']
  is_active boolean [default: true]
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  updated_at timestamp [default: `CURRENT_TIMESTAMP`]
  
  Indexes {
    is_active
  }
  
  Note: 'Difficulty levels - Configurable with point multipliers'
}

Table question_types {
  type_id serial [pk, increment]
  type_name varchar(50) [unique, not null]
  type_code varchar(20) [unique, not null, note: 'MCQ, MSQ, TRUE_FALSE, SUBJECTIVE, NUMERICAL']
  description text
  validation_rules jsonb [note: 'Min/max options, etc']
  scoring_rules jsonb [note: 'Partial credit, negative marking']
  is_active boolean [default: true]
  display_order integer [default: 0]
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  updated_at timestamp [default: `CURRENT_TIMESTAMP`]
  
  Indexes {
    is_active
  }
  
  Note: 'Question types - Metadata-driven validation'
}

// =============================================
// CONTENT TABLES
// =============================================

Table questions {
  question_id bigserial [pk, increment]
  question_text text [not null]
  question_html text [note: 'Rich text with formatting']
  question_image_url varchar(500)
  
  type_id integer [not null, ref: > question_types.type_id]
  difficulty_id integer [not null, ref: > difficulty_levels.difficulty_id]
  subject_id integer [not null, ref: > subjects.subject_id]
  topic_id integer [ref: > topics.topic_id]
  class_level integer [not null, note: '1-10']
  exam_category_id integer [not null, ref: > exam_categories.category_id]
  
  correct_answer text
  correct_answer_data jsonb [note: 'For MSQ and complex answers']
  
  time_limit_seconds integer [default: 180]
  marks decimal(5,2) [default: 1.0]
  negative_marks decimal(5,2) [default: 0.0]
  
  times_attempted integer [default: 0]
  times_correct integer [default: 0]
  success_rate decimal(5,2) [note: 'Computed percentage']
  avg_time_taken_seconds integer
  
  tags jsonb [default: '[]']
  metadata jsonb [default: '{}']
  
  status varchar(20) [default: 'draft', note: 'draft, active, flagged, retired']
  is_active boolean [default: true]
  
  created_by bigint [ref: > users.user_id]
  updated_by bigint [ref: > users.user_id]
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  updated_at timestamp [default: `CURRENT_TIMESTAMP`]
  deleted_at timestamp
  
  Indexes {
    type_id
    difficulty_id
    subject_id
    topic_id
    class_level
    exam_category_id
    status
    is_active
    success_rate
    created_at
    (class_level, subject_id, difficulty_id) [name: 'idx_class_subject_difficulty']
    (exam_category_id, class_level) [name: 'idx_category_class']
  }
  
  Note: 'Core questions table with quality metrics'
}

Table question_options {
  option_id bigserial [pk, increment]
  question_id bigint [not null, ref: > questions.question_id]
  option_text text [not null]
  option_html text
  option_image_url varchar(500)
  option_order integer [not null, note: 'A=1, B=2, C=3, D=4']
  is_correct boolean [default: false]
  metadata jsonb [default: '{}']
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  updated_at timestamp [default: `CURRENT_TIMESTAMP`]
  
  Indexes {
    question_id
    is_correct
    (question_id, option_order) [unique, name: 'uq_question_option_order']
  }
  
  Note: 'Options for MCQ/MSQ/True-False questions'
}

Table question_explanations {
  explanation_id bigserial [pk, increment]
  question_id bigint [not null, ref: > questions.question_id]
  explanation_type varchar(20) [default: 'wrong_answer', note: 'wrong_answer, correct_answer, hint']
  explanation_text text [not null]
  explanation_html text
  explanation_images jsonb [default: '[]', note: 'Array of image objects']
  explanation_video_url varchar(500) [note: 'Phase 2']
  step_by_step jsonb [note: 'Step-by-step solution']
  display_order integer [default: 1]
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  updated_at timestamp [default: `CURRENT_TIMESTAMP`]
  
  Indexes {
    question_id
    explanation_type
  }
  
  Note: 'Explanations for questions (mandatory for wrong answers)'
}

Table tags {
  tag_id serial [pk, increment]
  tag_name varchar(50) [unique, not null]
  tag_category varchar(50) [note: 'concept, skill, exam_type']
  description text
  is_active boolean [default: true]
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  
  Indexes {
    tag_name
    tag_category
  }
  
  Note: 'Tags for advanced question filtering'
}

Table question_tags {
  question_id bigint [ref: > questions.question_id]
  tag_id integer [ref: > tags.tag_id]
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  
  Indexes {
    question_id
    tag_id
    (question_id, tag_id) [pk]
  }
  
  Note: 'Many-to-many: Questions <-> Tags'
}

// =============================================
// ASSESSMENT TABLES
// =============================================

Table tests {
  test_id bigserial [pk, increment]
  test_name varchar(255)
  test_type varchar(20) [not null, note: 'practice, mock, diagnostic']
  test_config jsonb [not null, note: 'Duration, questions count, randomization rules']
  
  subject_id integer [ref: > subjects.subject_id]
  exam_category_id integer [ref: > exam_categories.category_id]
  class_level integer
  
  access_level varchar(20) [default: 'free', note: 'free, premium, points_required']
  points_cost integer [default: 0]
  
  is_template boolean [default: false, note: 'Admin-created template']
  is_active boolean [default: true]
  created_by bigint [ref: > users.user_id]
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  updated_at timestamp [default: `CURRENT_TIMESTAMP`]
  deleted_at timestamp
  
  Indexes {
    test_type
    subject_id
    exam_category_id
    class_level
    is_template
    is_active
  }
  
  Note: 'Test definitions (practice/mock) - pre-configured or auto-generated'
}

Table test_questions {
  test_question_id bigserial [pk, increment]
  test_id bigint [not null, ref: > tests.test_id]
  question_id bigint [not null, ref: > questions.question_id]
  question_order integer [not null]
  marks decimal(5,2) [default: 1.0]
  negative_marks decimal(5,2) [default: 0.0]
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  
  Indexes {
    test_id
    question_id
    (test_id, question_order) [unique, name: 'uq_test_question_order']
    (test_id, question_id) [unique, name: 'uq_test_question']
  }
  
  Note: 'Questions in pre-configured tests'
}

Table test_attempts {
  attempt_id bigserial [pk, increment]
  test_id bigint [not null, ref: > tests.test_id]
  user_id bigint [not null, ref: > users.user_id]
  
  status varchar(20) [default: 'in_progress', note: 'in_progress, completed, abandoned, auto_submitted']
  
  started_at timestamp [default: `CURRENT_TIMESTAMP`]
  submitted_at timestamp
  time_taken_seconds integer
  
  total_questions integer [not null]
  attempted_questions integer [default: 0]
  correct_answers integer [default: 0]
  wrong_answers integer [default: 0]
  unattempted integer [default: 0]
  
  score decimal(6,2) [default: 0.0]
  max_score decimal(6,2) [not null]
  percentage decimal(5,2) [default: 0.0]
  
  questions_data jsonb [note: 'Snapshot of questions']
  responses_summary jsonb [note: 'Quick summary']
  metadata jsonb [default: '{}']
  
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  updated_at timestamp [default: `CURRENT_TIMESTAMP`]
  
  Indexes {
    test_id
    user_id
    status
    started_at
    percentage
    (user_id, score) [name: 'idx_user_score']
  }
  
  Note: 'Student test attempts with results'
}

Table test_responses {
  response_id bigserial [pk, increment]
  attempt_id bigint [not null, ref: > test_attempts.attempt_id]
  question_id bigint [not null, ref: > questions.question_id]
  
  selected_option_id bigint [ref: > question_options.option_id]
  selected_option_ids jsonb [note: 'For MSQ']
  text_answer text [note: 'For SUBJECTIVE/NUMERICAL']
  
  is_correct boolean
  marks_awarded decimal(5,2) [default: 0.0]
  marks_possible decimal(5,2) [not null]
  
  time_taken_seconds integer
  marked_for_review boolean [default: false]
  response_order integer
  metadata jsonb [default: '{}']
  
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  updated_at timestamp [default: `CURRENT_TIMESTAMP`]
  
  Indexes {
    attempt_id
    question_id
    is_correct
    (attempt_id, question_id) [unique, name: 'uq_attempt_question']
  }
  
  Note: 'Individual question responses in test attempts'
}

// =============================================
// SUBSCRIPTION & PAYMENT TABLES
// =============================================

Table subscription_plans {
  plan_id serial [pk, increment]
  plan_name varchar(100) [not null]
  plan_code varchar(50) [unique, not null]
  description text
  
  price_per_month decimal(10,2) [not null]
  price_per_quarter decimal(10,2)
  price_per_year decimal(10,2)
  
  class_level integer [note: 'NULL = all classes']
  subject_id integer [ref: > subjects.subject_id]
  
  features jsonb [default: '{}']
  is_active boolean [default: true]
  display_order integer [default: 0]
  
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  updated_at timestamp [default: `CURRENT_TIMESTAMP`]
  deleted_at timestamp
  
  Indexes {
    class_level
    subject_id
    is_active
  }
  
  Note: 'Pricing matrix: Class x Subject - Configurable'
}

Table user_subscriptions {
  subscription_id bigserial [pk, increment]
  user_id bigint [not null, ref: > users.user_id]
  plan_id integer [not null, ref: > subscription_plans.plan_id]
  
  start_date date [not null]
  end_date date [not null]
  
  status varchar(20) [default: 'active', note: 'active, expired, cancelled, pending']
  auto_renewal boolean [default: false]
  
  payment_id bigint [ref: > payments.payment_id]
  metadata jsonb [default: '{}']
  
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  updated_at timestamp [default: `CURRENT_TIMESTAMP`]
  cancelled_at timestamp
  
  Indexes {
    user_id
    plan_id
    status
    end_date
    (user_id, status, end_date) [name: 'idx_user_active_subscription']
  }
  
  Note: 'User active subscriptions'
}

Table user_subject_access {
  access_id bigserial [pk, increment]
  user_id bigint [not null, ref: > users.user_id]
  subject_id integer [not null, ref: > subjects.subject_id]
  
  access_type varchar(20) [not null, note: 'free, premium, trial']
  
  free_questions_used integer [default: 0]
  free_questions_limit integer [default: 10]
  
  granted_at timestamp [default: `CURRENT_TIMESTAMP`]
  expires_at timestamp [note: 'NULL = permanent']
  
  subscription_id bigint [ref: > user_subscriptions.subscription_id]
  metadata jsonb [default: '{}']
  
  Indexes {
    user_id
    subject_id
    access_type
    (user_id, subject_id) [unique, name: 'uq_user_subject']
  }
  
  Note: 'Tracks free tier (10 questions, 2 subjects locked) and premium access'
}

Table payments {
  payment_id bigserial [pk, increment]
  user_id bigint [not null, ref: > users.user_id]
  
  amount decimal(10,2) [not null]
  currency varchar(3) [default: 'INR']
  payment_method varchar(50) [note: 'razorpay, stripe, upi, card']
  
  gateway_transaction_id varchar(255) [unique]
  gateway_name varchar(50)
  gateway_response jsonb
  
  status varchar(20) [default: 'pending', note: 'pending, success, failed, refunded']
  
  plan_id integer [ref: > subscription_plans.plan_id]
  subscription_id bigint [ref: > user_subscriptions.subscription_id]
  metadata jsonb [default: '{}']
  
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  updated_at timestamp [default: `CURRENT_TIMESTAMP`]
  completed_at timestamp
  
  Indexes {
    user_id
    status
    gateway_transaction_id
    created_at
  }
  
  Note: 'Payment transactions (Razorpay/Stripe)'
}

// =============================================
// GAMIFICATION TABLES
// =============================================

Table badges {
  badge_id serial [pk, increment]
  badge_name varchar(100) [unique, not null]
  badge_code varchar(50) [unique, not null]
  description text
  icon_url varchar(500)
  
  criteria jsonb [not null, note: 'Achievement criteria']
  category varchar(50) [note: 'milestone, streak, accuracy, speed']
  class_range jsonb [note: '[1, 3] for Class 1-3']
  
  rarity varchar(20) [default: 'common', note: 'common, rare, epic, legendary']
  display_order integer [default: 0]
  is_active boolean [default: true]
  
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  updated_at timestamp [default: `CURRENT_TIMESTAMP`]
  
  Indexes {
    is_active
    category
  }
  
  Note: 'Available badges - Configurable criteria'
}

Table user_badges {
  user_badge_id bigserial [pk, increment]
  user_id bigint [not null, ref: > users.user_id]
  badge_id integer [not null, ref: > badges.badge_id]
  earned_at timestamp [default: `CURRENT_TIMESTAMP`]
  metadata jsonb [default: '{}', note: 'Context when earned']
  
  Indexes {
    user_id
    badge_id
    earned_at
    (user_id, badge_id) [unique, name: 'uq_user_badge']
  }
  
  Note: 'Badges earned by users'
}

Table points_transactions {
  transaction_id bigserial [pk, increment]
  user_id bigint [not null, ref: > users.user_id]
  
  points integer [not null, note: 'Positive = earn, Negative = redeem']
  transaction_type varchar(50) [not null, note: 'correct_answer, streak_bonus, redeem_test']
  
  reference_type varchar(50) [note: 'test_attempt, badge, daily_challenge']
  reference_id bigint
  
  balance_after integer [not null]
  description text
  metadata jsonb [default: '{}']
  
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  
  Indexes {
    user_id
    created_at
    (reference_type, reference_id) [name: 'idx_reference']
  }
  
  Note: 'Points earned/redeemed - full audit trail'
}

Table leaderboard_snapshots {
  snapshot_id bigserial [pk, increment]
  
  leaderboard_type varchar(50) [not null, note: 'global, class, school']
  class_level integer
  school_name varchar(255)
  
  period varchar(20) [default: 'all_time', note: 'all_time, monthly, weekly']
  snapshot_date date [not null]
  
  rankings jsonb [not null, note: 'Array of {rank, user_id, points, name}']
  total_users integer
  last_updated_at timestamp [default: `CURRENT_TIMESTAMP`]
  
  Indexes {
    leaderboard_type
    class_level
    school_name
    snapshot_date
  }
  
  Note: 'Cached leaderboards for performance (never reset)'
}

// =============================================
// SUPPORT & ADMIN TABLES
// =============================================

Table question_reports {
  report_id bigserial [pk, increment]
  question_id bigint [not null, ref: > questions.question_id]
  reported_by bigint [not null, ref: > users.user_id]
  
  report_type varchar(50) [not null, note: 'incorrect_answer, unclear_question, typo, other']
  description text [not null]
  
  status varchar(20) [default: 'pending', note: 'pending, reviewed, resolved, dismissed']
  
  resolved_by bigint [ref: > users.user_id]
  resolution_notes text
  resolved_at timestamp
  
  metadata jsonb [default: '{}']
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  updated_at timestamp [default: `CURRENT_TIMESTAMP`]
  
  Indexes {
    question_id
    reported_by
    status
    created_at
  }
  
  Note: 'User-reported question issues'
}

Table configuration_audit_log {
  log_id bigserial [pk, increment]
  
  table_name varchar(100) [not null]
  record_id integer [not null]
  action varchar(20) [not null, note: 'created, updated, deleted']
  
  old_values jsonb [note: 'Before change']
  new_values jsonb [note: 'After change']
  changed_fields jsonb [note: 'List of changed fields']
  
  changed_by bigint [not null, ref: > users.user_id]
  changed_at timestamp [default: `CURRENT_TIMESTAMP`]
  
  ip_address inet
  user_agent text
  
  Indexes {
    (table_name, record_id) [name: 'idx_table_record']
    changed_by
    changed_at
  }
  
  Note: 'Audit trail for all configuration changes'
}

// =============================================
// RELATIONSHIPS SUMMARY
// =============================================

// USER RELATIONSHIPS
// users -> user_profiles (1:1)
// users -> user_sessions (1:M)
// users -> test_attempts (1:M)
// users -> user_subscriptions (1:M)
// users -> user_badges (1:M)
// users -> points_transactions (1:M)
// users -> question_reports (1:M)
// users -> user_subject_access (1:M)
// users -> questions (created_by, updated_by)

// CONFIGURATION RELATIONSHIPS
// boards -> user_profiles (1:M)
// subjects -> topics (1:M)
// subjects -> questions (1:M)
// subjects -> tests (1:M)
// subjects -> subscription_plans (1:M)
// subjects -> user_subject_access (1:M)
// topics -> questions (1:M)
// topics -> topics (self-referencing hierarchy)
// exam_categories -> questions (1:M)
// exam_categories -> tests (1:M)
// difficulty_levels -> questions (1:M)
// question_types -> questions (1:M)

// CONTENT RELATIONSHIPS
// questions -> question_options (1:M)
// questions -> question_explanations (1:M)
// questions -> test_questions (1:M)
// questions -> test_responses (1:M)
// questions -> question_reports (1:M)
// questions <-> tags (M:M via question_tags)

// ASSESSMENT RELATIONSHIPS
// tests -> test_questions (1:M)
// tests -> test_attempts (1:M)
// test_attempts -> test_responses (1:M)

// SUBSCRIPTION RELATIONSHIPS
// subscription_plans -> user_subscriptions (1:M)
// subscription_plans -> payments (1:M)
// user_subscriptions -> payments (1:1)
// user_subscriptions -> user_subject_access (1:M)

// GAMIFICATION RELATIONSHIPS
// badges -> user_badges (1:M)

// SUPPORT RELATIONSHIPS
// questions -> question_reports (1:M)
// users -> configuration_audit_log (changed_by)

```

---

## RELATIONSHIP CARDINALITIES

**One-to-One (1:1):**
- users ↔ user_profiles
- user_subscriptions ↔ payments

**One-to-Many (1:M):**
- users → user_sessions
- users → test_attempts
- users → user_subscriptions
- users → user_badges
- users → points_transactions
- boards → user_profiles
- subjects → topics
- subjects → questions
- topics → questions
- topics → topics (hierarchical)
- exam_categories → questions
- difficulty_levels → questions
- question_types → questions
- questions → question_options
- questions → question_explanations
- questions → question_reports
- tests → test_questions
- tests → test_attempts
- test_attempts → test_responses
- subscription_plans → user_subscriptions
- badges → user_badges

**Many-to-Many (M:M):**
- questions ↔ tags (via question_tags)

---

## KEY DESIGN FEATURES

### ✅ Configuration-Driven
All lookup tables (boards, subjects, exam_categories, topics, difficulty_levels, question_types) are fully configurable without code changes.

### ✅ Hierarchical Topics
Topics table has self-referencing relationship (parent_topic_id) for Chapter → Sub-topic structure.

### ✅ Flexible Questions
Questions use JSONB columns (correct_answer_data, tags, metadata) for extensibility across all question types.

### ✅ Quality Metrics
Questions table tracks times_attempted, times_correct, success_rate, avg_time_taken_seconds automatically.

### ✅ Free Tier Tracking
user_subject_access tracks free_questions_used with 10-question limit, locked after selection.

### ✅ Points Economy
points_transactions maintains full audit trail with balance_after for each transaction.

### ✅ Leaderboards
leaderboard_snapshots caches rankings (never reset) for performance.

### ✅ Soft Deletes
Major tables use deleted_at for soft deletes, preserving data integrity.

### ✅ Audit Trail
configuration_audit_log tracks all configuration changes (who, what, when).

### ✅ JSONB Extensibility
Strategic use of JSONB columns allows adding features without schema migrations:
- test_config (duration, randomization rules)
- user_profiles.preferences (UI settings)
- badges.criteria (achievement logic)
- subscription_plans.features (feature flags)

---

## HOW TO VISUALIZE

### Option 1: dbdiagram.io (Recommended)
1. Go to https://dbdiagram.io/
2. Click "Go to App"
3. Delete default content
4. Paste the DBML code above
5. Diagram renders automatically
6. Export as PDF, PNG, or SQL

### Option 2: Draw.io
1. Go to https://app.diagrams.net/
2. Create new diagram
3. Use "Entity Relation" shapes
4. Manually draw based on relationships above

### Option 3: DBeaver / DataGrip
1. Connect to PostgreSQL database
2. Run the SQL schema creation scripts
3. Use built-in ER diagram viewer
4. Export diagram as image

---

## LEGEND

**Relationships:**
- `>` : Many-to-One (FK points to PK)
- `-` : One-to-One
- `<>` : Many-to-Many

**Constraints:**
- `pk` : Primary Key
- `unique` : Unique Constraint
- `not null` : Required Field
- `default` : Default Value
- `ref` : Foreign Key Reference

**Data Types:**
- `bigserial` : Auto-increment BIGINT
- `serial` : Auto-increment INTEGER
- `varchar(n)` : Variable character
- `text` : Unlimited text
- `jsonb` : Binary JSON
- `inet` : IP address
- `decimal(p,s)` : Decimal number

---

**END OF ER DIAGRAM DOCUMENT**

*Total Tables: 28*  
*Total Relationships: 50+*  
*Design: Highly normalized, configuration-driven, extensible*
