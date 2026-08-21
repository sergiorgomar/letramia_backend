import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  text,
} from 'drizzle-orm/pg-core';
import { WorkStatus } from '../types/work-status.enum';
import { workEntity, workStatusEnum } from './work.entity';

export const workChapterEntity = pgTable('work_chapters', {
  id: uuid('id').primaryKey().defaultRandom(),
  workId: uuid('work_id')
    .notNull()
    .references(() => workEntity.id),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 280 }).notNull(),
  wordCount: integer('word_count').notNull().default(0),
  characterCount: integer('character_count').notNull().default(0),
  // Los rechazados salen de la secuencia activa y conservan su evidencia.
  sequence: integer('sequence'),
  // Los capítulos nacen como borrador y se publican de forma independiente.
  status: workStatusEnum('status').notNull().default(WorkStatus.DRAFT),
  problems: text('problems').array().default(null),
  publicationAttemptsRemaining: integer('publication_attempts_remaining')
    .notNull()
    .default(4),
  publishedAt: timestamp('published_at').default(null),
  rejectedAt: timestamp('rejected_at').default(null),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
