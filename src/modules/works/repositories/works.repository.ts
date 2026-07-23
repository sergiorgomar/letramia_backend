import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, or, eq, ne, like, ilike, asc, desc } from 'drizzle-orm';
import { DATABASE_PROVIDER } from '@/common/constants';
import { HandleErrors } from '@/common/decorators/handle-errors.decorator';
import { userEntity } from '@/modules/accounts/entities/user.entity';
import { workEntity } from '../entities/work.entity';
import { workCategoryEntity } from '../entities/work-category.entity';
import { WorkStatus } from '../types/work-status.enum';

export type WorkEntity = typeof workEntity.$inferSelect;
export type CreateWorkEntity = {
  userId: string;
  title: string;
  slug: string;
  workCategoryId: string;
  workTypeId: string;
  synopsis?: string | null;
};
export type UpdateWorkEntity = {
  title: string;
  slug: string;
  workCategoryId: string;
  workTypeId: string;
  synopsis?: string | null;
};
export type UpdateWorkStatusEntity = {
  status: WorkStatus;
};
export type UpdateCoverUrls = {
  coverThumbUrl: string;
  coverSmallUrl: string;
  coverMediumUrl: string;
  coverLargeUrl: string;
  coverUrlExpiresAt: Date;
};

// Catálogo público: la fila ya viene con autor y categoría resueltos, para no
// obligar al frontend a encadenar llamadas por cada libro del listado.
export type PublishedWorkEntity = {
  id: string;
  title: string;
  slug: string;
  synopsis: string | null;
  authorName: string;
  categoryId: string;
  categoryName: string;
  coverThumbUrl: string | null;
  coverSmallUrl: string | null;
  coverMediumUrl: string | null;
  coverLargeUrl: string | null;
  coverUrlExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
export type FindPublishedWorksEntity = {
  categoryId?: string;
  search?: string;
  orderBy: 'recent' | 'alphabetical';
};

const PUBLISHED_WORK_COLUMNS = {
  id: workEntity.id,
  title: workEntity.title,
  slug: workEntity.slug,
  synopsis: workEntity.synopsis,
  authorName: userEntity.name,
  categoryId: workCategoryEntity.id,
  categoryName: workCategoryEntity.name,
  coverThumbUrl: workEntity.coverThumbUrl,
  coverSmallUrl: workEntity.coverSmallUrl,
  coverMediumUrl: workEntity.coverMediumUrl,
  coverLargeUrl: workEntity.coverLargeUrl,
  coverUrlExpiresAt: workEntity.coverUrlExpiresAt,
  createdAt: workEntity.createdAt,
  updatedAt: workEntity.updatedAt,
};

const WORK_COLUMNS = {
  id: workEntity.id,
  userId: workEntity.userId,
  workCategoryId: workEntity.workCategoryId,
  workTypeId: workEntity.workTypeId,
  title: workEntity.title,
  slug: workEntity.slug,
  synopsis: workEntity.synopsis,
  status: workEntity.status,
  coverThumbUrl: workEntity.coverThumbUrl,
  coverSmallUrl: workEntity.coverSmallUrl,
  coverMediumUrl: workEntity.coverMediumUrl,
  coverLargeUrl: workEntity.coverLargeUrl,
  coverUrlExpiresAt: workEntity.coverUrlExpiresAt,
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
  async updateStatus(
    id: string,
    data: UpdateWorkStatusEntity,
  ): Promise<WorkEntity> {
    const [row] = await this.db
      .update(workEntity)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workEntity.id, id))
      .returning();
    return row;
  }

  @HandleErrors('DATABASE_ERROR')
  async updateCoverUrls(
    id: string,
    urls: UpdateCoverUrls,
  ): Promise<WorkEntity> {
    const [row] = await this.db
      .update(workEntity)
      .set({ ...urls, updatedAt: new Date() })
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

  // ── Catálogo público ─────────────────────────────────────────────────
  // Solo obras publicadas. El join con users/categories evita el N+1 de
  // resolver autor y categoría libro por libro.
  @HandleErrors('DATABASE_ERROR')
  async findAllPublished(
    filters: FindPublishedWorksEntity,
  ): Promise<PublishedWorkEntity[]> {
    const conditions = [eq(workEntity.status, WorkStatus.PUBLISHED)];

    if (filters.categoryId) {
      conditions.push(eq(workEntity.workCategoryId, filters.categoryId));
    }

    if (filters.search) {
      // ilike = case-insensitive; busca por título o por nombre del autor.
      const term = `%${filters.search}%`;
      conditions.push(
        or(ilike(workEntity.title, term), ilike(userEntity.name, term))!,
      );
    }

    return this.db
      .select(PUBLISHED_WORK_COLUMNS)
      .from(workEntity)
      .innerJoin(userEntity, eq(userEntity.id, workEntity.userId))
      .innerJoin(
        workCategoryEntity,
        eq(workCategoryEntity.id, workEntity.workCategoryId),
      )
      .where(and(...conditions))
      .orderBy(
        filters.orderBy === 'alphabetical'
          ? asc(workEntity.title)
          : desc(workEntity.createdAt),
      );
  }

  @HandleErrors('DATABASE_ERROR')
  async findPublishedBySlug(
    slug: string,
  ): Promise<PublishedWorkEntity | undefined> {
    const [row] = await this.db
      .select(PUBLISHED_WORK_COLUMNS)
      .from(workEntity)
      .innerJoin(userEntity, eq(userEntity.id, workEntity.userId))
      .innerJoin(
        workCategoryEntity,
        eq(workCategoryEntity.id, workEntity.workCategoryId),
      )
      .where(
        and(
          eq(workEntity.slug, slug),
          eq(workEntity.status, WorkStatus.PUBLISHED),
        ),
      )
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
