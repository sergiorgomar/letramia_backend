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
    // Una URL por tamaño de variante, para que el caller elija cuál necesita
    // (thumb en listados, large en detalle, etc). Las 4 se generan/suben
    // juntas, así que comparten un único vencimiento de cache.
    coverThumbUrl: varchar('cover_thumb_url', { length: 500 }),
    coverSmallUrl: varchar('cover_small_url', { length: 500 }),
    coverMediumUrl: varchar('cover_medium_url', { length: 500 }),
    coverLargeUrl: varchar('cover_large_url', { length: 500 }),

    //🔥 TODO: GUARDAR MEJOR EL PATH
    // coverThumbPath: varchar('cover_thumb_path', { length: 500 }),
    // coverSmallPath: varchar('cover_small_path', { length: 500 }),
    // coverMediumPath: varchar('cover_medium_path', { length: 500 }),
    // coverLargePath: varchar('cover_large_path', { length: 500 }),
    // Cache de las signed URLs de Supabase: null = nunca se firmaron (o el
    // bucket pasó a ser público, en cuyo caso deja de usarse). Al vencer, se
    // vuelven a firmar de forma perezosa en la próxima lectura.
    coverUrlExpiresAt: timestamp('cover_url_expires_at'),
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
