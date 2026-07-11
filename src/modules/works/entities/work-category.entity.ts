import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const workCategoryEntity = pgTable('work_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
