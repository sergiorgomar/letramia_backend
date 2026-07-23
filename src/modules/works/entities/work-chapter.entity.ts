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
  // El slug es único DENTRO de un libro (no global): dos libros distintos
  // pueden tener un capítulo "prologo". La unicidad por libro se resuelve en
  // el servicio agregando sufijo numérico (-2, -3, ...).
  slug: varchar('slug', { length: 280 }).notNull(),
  // Orden del capítulo dentro del libro. Se autoasigna como (max + 1) al crear.
  sequence: integer('sequence').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
// El HTML del capítulo NO se guarda en esta tabla: vive en el bucket bajo una
// ruta determinística derivada del id (works/{workId}/chapters/{id}.html) y se
// lee en tiempo de ejecución.
