import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { workEntity } from './work.entity';

export const workChapterEntity = pgTable('work_chapters', {
  id: uuid('id').primaryKey().defaultRandom(),
  workId: uuid('work_id')
    .notNull()
    .references(() => workEntity.id),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 280 }).notNull(),
  wordCount: integer('word_count').notNull().default(0),
  characterCount: integer('character_count').notNull().default(0),
  sequence: integer('sequence').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
