ALTER TABLE "work_chapters" ADD COLUMN "problems" text[] DEFAULT null;--> statement-breakpoint
ALTER TABLE "work_chapters" ADD COLUMN "publication_attempts_remaining" integer DEFAULT 4 NOT NULL;