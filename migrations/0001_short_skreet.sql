ALTER TABLE "work_types" DROP CONSTRAINT "work_types_work_category_id_work_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "work_types" DROP COLUMN "work_category_id";