CREATE TYPE "public"."work_status" AS ENUM('draft', 'published');--> statement-breakpoint
ALTER TABLE "works" ADD COLUMN "status" "work_status" DEFAULT 'draft' NOT NULL;