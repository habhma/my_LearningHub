-- CreateTable: questions_draft (mirrors questions table structure)
CREATE TABLE "questions_draft" (
    "question_id" BIGSERIAL NOT NULL,
    "batch_id" VARCHAR(50),
    "source_file" VARCHAR(500),
    "question_text" TEXT NOT NULL,
    "question_html" TEXT,
    "question_image_url" VARCHAR(500),
    "type_id" INTEGER NOT NULL,
    "difficulty_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "topic_id" INTEGER,
    "class_level" INTEGER NOT NULL,
    "exam_category_id" INTEGER NOT NULL,
    "correct_answer" TEXT,
    "correct_answer_data" JSONB,
    "time_limit_seconds" INTEGER NOT NULL DEFAULT 180,
    "marks" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "negative_marks" DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "reviewed_by" BIGINT,
    "reviewed_at" TIMESTAMP(3),
    "approval_notes" TEXT,
    "created_by" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_draft_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable: question_options_draft
CREATE TABLE "question_options_draft" (
    "option_id" BIGSERIAL NOT NULL,
    "question_draft_id" BIGINT NOT NULL,
    "option_text" TEXT NOT NULL,
    "option_html" TEXT,
    "option_image_url" VARCHAR(500),
    "option_order" INTEGER NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_options_draft_pkey" PRIMARY KEY ("option_id")
);

-- CreateTable: question_explanations_draft
CREATE TABLE "question_explanations_draft" (
    "explanation_id" BIGSERIAL NOT NULL,
    "question_draft_id" BIGINT NOT NULL,
    "explanation_type" VARCHAR(50) NOT NULL DEFAULT 'CORRECT_ANSWER',
    "explanation_text" TEXT NOT NULL,
    "explanation_html" TEXT,
    "explanation_images" JSONB NOT NULL DEFAULT '[]',
    "explanation_video_url" VARCHAR(500),
    "display_order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_explanations_draft_pkey" PRIMARY KEY ("explanation_id")
);

-- CreateIndex
CREATE INDEX "questions_draft_batch_id_idx" ON "questions_draft"("batch_id");
CREATE INDEX "questions_draft_subject_id_idx" ON "questions_draft"("subject_id");
CREATE INDEX "questions_draft_class_level_idx" ON "questions_draft"("class_level");
CREATE INDEX "questions_draft_is_approved_idx" ON "questions_draft"("is_approved");
CREATE INDEX "questions_draft_created_at_idx" ON "questions_draft"("created_at");

CREATE INDEX "question_options_draft_question_draft_id_idx" ON "question_options_draft"("question_draft_id");
CREATE UNIQUE INDEX "question_options_draft_question_draft_id_option_order_key" ON "question_options_draft"("question_draft_id", "option_order");

CREATE INDEX "question_explanations_draft_question_draft_id_idx" ON "question_explanations_draft"("question_draft_id");

-- AddForeignKey
ALTER TABLE "question_options_draft" ADD CONSTRAINT "question_options_draft_question_draft_id_fkey" FOREIGN KEY ("question_draft_id") REFERENCES "questions_draft"("question_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "question_explanations_draft" ADD CONSTRAINT "question_explanations_draft_question_draft_id_fkey" FOREIGN KEY ("question_draft_id") REFERENCES "questions_draft"("question_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign keys for references (optional - can be removed if you want loose coupling)
ALTER TABLE "questions_draft" ADD CONSTRAINT "questions_draft_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "question_types"("type_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "questions_draft" ADD CONSTRAINT "questions_draft_difficulty_id_fkey" FOREIGN KEY ("difficulty_id") REFERENCES "difficulty_levels"("difficulty_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "questions_draft" ADD CONSTRAINT "questions_draft_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("subject_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "questions_draft" ADD CONSTRAINT "questions_draft_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("topic_id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "questions_draft" ADD CONSTRAINT "questions_draft_exam_category_id_fkey" FOREIGN KEY ("exam_category_id") REFERENCES "exam_categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "questions_draft" ADD CONSTRAINT "questions_draft_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "questions_draft" ADD CONSTRAINT "questions_draft_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
