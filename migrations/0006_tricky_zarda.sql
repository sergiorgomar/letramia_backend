ALTER TABLE "works" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "works" ALTER COLUMN "status" SET DEFAULT 'draft'::text;--> statement-breakpoint
DROP TYPE "public"."work_status";--> statement-breakpoint
CREATE TYPE "public"."work_status" AS ENUM('draft', 'published', 'requires_review', 'rejected');--> statement-breakpoint
ALTER TABLE "works" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."work_status";--> statement-breakpoint
ALTER TABLE "works" ALTER COLUMN "status" SET DATA TYPE "public"."work_status" USING "status"::"public"."work_status";