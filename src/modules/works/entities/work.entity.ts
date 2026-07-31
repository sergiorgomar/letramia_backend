import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  timestamp,
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
    // Toda obra nace como borrador; solo se ve en la web al publicarla.
    status: workStatusEnum('status').notNull().default(WorkStatus.DRAFT),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
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
