import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { workCategoryEntity } from './work-category.entity';

export const workTypeEntity = pgTable('work_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  workCategoryId: uuid('work_category_id')
    .notNull()
    .references(() => workCategoryEntity.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
