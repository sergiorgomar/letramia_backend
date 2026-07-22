import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { or, eq, like } from 'drizzle-orm';
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
  async findAll(): Promise<WorkEntity[]> {
    return this.db
      .select({
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
      })
      .from(workEntity);
  }

  // Trae solo los slugs que puedan colisionar con `baseSlug` (el propio y sus
  // variantes con sufijo `-2`, `-3`, ...) para resolver el siguiente sufijo
  // disponible sin traer toda la tabla.
  @HandleErrors('DATABASE_ERROR')
  async findSlugsStartingWith(baseSlug: string): Promise<string[]> {
    const rows = await this.db
      .select({ slug: workEntity.slug })
      .from(workEntity)
      .where(
        or(
          eq(workEntity.slug, baseSlug),
          like(workEntity.slug, `${baseSlug}-%`),
        ),
      );
    return rows.map((row) => row.slug);
  }
}
