ALTER TABLE "works" ADD COLUMN "slug" varchar(280) NOT NULL;--> statement-breakpoint
ALTER TABLE "works" ADD CONSTRAINT "works_slug_unique" UNIQUE("slug");