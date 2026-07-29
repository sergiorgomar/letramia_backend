import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, or, eq, ne, like, ilike, asc, desc } from 'drizzle-orm';
import { DATABASE_PROVIDER } from '@/common/constants';
import { HandleErrors } from '@/common/decorators/handle-errors.decorator';
import { userEntity } from '@/modules/accounts/entities/user.entity';
import { workEntity } from '../entities/work.entity';
import { workThemeEntity } from '../entities/work-theme.entity';
import { workGenreEntity } from '../entities/work-genre.entity';
import { workChapterEntity } from '../entities/work-chapter.entity';
import { WorkStatus } from '../types/work-status.enum';

export type WorkEntity = typeof workEntity.$inferSelect;
export type CreateWorkEntity = {
  userId: string;
  title: string;
  slug: string;
  workThemeId: string;
  workGenreId: string;
  synopsis?: string | null;
};
export type UpdateWorkEntity = {
  title: string;
  slug: string;
  workThemeId: string;
  workGenreId: string;
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
};

// Catálogo público: la fila ya viene con autor y categoría resueltos, para no
// obligar al frontend a encadenar llamadas por cada libro del listado.
export type PublishedWorkEntity = {
  id: string;
  title: string;
  slug: string;
  synopsis: string | null;
  authorName: string;
  themeId: string;
  themeName: string;
  genreId: string;
  genreName: string;
  coverThumbUrl: string | null;
  coverSmallUrl: string | null;
  coverMediumUrl: string | null;
  coverLargeUrl: string | null;
  coverUrlExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
export type FindPublishedWorksEntity = {
  themeId?: string;
  genreId?: string;
  search?: string;
  orderBy: 'recent' | 'alphabetical';
};
export type SitemapWorkEntity = { slug: string; updatedAt: Date };
export type SitemapChapterEntity = {
  workSlug: string;
  chapterSlug: string;
  updatedAt: Date;
};

const PUBLISHED_WORK_COLUMNS = {
  id: workEntity.id,
  title: workEntity.title,
  slug: workEntity.slug,
  synopsis: workEntity.synopsis,
  authorName: userEntity.name,
  themeId: workThemeEntity.id,
  themeName: workThemeEntity.name,
  genreId: workGenreEntity.id,
  genreName: workGenreEntity.name,
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
  workThemeId: workEntity.workThemeId,
  workGenreId: workEntity.workGenreId,
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
      //🔥 TODO: Dates validations UTC-6 or timestamp
      .set({ ...urls, updatedAt: new Date() })
      .where(eq(workEntity.id, id))
      .returning();
    return row;
  }

  // El libro y sus capítulos son una única unidad al eliminarse. La
  // transacción evita dejar capítulos huérfanos si falla el segundo delete.
  @HandleErrors('DATABASE_ERROR')
  async deleteWithChapters(id: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .delete(workChapterEntity)
        .where(eq(workChapterEntity.workId, id));
      await tx.delete(workEntity).where(eq(workEntity.id, id));
    });
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

    if (filters.themeId) {
      conditions.push(eq(workEntity.workThemeId, filters.themeId));
    }
    if (filters.genreId) conditions.push(eq(workEntity.workGenreId, filters.genreId));

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
        workThemeEntity,
        eq(workThemeEntity.id, workEntity.workThemeId),
      )
      .innerJoin(workGenreEntity, eq(workGenreEntity.id, workEntity.workGenreId))
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
        workThemeEntity,
        eq(workThemeEntity.id, workEntity.workThemeId),
      )
      .innerJoin(workGenreEntity, eq(workGenreEntity.id, workEntity.workGenreId))
      .where(
        and(
          eq(workEntity.slug, slug),
          eq(workEntity.status, WorkStatus.PUBLISHED),
        ),
      )
      .limit(1);
    return row;
  }

  @HandleErrors('DATABASE_ERROR')
  async findSitemapWorks(): Promise<SitemapWorkEntity[]> {
    return this.db
      .select({ slug: workEntity.slug, updatedAt: workEntity.updatedAt })
      .from(workEntity)
      .where(eq(workEntity.status, WorkStatus.PUBLISHED));
  }

  @HandleErrors('DATABASE_ERROR')
  async findSitemapChapters(): Promise<SitemapChapterEntity[]> {
    return this.db
      .select({
        workSlug: workEntity.slug,
        chapterSlug: workChapterEntity.slug,
        updatedAt: workChapterEntity.updatedAt,
      })
      .from(workChapterEntity)
      .innerJoin(workEntity, eq(workEntity.id, workChapterEntity.workId))
      .innerJoin(
        workGenreEntity,
        eq(workGenreEntity.id, workEntity.workGenreId),
      )
      .where(
        and(
          eq(workEntity.status, WorkStatus.PUBLISHED),
          ne(workGenreEntity.name, 'Poema'),
        ),
      );
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
