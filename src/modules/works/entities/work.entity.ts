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
  coverUrl: varchar('cover_url', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
// Nota de escalabilidad: la vista principal de este módulo va a ser
// "obras de un usuario, más recientes primero" (paginada). Cuando se cree
// el índice, debería ser compuesto (user_id, created_at desc) — un índice
// simple en user_id solo optimiza el filtro, no el ORDER BY, y con miles de
// obras por usuario Postgres igual tendría que ordenar en memoria.
