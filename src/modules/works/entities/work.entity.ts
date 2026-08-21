import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  // index,
} from 'drizzle-orm/pg-core';
import { userEntity } from '@/modules/accounts/entities/user.entity';
import { WorkStatus } from '../types/work-status.enum';
import { workThemeEntity } from './work-theme.entity';
import { workGenreEntity } from './work-genre.entity';

export const workStatusEnum = pgEnum(
  'work_status',
  Object.values(WorkStatus) as [WorkStatus, ...WorkStatus[]],
);

export const workEntity = pgTable(
  'works',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    //🔥 todo: maybe change to author id
    userId: uuid('user_id')
      .notNull()
      .references(() => userEntity.id),
    workThemeId: uuid('work_theme_id')
      .notNull()
      .references(() => workThemeEntity.id),
    workGenreId: uuid('work_genre_id')
      .notNull()
      .references(() => workGenreEntity.id),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 280 }).notNull().unique(),
    synopsis: text('synopsis'),

    wordCount: integer('word_count').notNull().default(0),
    characterCount: integer('character_count').notNull().default(0),

    // Toda obra nace como borrador; solo se ve en la web al publicarla.
    status: workStatusEnum('status').notNull().default(WorkStatus.DRAFT),

    // si la obra tiene problemas que deban ser correjidos
    problems: text('problems').array().default(null),

    // No podemos validar la obra para siempre
    publicationAttemptsRemaining: integer('publication_attempts_remaining')
      .notNull()
      .default(4),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    publishedAt: timestamp('published_at').default(null),
    rejectedAt: timestamp('rejected_at').default(null),
  },
  // 🔥 TODO: reivsar esta implementación, estudiar los indices
  // (table) => ({
  //   createdAtIdx: index('works_created_at_idx').on(table.createdAt),
  // }),
);
// Nota de escalabilidad: la vista principal de este módulo va a ser
// "obras de un usuario, más recientes primero" (paginada). Cuando se cree
// el índice, debería ser compuesto (user_id, created_at desc) — un índice
// simple en user_id solo optimiza el filtro, no el ORDER BY, y con miles de
// obras por usuario Postgres igual tendría que ordenar en memoria.
