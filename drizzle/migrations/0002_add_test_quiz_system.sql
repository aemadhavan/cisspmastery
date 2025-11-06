-- Migration: Add Test/Quiz System Tables
-- Created: 2025-01-07
-- Description: Adds comprehensive testing and quiz functionality for flashcards

-- Create test type enum
DO $$ BEGIN
 CREATE TYPE "public"."test_type" AS ENUM('flashcard', 'deck', 'random');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create test status enum
DO $$ BEGIN
 CREATE TYPE "public"."test_status" AS ENUM('not_started', 'in_progress', 'completed', 'abandoned');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create test_questions table
CREATE TABLE IF NOT EXISTS "test_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flashcard_id" uuid NOT NULL,
	"question" text NOT NULL,
	"choices" text[] NOT NULL,
	"correct_answers" integer[] NOT NULL,
	"explanation" text,
	"point_value" integer DEFAULT 1 NOT NULL,
	"time_limit" integer,
	"difficulty" integer,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create deck_tests table
CREATE TABLE IF NOT EXISTS "deck_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deck_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"test_type" "test_type" DEFAULT 'deck' NOT NULL,
	"question_count" integer,
	"time_limit" integer,
	"passing_score" integer DEFAULT 70 NOT NULL,
	"shuffle_questions" boolean DEFAULT true,
	"shuffle_choices" boolean DEFAULT true,
	"show_correct_answers" boolean DEFAULT true,
	"allow_retakes" boolean DEFAULT true,
	"max_attempts" integer,
	"is_premium" boolean DEFAULT false,
	"is_published" boolean DEFAULT true,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create test_attempts table
CREATE TABLE IF NOT EXISTS "test_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"deck_test_id" uuid,
	"flashcard_id" uuid,
	"test_type" "test_type" NOT NULL,
	"status" "test_status" DEFAULT 'not_started' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"abandoned_at" timestamp,
	"total_questions" integer NOT NULL,
	"questions_answered" integer DEFAULT 0,
	"correct_answers" integer DEFAULT 0,
	"score" numeric(5, 2),
	"passed" boolean,
	"time_spent" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create test_answers table
CREATE TABLE IF NOT EXISTS "test_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"test_question_id" uuid NOT NULL,
	"selected_answers" integer[] NOT NULL,
	"is_correct" boolean NOT NULL,
	"points_earned" integer DEFAULT 0 NOT NULL,
	"time_spent" integer,
	"marked_for_review" boolean DEFAULT false,
	"answered_at" timestamp DEFAULT now() NOT NULL
);

-- Create test_question_pool table
CREATE TABLE IF NOT EXISTS "test_question_pool" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deck_test_id" uuid NOT NULL,
	"test_question_id" uuid NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "test_questions" ADD CONSTRAINT "test_questions_flashcard_id_flashcards_id_fk" FOREIGN KEY ("flashcard_id") REFERENCES "public"."flashcards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "test_questions" ADD CONSTRAINT "test_questions_created_by_users_clerk_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("clerk_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "deck_tests" ADD CONSTRAINT "deck_tests_deck_id_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "deck_tests" ADD CONSTRAINT "deck_tests_created_by_users_clerk_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("clerk_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_clerk_user_id_users_clerk_user_id_fk" FOREIGN KEY ("clerk_user_id") REFERENCES "public"."users"("clerk_user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_deck_test_id_deck_tests_id_fk" FOREIGN KEY ("deck_test_id") REFERENCES "public"."deck_tests"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_flashcard_id_flashcards_id_fk" FOREIGN KEY ("flashcard_id") REFERENCES "public"."flashcards"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "test_answers" ADD CONSTRAINT "test_answers_attempt_id_test_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."test_attempts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "test_answers" ADD CONSTRAINT "test_answers_test_question_id_test_questions_id_fk" FOREIGN KEY ("test_question_id") REFERENCES "public"."test_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "test_question_pool" ADD CONSTRAINT "test_question_pool_deck_test_id_deck_tests_id_fk" FOREIGN KEY ("deck_test_id") REFERENCES "public"."deck_tests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "test_question_pool" ADD CONSTRAINT "test_question_pool_test_question_id_test_questions_id_fk" FOREIGN KEY ("test_question_id") REFERENCES "public"."test_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_test_questions_flashcard" ON "test_questions" USING btree ("flashcard_id");
CREATE INDEX IF NOT EXISTS "idx_test_questions_active" ON "test_questions" USING btree ("is_active");
CREATE INDEX IF NOT EXISTS "idx_deck_tests_deck_published" ON "deck_tests" USING btree ("deck_id","is_published");
CREATE INDEX IF NOT EXISTS "idx_test_attempts_user_test" ON "test_attempts" USING btree ("clerk_user_id","deck_test_id");
CREATE INDEX IF NOT EXISTS "idx_test_attempts_user_status" ON "test_attempts" USING btree ("clerk_user_id","status");
CREATE INDEX IF NOT EXISTS "idx_test_attempts_started" ON "test_attempts" USING btree ("started_at");
CREATE INDEX IF NOT EXISTS "idx_test_answers_attempt" ON "test_answers" USING btree ("attempt_id");
CREATE INDEX IF NOT EXISTS "idx_test_answers_question" ON "test_answers" USING btree ("test_question_id");
CREATE INDEX IF NOT EXISTS "idx_test_pool_deck_test" ON "test_question_pool" USING btree ("deck_test_id");
CREATE INDEX IF NOT EXISTS "idx_test_pool_question" ON "test_question_pool" USING btree ("test_question_id");
