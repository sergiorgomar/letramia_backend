import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, or, eq, ne, like } from 'drizzle-orm';
import { DATABASE_PROVIDER } from '@/common/constants';
import { HandleErrors } from '@/common/decorators/handle-errors.decorator';
import { workEntity } from '../entities/work.entity';

export type WorkEntity = typeof workEntity.$inferSelect;
export type CreateWorkEntity = {
  userId: string;
  title: string;
  slug: string;
  workCategoryId: string;
  workTypeId: string;
  synopsis?: string | null;
  coverUrl?: string | null;
};
export type UpdateWorkEntity = {
  title: string;
  slug: string;
  workCategoryId: string;
  workTypeId: string;
  synopsis?: string | null;
};

const WORK_COLUMNS = {
  id: workEntity.id,
  userId: workEntity.userId,
  workCategoryId: workEntity.workCategoryId,
  workTypeId: workEntity.workTypeId,
  title: workEntity.title,
  slug: workEntity.slug,
  synopsis: workEntity.synopsis,
  coverUrl: workEntity.coverUrl,
  createdAt: workEntity.createdAt,
  updatedAt: workEntity.updatedAt,
};

@Injectable()
export class WorksRepository {
  constructor(
    @Inject(DATABASE_PROVIDER) private readonly db: PostgresJsDatabase,
  ) {}

  @HandleErrors('DATABASE_ERROR')
  async create(data: CreateWorkEntity): Promise<WorkEntity> {
    const [row] = await this.db.insert(workEntity).values(data).returning();
    return row;
  }

  @HandleErrors('DATABASE_ERROR')
  async update(id: string, data: UpdateWorkEntity): Promise<WorkEntity> {
    const [row] = await this.db
      .update(workEntity)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workEntity.id, id))
      .returning();
    return row;
  }

  @HandleErrors('DATABASE_ERROR')
  async updateCoverUrl(id: string, coverUrl: string): Promise<WorkEntity> {
    const [row] = await this.db
      .update(workEntity)
      .set({ coverUrl, updatedAt: new Date() })
      .where(eq(workEntity.id, id))
      .returning();
    return row;
  }

  @HandleErrors('DATABASE_ERROR')
  async findAllByUserId(userId: string): Promise<WorkEntity[]> {
    return this.db
      .select(WORK_COLUMNS)
      .from(workEntity)
      .where(eq(workEntity.userId, userId));
  }

  // El id ya es PK (lookup O(1) por su índice); el filtro por userId se
  // evalúa sobre esa única fila, no agrega un escaneo extra.
  @HandleErrors('DATABASE_ERROR')
  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<WorkEntity | undefined> {
    const [row] = await this.db
      .select(WORK_COLUMNS)
      .from(workEntity)
      .where(and(eq(workEntity.id, id), eq(workEntity.userId, userId)))
      .limit(1);
    return row;
  }

  // Trae solo los slugs que puedan colisionar con `baseSlug` (el propio y sus
  // variantes con sufijo `-2`, `-3`, ...) para resolver el siguiente sufijo
  // disponible sin traer toda la tabla.
  @HandleErrors('DATABASE_ERROR')
  async findSlugsStartingWith(
    baseSlug: string,
    excludeId?: string,
  ): Promise<string[]> {
    const matchesBase = or(
      eq(workEntity.slug, baseSlug),
      like(workEntity.slug, `${baseSlug}-%`),
    );
    const rows = await this.db
      .select({ slug: workEntity.slug })
      .from(workEntity)
      .where(
        excludeId
          ? and(matchesBase, ne(workEntity.id, excludeId))
          : matchesBase,
      );
    return rows.map((row) => row.slug);
  }
}
