ALTER TABLE "work_chapters" ALTER COLUMN "sequence" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "work_chapters" ADD COLUMN "rejected_at" timestamp DEFAULT null;