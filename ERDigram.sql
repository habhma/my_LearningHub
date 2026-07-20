CREATE TABLE "users" (
  "user_id" BIGSERIAL PRIMARY KEY,
  "email" varchar(255) UNIQUE NOT NULL,
  "password_hash" varchar(255) NOT NULL,
  "role" varchar(20) NOT NULL DEFAULT 'student',
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "email_verified" boolean DEFAULT false,
  "email_verification_token" varchar(255),
  "password_reset_token" varchar(255),
  "password_reset_expires_at" timestamp,
  "last_login_at" timestamp,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "deleted_at" timestamp
);

CREATE TABLE "user_profiles" (
  "profile_id" BIGSERIAL PRIMARY KEY,
  "user_id" bigint UNIQUE NOT NULL,
  "full_name" varchar(255) NOT NULL,
  "school_name" varchar(255),
  "class_level" integer NOT NULL,
  "board_id" integer,
  "parent_name" varchar(255),
  "parent_email" varchar(255),
  "parent_phone" varchar(20),
  "date_of_birth" date,
  "avatar_url" varchar(500),
  "bio" text,
  "preferences" jsonb DEFAULT '{}',
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "user_sessions" (
  "session_id" BIGSERIAL PRIMARY KEY,
  "user_id" bigint NOT NULL,
  "refresh_token" varchar(500) UNIQUE NOT NULL,
  "device_info" jsonb,
  "ip_address" inet,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "boards" (
  "board_id" SERIAL PRIMARY KEY,
  "board_name" varchar(100) UNIQUE NOT NULL,
  "board_code" varchar(20) UNIQUE NOT NULL,
  "description" text,
  "is_active" boolean DEFAULT true,
  "display_order" integer DEFAULT 0,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "deleted_at" timestamp
);

CREATE TABLE "exam_categories" (
  "category_id" SERIAL PRIMARY KEY,
  "category_name" varchar(100) UNIQUE NOT NULL,
  "category_code" varchar(50) UNIQUE NOT NULL,
  "description" text,
  "icon_url" varchar(500),
  "is_active" boolean DEFAULT true,
  "display_order" integer DEFAULT 0,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "deleted_at" timestamp
);

CREATE TABLE "subjects" (
  "subject_id" SERIAL PRIMARY KEY,
  "subject_name" varchar(100) NOT NULL,
  "subject_code" varchar(50) UNIQUE NOT NULL,
  "description" text,
  "icon_url" varchar(500),
  "color_hex" varchar(7),
  "is_active" boolean DEFAULT true,
  "display_order" integer DEFAULT 0,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "deleted_at" timestamp
);

CREATE TABLE "topics" (
  "topic_id" SERIAL PRIMARY KEY,
  "subject_id" integer NOT NULL,
  "parent_topic_id" integer,
  "topic_name" varchar(200) NOT NULL,
  "topic_code" varchar(50),
  "description" text,
  "class_level" integer,
  "display_order" integer DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "deleted_at" timestamp
);

CREATE TABLE "difficulty_levels" (
  "difficulty_id" SERIAL PRIMARY KEY,
  "difficulty_name" varchar(50) UNIQUE NOT NULL,
  "difficulty_code" varchar(20) UNIQUE NOT NULL,
  "description" text,
  "points_multiplier" decimal(3,2) DEFAULT 1,
  "display_order" integer DEFAULT 0,
  "color_hex" varchar(7),
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "question_types" (
  "type_id" SERIAL PRIMARY KEY,
  "type_name" varchar(50) UNIQUE NOT NULL,
  "type_code" varchar(20) UNIQUE NOT NULL,
  "description" text,
  "validation_rules" jsonb,
  "scoring_rules" jsonb,
  "is_active" boolean DEFAULT true,
  "display_order" integer DEFAULT 0,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "questions" (
  "question_id" BIGSERIAL PRIMARY KEY,
  "question_text" text NOT NULL,
  "question_html" text,
  "question_image_url" varchar(500),
  "type_id" integer NOT NULL,
  "difficulty_id" integer NOT NULL,
  "subject_id" integer NOT NULL,
  "topic_id" integer,
  "class_level" integer NOT NULL,
  "exam_category_id" integer NOT NULL,
  "correct_answer" text,
  "correct_answer_data" jsonb,
  "time_limit_seconds" integer DEFAULT 180,
  "marks" decimal(5,2) DEFAULT 1,
  "negative_marks" decimal(5,2) DEFAULT 0,
  "times_attempted" integer DEFAULT 0,
  "times_correct" integer DEFAULT 0,
  "success_rate" decimal(5,2),
  "avg_time_taken_seconds" integer,
  "tags" jsonb DEFAULT '[]',
  "metadata" jsonb DEFAULT '{}',
  "status" varchar(20) DEFAULT 'draft',
  "is_active" boolean DEFAULT true,
  "created_by" bigint,
  "updated_by" bigint,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "deleted_at" timestamp
);

CREATE TABLE "question_options" (
  "option_id" BIGSERIAL PRIMARY KEY,
  "question_id" bigint NOT NULL,
  "option_text" text NOT NULL,
  "option_html" text,
  "option_image_url" varchar(500),
  "option_order" integer NOT NULL,
  "is_correct" boolean DEFAULT false,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "question_explanations" (
  "explanation_id" BIGSERIAL PRIMARY KEY,
  "question_id" bigint NOT NULL,
  "explanation_type" varchar(20) DEFAULT 'wrong_answer',
  "explanation_text" text NOT NULL,
  "explanation_html" text,
  "explanation_images" jsonb DEFAULT '[]',
  "explanation_video_url" varchar(500),
  "step_by_step" jsonb,
  "display_order" integer DEFAULT 1,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "tags" (
  "tag_id" SERIAL PRIMARY KEY,
  "tag_name" varchar(50) UNIQUE NOT NULL,
  "tag_category" varchar(50),
  "description" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "question_tags" (
  "question_id" bigint,
  "tag_id" integer,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY ("question_id", "tag_id")
);

CREATE TABLE "tests" (
  "test_id" BIGSERIAL PRIMARY KEY,
  "test_name" varchar(255),
  "test_type" varchar(20) NOT NULL,
  "test_config" jsonb NOT NULL,
  "subject_id" integer,
  "exam_category_id" integer,
  "class_level" integer,
  "access_level" varchar(20) DEFAULT 'free',
  "points_cost" integer DEFAULT 0,
  "is_template" boolean DEFAULT false,
  "is_active" boolean DEFAULT true,
  "created_by" bigint,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "deleted_at" timestamp
);

CREATE TABLE "test_questions" (
  "test_question_id" BIGSERIAL PRIMARY KEY,
  "test_id" bigint NOT NULL,
  "question_id" bigint NOT NULL,
  "question_order" integer NOT NULL,
  "marks" decimal(5,2) DEFAULT 1,
  "negative_marks" decimal(5,2) DEFAULT 0,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "test_attempts" (
  "attempt_id" BIGSERIAL PRIMARY KEY,
  "test_id" bigint NOT NULL,
  "user_id" bigint NOT NULL,
  "status" varchar(20) DEFAULT 'in_progress',
  "started_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "submitted_at" timestamp,
  "time_taken_seconds" integer,
  "total_questions" integer NOT NULL,
  "attempted_questions" integer DEFAULT 0,
  "correct_answers" integer DEFAULT 0,
  "wrong_answers" integer DEFAULT 0,
  "unattempted" integer DEFAULT 0,
  "score" decimal(6,2) DEFAULT 0,
  "max_score" decimal(6,2) NOT NULL,
  "percentage" decimal(5,2) DEFAULT 0,
  "questions_data" jsonb,
  "responses_summary" jsonb,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "test_responses" (
  "response_id" BIGSERIAL PRIMARY KEY,
  "attempt_id" bigint NOT NULL,
  "question_id" bigint NOT NULL,
  "selected_option_id" bigint,
  "selected_option_ids" jsonb,
  "text_answer" text,
  "is_correct" boolean,
  "marks_awarded" decimal(5,2) DEFAULT 0,
  "marks_possible" decimal(5,2) NOT NULL,
  "time_taken_seconds" integer,
  "marked_for_review" boolean DEFAULT false,
  "response_order" integer,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "subscription_plans" (
  "plan_id" SERIAL PRIMARY KEY,
  "plan_name" varchar(100) NOT NULL,
  "plan_code" varchar(50) UNIQUE NOT NULL,
  "description" text,
  "price_per_month" decimal(10,2) NOT NULL,
  "price_per_quarter" decimal(10,2),
  "price_per_year" decimal(10,2),
  "class_level" integer,
  "subject_id" integer,
  "features" jsonb DEFAULT '{}',
  "is_active" boolean DEFAULT true,
  "display_order" integer DEFAULT 0,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "deleted_at" timestamp
);

CREATE TABLE "user_subscriptions" (
  "subscription_id" BIGSERIAL PRIMARY KEY,
  "user_id" bigint NOT NULL,
  "plan_id" integer NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "status" varchar(20) DEFAULT 'active',
  "auto_renewal" boolean DEFAULT false,
  "payment_id" bigint,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "cancelled_at" timestamp
);

CREATE TABLE "user_subject_access" (
  "access_id" BIGSERIAL PRIMARY KEY,
  "user_id" bigint NOT NULL,
  "subject_id" integer NOT NULL,
  "access_type" varchar(20) NOT NULL,
  "free_questions_used" integer DEFAULT 0,
  "free_questions_limit" integer DEFAULT 10,
  "granted_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "expires_at" timestamp,
  "subscription_id" bigint,
  "metadata" jsonb DEFAULT '{}'
);

CREATE TABLE "payments" (
  "payment_id" BIGSERIAL PRIMARY KEY,
  "user_id" bigint NOT NULL,
  "amount" decimal(10,2) NOT NULL,
  "currency" varchar(3) DEFAULT 'INR',
  "payment_method" varchar(50),
  "gateway_transaction_id" varchar(255) UNIQUE,
  "gateway_name" varchar(50),
  "gateway_response" jsonb,
  "status" varchar(20) DEFAULT 'pending',
  "plan_id" integer,
  "subscription_id" bigint,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "completed_at" timestamp
);

CREATE TABLE "badges" (
  "badge_id" SERIAL PRIMARY KEY,
  "badge_name" varchar(100) UNIQUE NOT NULL,
  "badge_code" varchar(50) UNIQUE NOT NULL,
  "description" text,
  "icon_url" varchar(500),
  "criteria" jsonb NOT NULL,
  "category" varchar(50),
  "class_range" jsonb,
  "rarity" varchar(20) DEFAULT 'common',
  "display_order" integer DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "user_badges" (
  "user_badge_id" BIGSERIAL PRIMARY KEY,
  "user_id" bigint NOT NULL,
  "badge_id" integer NOT NULL,
  "earned_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "metadata" jsonb DEFAULT '{}'
);

CREATE TABLE "points_transactions" (
  "transaction_id" BIGSERIAL PRIMARY KEY,
  "user_id" bigint NOT NULL,
  "points" integer NOT NULL,
  "transaction_type" varchar(50) NOT NULL,
  "reference_type" varchar(50),
  "reference_id" bigint,
  "balance_after" integer NOT NULL,
  "description" text,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "leaderboard_snapshots" (
  "snapshot_id" BIGSERIAL PRIMARY KEY,
  "leaderboard_type" varchar(50) NOT NULL,
  "class_level" integer,
  "school_name" varchar(255),
  "period" varchar(20) DEFAULT 'all_time',
  "snapshot_date" date NOT NULL,
  "rankings" jsonb NOT NULL,
  "total_users" integer,
  "last_updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "question_reports" (
  "report_id" BIGSERIAL PRIMARY KEY,
  "question_id" bigint NOT NULL,
  "reported_by" bigint NOT NULL,
  "report_type" varchar(50) NOT NULL,
  "description" text NOT NULL,
  "status" varchar(20) DEFAULT 'pending',
  "resolved_by" bigint,
  "resolution_notes" text,
  "resolved_at" timestamp,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "configuration_audit_log" (
  "log_id" BIGSERIAL PRIMARY KEY,
  "table_name" varchar(100) NOT NULL,
  "record_id" integer NOT NULL,
  "action" varchar(20) NOT NULL,
  "old_values" jsonb,
  "new_values" jsonb,
  "changed_fields" jsonb,
  "changed_by" bigint NOT NULL,
  "changed_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "ip_address" inet,
  "user_agent" text
);

CREATE INDEX ON "users" ("email");

CREATE INDEX ON "users" ("role");

CREATE INDEX ON "users" ("status");

CREATE INDEX ON "users" ("deleted_at");

CREATE INDEX ON "user_profiles" ("user_id");

CREATE INDEX ON "user_profiles" ("class_level");

CREATE INDEX ON "user_profiles" ("board_id");

CREATE INDEX ON "user_profiles" ("school_name");

CREATE INDEX ON "user_sessions" ("user_id");

CREATE INDEX ON "user_sessions" ("refresh_token");

CREATE INDEX ON "user_sessions" ("expires_at");

CREATE INDEX ON "boards" ("is_active");

CREATE INDEX ON "boards" ("board_code");

CREATE INDEX ON "exam_categories" ("is_active");

CREATE INDEX ON "exam_categories" ("category_code");

CREATE INDEX ON "subjects" ("is_active");

CREATE INDEX ON "subjects" ("subject_code");

CREATE INDEX ON "topics" ("subject_id");

CREATE INDEX ON "topics" ("parent_topic_id");

CREATE INDEX ON "topics" ("class_level");

CREATE INDEX ON "topics" ("is_active");

CREATE INDEX ON "difficulty_levels" ("is_active");

CREATE INDEX ON "question_types" ("is_active");

CREATE INDEX ON "questions" ("type_id");

CREATE INDEX ON "questions" ("difficulty_id");

CREATE INDEX ON "questions" ("subject_id");

CREATE INDEX ON "questions" ("topic_id");

CREATE INDEX ON "questions" ("class_level");

CREATE INDEX ON "questions" ("exam_category_id");

CREATE INDEX ON "questions" ("status");

CREATE INDEX ON "questions" ("is_active");

CREATE INDEX ON "questions" ("success_rate");

CREATE INDEX ON "questions" ("created_at");

CREATE INDEX "idx_class_subject_difficulty" ON "questions" ("class_level", "subject_id", "difficulty_id");

CREATE INDEX "idx_category_class" ON "questions" ("exam_category_id", "class_level");

CREATE INDEX ON "question_options" ("question_id");

CREATE INDEX ON "question_options" ("is_correct");

CREATE UNIQUE INDEX "uq_question_option_order" ON "question_options" ("question_id", "option_order");

CREATE INDEX ON "question_explanations" ("question_id");

CREATE INDEX ON "question_explanations" ("explanation_type");

CREATE INDEX ON "tags" ("tag_name");

CREATE INDEX ON "tags" ("tag_category");

CREATE INDEX ON "question_tags" ("question_id");

CREATE INDEX ON "question_tags" ("tag_id");

CREATE INDEX ON "tests" ("test_type");

CREATE INDEX ON "tests" ("subject_id");

CREATE INDEX ON "tests" ("exam_category_id");

CREATE INDEX ON "tests" ("class_level");

CREATE INDEX ON "tests" ("is_template");

CREATE INDEX ON "tests" ("is_active");

CREATE INDEX ON "test_questions" ("test_id");

CREATE INDEX ON "test_questions" ("question_id");

CREATE UNIQUE INDEX "uq_test_question_order" ON "test_questions" ("test_id", "question_order");

CREATE UNIQUE INDEX "uq_test_question" ON "test_questions" ("test_id", "question_id");

CREATE INDEX ON "test_attempts" ("test_id");

CREATE INDEX ON "test_attempts" ("user_id");

CREATE INDEX ON "test_attempts" ("status");

CREATE INDEX ON "test_attempts" ("started_at");

CREATE INDEX ON "test_attempts" ("percentage");

CREATE INDEX "idx_user_score" ON "test_attempts" ("user_id", "score");

CREATE INDEX ON "test_responses" ("attempt_id");

CREATE INDEX ON "test_responses" ("question_id");

CREATE INDEX ON "test_responses" ("is_correct");

CREATE UNIQUE INDEX "uq_attempt_question" ON "test_responses" ("attempt_id", "question_id");

CREATE INDEX ON "subscription_plans" ("class_level");

CREATE INDEX ON "subscription_plans" ("subject_id");

CREATE INDEX ON "subscription_plans" ("is_active");

CREATE INDEX ON "user_subscriptions" ("user_id");

CREATE INDEX ON "user_subscriptions" ("plan_id");

CREATE INDEX ON "user_subscriptions" ("status");

CREATE INDEX ON "user_subscriptions" ("end_date");

CREATE INDEX "idx_user_active_subscription" ON "user_subscriptions" ("user_id", "status", "end_date");

CREATE INDEX ON "user_subject_access" ("user_id");

CREATE INDEX ON "user_subject_access" ("subject_id");

CREATE INDEX ON "user_subject_access" ("access_type");

CREATE UNIQUE INDEX "uq_user_subject" ON "user_subject_access" ("user_id", "subject_id");

CREATE INDEX ON "payments" ("user_id");

CREATE INDEX ON "payments" ("status");

CREATE INDEX ON "payments" ("gateway_transaction_id");

CREATE INDEX ON "payments" ("created_at");

CREATE INDEX ON "badges" ("is_active");

CREATE INDEX ON "badges" ("category");

CREATE INDEX ON "user_badges" ("user_id");

CREATE INDEX ON "user_badges" ("badge_id");

CREATE INDEX ON "user_badges" ("earned_at");

CREATE UNIQUE INDEX "uq_user_badge" ON "user_badges" ("user_id", "badge_id");

CREATE INDEX ON "points_transactions" ("user_id");

CREATE INDEX ON "points_transactions" ("created_at");

CREATE INDEX "idx_reference" ON "points_transactions" ("reference_type", "reference_id");

CREATE INDEX ON "leaderboard_snapshots" ("leaderboard_type");

CREATE INDEX ON "leaderboard_snapshots" ("class_level");

CREATE INDEX ON "leaderboard_snapshots" ("school_name");

CREATE INDEX ON "leaderboard_snapshots" ("snapshot_date");

CREATE INDEX ON "question_reports" ("question_id");

CREATE INDEX ON "question_reports" ("reported_by");

CREATE INDEX ON "question_reports" ("status");

CREATE INDEX ON "question_reports" ("created_at");

CREATE INDEX "idx_table_record" ON "configuration_audit_log" ("table_name", "record_id");

CREATE INDEX ON "configuration_audit_log" ("changed_by");

CREATE INDEX ON "configuration_audit_log" ("changed_at");

COMMENT ON TABLE "users" IS 'Core user authentication and role management';

COMMENT ON COLUMN "users"."role" IS 'student, admin, teacher, parent';

COMMENT ON COLUMN "users"."status" IS 'active, inactive, suspended';

COMMENT ON COLUMN "users"."deleted_at" IS 'Soft delete';

COMMENT ON TABLE "user_profiles" IS 'Student profile with educational details';

COMMENT ON COLUMN "user_profiles"."class_level" IS '1-10';

COMMENT ON COLUMN "user_profiles"."preferences" IS 'UI preferences';

COMMENT ON COLUMN "user_profiles"."metadata" IS 'Extensible fields';

COMMENT ON TABLE "user_sessions" IS 'JWT refresh tokens and session tracking';

COMMENT ON COLUMN "user_sessions"."device_info" IS 'Device, OS, browser';

COMMENT ON TABLE "boards" IS 'Educational boards - Configurable';

COMMENT ON COLUMN "boards"."board_code" IS 'CBSE, ICSE, etc';

COMMENT ON TABLE "exam_categories" IS 'Exam types - Configurable (Olympiad, Board, etc)';

COMMENT ON COLUMN "exam_categories"."category_code" IS 'MATH_OLYMPIAD, CBSE_BOARD';

COMMENT ON TABLE "subjects" IS 'Subjects - Configurable (Math, Science, etc)';

COMMENT ON COLUMN "subjects"."subject_code" IS 'MATH, SCIENCE';

COMMENT ON COLUMN "subjects"."color_hex" IS 'UI theme color';

COMMENT ON TABLE "topics" IS 'Topics/Chapters within subjects - Hierarchical';

COMMENT ON COLUMN "topics"."parent_topic_id" IS 'Hierarchical';

COMMENT ON COLUMN "topics"."class_level" IS 'NULL = all classes';

COMMENT ON TABLE "difficulty_levels" IS 'Difficulty levels - Configurable with point multipliers';

COMMENT ON COLUMN "difficulty_levels"."difficulty_code" IS 'EASY, MEDIUM, HARD';

COMMENT ON COLUMN "difficulty_levels"."color_hex" IS 'UI color';

COMMENT ON TABLE "question_types" IS 'Question types - Metadata-driven validation';

COMMENT ON COLUMN "question_types"."type_code" IS 'MCQ, MSQ, TRUE_FALSE, SUBJECTIVE, NUMERICAL';

COMMENT ON COLUMN "question_types"."validation_rules" IS 'Min/max options, etc';

COMMENT ON COLUMN "question_types"."scoring_rules" IS 'Partial credit, negative marking';

COMMENT ON TABLE "questions" IS 'Core questions table with quality metrics';

COMMENT ON COLUMN "questions"."question_html" IS 'Rich text with formatting';

COMMENT ON COLUMN "questions"."class_level" IS '1-10';

COMMENT ON COLUMN "questions"."correct_answer_data" IS 'For MSQ and complex answers';

COMMENT ON COLUMN "questions"."success_rate" IS 'Computed percentage';

COMMENT ON COLUMN "questions"."status" IS 'draft, active, flagged, retired';

COMMENT ON TABLE "question_options" IS 'Options for MCQ/MSQ/True-False questions';

COMMENT ON COLUMN "question_options"."option_order" IS 'A=1, B=2, C=3, D=4';

COMMENT ON TABLE "question_explanations" IS 'Explanations for questions (mandatory for wrong answers)';

COMMENT ON COLUMN "question_explanations"."explanation_type" IS 'wrong_answer, correct_answer, hint';

COMMENT ON COLUMN "question_explanations"."explanation_images" IS 'Array of image objects';

COMMENT ON COLUMN "question_explanations"."explanation_video_url" IS 'Phase 2';

COMMENT ON COLUMN "question_explanations"."step_by_step" IS 'Step-by-step solution';

COMMENT ON TABLE "tags" IS 'Tags for advanced question filtering';

COMMENT ON COLUMN "tags"."tag_category" IS 'concept, skill, exam_type';

COMMENT ON TABLE "question_tags" IS 'Many-to-many: Questions <-> Tags';

COMMENT ON TABLE "tests" IS 'Test definitions (practice/mock) - pre-configured or auto-generated';

COMMENT ON COLUMN "tests"."test_type" IS 'practice, mock, diagnostic';

COMMENT ON COLUMN "tests"."test_config" IS 'Duration, questions count, randomization rules';

COMMENT ON COLUMN "tests"."access_level" IS 'free, premium, points_required';

COMMENT ON COLUMN "tests"."is_template" IS 'Admin-created template';

COMMENT ON TABLE "test_questions" IS 'Questions in pre-configured tests';

COMMENT ON TABLE "test_attempts" IS 'Student test attempts with results';

COMMENT ON COLUMN "test_attempts"."status" IS 'in_progress, completed, abandoned, auto_submitted';

COMMENT ON COLUMN "test_attempts"."questions_data" IS 'Snapshot of questions';

COMMENT ON COLUMN "test_attempts"."responses_summary" IS 'Quick summary';

COMMENT ON TABLE "test_responses" IS 'Individual question responses in test attempts';

COMMENT ON COLUMN "test_responses"."selected_option_ids" IS 'For MSQ';

COMMENT ON COLUMN "test_responses"."text_answer" IS 'For SUBJECTIVE/NUMERICAL';

COMMENT ON TABLE "subscription_plans" IS 'Pricing matrix: Class x Subject - Configurable';

COMMENT ON COLUMN "subscription_plans"."class_level" IS 'NULL = all classes';

COMMENT ON TABLE "user_subscriptions" IS 'User active subscriptions';

COMMENT ON COLUMN "user_subscriptions"."status" IS 'active, expired, cancelled, pending';

COMMENT ON TABLE "user_subject_access" IS 'Tracks free tier (10 questions, 2 subjects locked) and premium access';

COMMENT ON COLUMN "user_subject_access"."access_type" IS 'free, premium, trial';

COMMENT ON COLUMN "user_subject_access"."expires_at" IS 'NULL = permanent';

COMMENT ON TABLE "payments" IS 'Payment transactions (Razorpay/Stripe)';

COMMENT ON COLUMN "payments"."payment_method" IS 'razorpay, stripe, upi, card';

COMMENT ON COLUMN "payments"."status" IS 'pending, success, failed, refunded';

COMMENT ON TABLE "badges" IS 'Available badges - Configurable criteria';

COMMENT ON COLUMN "badges"."criteria" IS 'Achievement criteria';

COMMENT ON COLUMN "badges"."category" IS 'milestone, streak, accuracy, speed';

COMMENT ON COLUMN "badges"."class_range" IS '[1, 3] for Class 1-3';

COMMENT ON COLUMN "badges"."rarity" IS 'common, rare, epic, legendary';

COMMENT ON TABLE "user_badges" IS 'Badges earned by users';

COMMENT ON COLUMN "user_badges"."metadata" IS 'Context when earned';

COMMENT ON TABLE "points_transactions" IS 'Points earned/redeemed - full audit trail';

COMMENT ON COLUMN "points_transactions"."points" IS 'Positive = earn, Negative = redeem';

COMMENT ON COLUMN "points_transactions"."transaction_type" IS 'correct_answer, streak_bonus, redeem_test';

COMMENT ON COLUMN "points_transactions"."reference_type" IS 'test_attempt, badge, daily_challenge';

COMMENT ON TABLE "leaderboard_snapshots" IS 'Cached leaderboards for performance (never reset)';

COMMENT ON COLUMN "leaderboard_snapshots"."leaderboard_type" IS 'global, class, school';

COMMENT ON COLUMN "leaderboard_snapshots"."period" IS 'all_time, monthly, weekly';

COMMENT ON COLUMN "leaderboard_snapshots"."rankings" IS 'Array of {rank, user_id, points, name}';

COMMENT ON TABLE "question_reports" IS 'User-reported question issues';

COMMENT ON COLUMN "question_reports"."report_type" IS 'incorrect_answer, unclear_question, typo, other';

COMMENT ON COLUMN "question_reports"."status" IS 'pending, reviewed, resolved, dismissed';

COMMENT ON TABLE "configuration_audit_log" IS 'Audit trail for all configuration changes';

COMMENT ON COLUMN "configuration_audit_log"."action" IS 'created, updated, deleted';

COMMENT ON COLUMN "configuration_audit_log"."old_values" IS 'Before change';

COMMENT ON COLUMN "configuration_audit_log"."new_values" IS 'After change';

COMMENT ON COLUMN "configuration_audit_log"."changed_fields" IS 'List of changed fields';

ALTER TABLE "user_profiles" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_profiles" ADD FOREIGN KEY ("board_id") REFERENCES "boards" ("board_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_sessions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "topics" ADD FOREIGN KEY ("subject_id") REFERENCES "subjects" ("subject_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "topics" ADD FOREIGN KEY ("parent_topic_id") REFERENCES "topics" ("topic_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "questions" ADD FOREIGN KEY ("type_id") REFERENCES "question_types" ("type_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "questions" ADD FOREIGN KEY ("difficulty_id") REFERENCES "difficulty_levels" ("difficulty_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "questions" ADD FOREIGN KEY ("subject_id") REFERENCES "subjects" ("subject_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "questions" ADD FOREIGN KEY ("topic_id") REFERENCES "topics" ("topic_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "questions" ADD FOREIGN KEY ("exam_category_id") REFERENCES "exam_categories" ("category_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "questions" ADD FOREIGN KEY ("created_by") REFERENCES "users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "questions" ADD FOREIGN KEY ("updated_by") REFERENCES "users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "question_options" ADD FOREIGN KEY ("question_id") REFERENCES "questions" ("question_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "question_explanations" ADD FOREIGN KEY ("question_id") REFERENCES "questions" ("question_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "question_tags" ADD FOREIGN KEY ("question_id") REFERENCES "questions" ("question_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "question_tags" ADD FOREIGN KEY ("tag_id") REFERENCES "tags" ("tag_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tests" ADD FOREIGN KEY ("subject_id") REFERENCES "subjects" ("subject_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tests" ADD FOREIGN KEY ("exam_category_id") REFERENCES "exam_categories" ("category_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tests" ADD FOREIGN KEY ("created_by") REFERENCES "users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "test_questions" ADD FOREIGN KEY ("test_id") REFERENCES "tests" ("test_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "test_questions" ADD FOREIGN KEY ("question_id") REFERENCES "questions" ("question_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "test_attempts" ADD FOREIGN KEY ("test_id") REFERENCES "tests" ("test_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "test_attempts" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "test_responses" ADD FOREIGN KEY ("attempt_id") REFERENCES "test_attempts" ("attempt_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "test_responses" ADD FOREIGN KEY ("question_id") REFERENCES "questions" ("question_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "test_responses" ADD FOREIGN KEY ("selected_option_id") REFERENCES "question_options" ("option_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "subscription_plans" ADD FOREIGN KEY ("subject_id") REFERENCES "subjects" ("subject_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_subscriptions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_subscriptions" ADD FOREIGN KEY ("plan_id") REFERENCES "subscription_plans" ("plan_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_subscriptions" ADD FOREIGN KEY ("payment_id") REFERENCES "payments" ("payment_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_subject_access" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_subject_access" ADD FOREIGN KEY ("subject_id") REFERENCES "subjects" ("subject_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_subject_access" ADD FOREIGN KEY ("subscription_id") REFERENCES "user_subscriptions" ("subscription_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "payments" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "payments" ADD FOREIGN KEY ("plan_id") REFERENCES "subscription_plans" ("plan_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "payments" ADD FOREIGN KEY ("subscription_id") REFERENCES "user_subscriptions" ("subscription_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_badges" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_badges" ADD FOREIGN KEY ("badge_id") REFERENCES "badges" ("badge_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "points_transactions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "question_reports" ADD FOREIGN KEY ("question_id") REFERENCES "questions" ("question_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "question_reports" ADD FOREIGN KEY ("reported_by") REFERENCES "users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "question_reports" ADD FOREIGN KEY ("resolved_by") REFERENCES "users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "configuration_audit_log" ADD FOREIGN KEY ("changed_by") REFERENCES "users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;
