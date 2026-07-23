ALTER TABLE "works" ADD COLUMN "cover_thumb_url" varchar(500);--> statement-breakpoint
ALTER TABLE "works" ADD COLUMN "cover_small_url" varchar(500);--> statement-breakpoint
ALTER TABLE "works" ADD COLUMN "cover_medium_url" varchar(500);--> statement-breakpoint
ALTER TABLE "works" ADD COLUMN "cover_large_url" varchar(500);--> statement-breakpoint
ALTER TABLE "works" ADD COLUMN "cover_url_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "works" DROP COLUMN "cover_url";