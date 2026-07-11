import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { workCategoryEntity } from './work-category.entity';
import { workTypeEntity } from './work-type.entity';

export const workEntity = pgTable('works', {
  id: uuid('id').primaryKey().defaultRandom(),
  workCategoryId: uuid('work_category_id')
    .notNull()
    .references(() => workCategoryEntity.id),
  workTypeId: uuid('work_type_id')
    .notNull()
    .references(() => workTypeEntity.id),
  title: varchar('title', { length: 255 }).notNull(),
  synopsis: text('synopsis'),
  coverUrl: varchar('cover_url', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
