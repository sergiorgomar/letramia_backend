import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const workGenreEntity = pgTable('work_genres', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
