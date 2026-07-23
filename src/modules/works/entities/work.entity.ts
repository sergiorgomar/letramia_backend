import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { userEntity } from '@/modules/accounts/entities/user.entity';
import { workCategoryEntity } from './work-category.entity';
import { workTypeEntity } from './work-type.entity';

export const workEntity = pgTable('works', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => userEntity.id),
  workCategoryId: uuid('work_category_id')
    .notNull()
    .references(() => workCategoryEntity.id),
  workTypeId: uuid('work_type_id')
    .notNull()
    .references(() => workTypeEntity.id),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 280 }).notNull().unique(),
  synopsis: text('synopsis'),
  // Una URL por tamaño de variante, para que el caller elija cuál necesita
  // (thumb en listados, large en detalle, etc). Las 4 se generan/suben
  // juntas, así que comparten un único vencimiento de cache.
  coverThumbUrl: varchar('cover_thumb_url', { length: 500 }),
  coverSmallUrl: varchar('cover_small_url', { length: 500 }),
  coverMediumUrl: varchar('cover_medium_url', { length: 500 }),
  coverLargeUrl: varchar('cover_large_url', { length: 500 }),
  // Cache de las signed URLs de Supabase: null = nunca se firmaron (o el
  // bucket pasó a ser público, en cuyo caso deja de usarse). Al vencer, se
  // vuelven a firmar de forma perezosa en la próxima lectura.
  coverUrlExpiresAt: timestamp('cover_url_expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
// Nota de escalabilidad: la vista principal de este módulo va a ser
// "obras de un usuario, más recientes primero" (paginada). Cuando se cree
// el índice, debería ser compuesto (user_id, created_at desc) — un índice
// simple en user_id solo optimiza el filtro, no el ORDER BY, y con miles de
// obras por usuario Postgres igual tendría que ordenar en memoria.
