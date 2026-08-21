ALTER TABLE "work_chapters" ADD COLUMN "status" "work_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "work_chapters" ADD COLUMN "published_at" timestamp DEFAULT null;