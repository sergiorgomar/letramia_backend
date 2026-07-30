import { Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, or, eq, ne, like } from 'drizzle-orm';
import { DATABASE_PROVIDER } from '@/common/constants';
import { HandleErrors } from '@/common/decorators/handle-errors.decorator';
import { workEntity } from '../entities/work.entity';
import { workThemeEntity } from '../entities/work-theme.entity';
import { workGenreEntity } from '../entities/work-genre.entity';

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
  title?: string;
  slug?: string;
  workThemeId?: string;
  workGenreId?: string;
  synopsis?: string | null;
};
export class WorksRepository {
  constructor(
    @Inject(DATABASE_PROVIDER) private readonly db: PostgresJsDatabase,
  ) {}

  @HandleErrors('DATABASE_ERROR')
  async findAllByUserId(userId: string) {
    return this.db
      .select({
        id: workEntity.id,
        title: workEntity.title,
        status: workEntity.status,
        coverUrl: workEntity.coverThumbUrl,
      })
      .from(workEntity)
      .where(eq(workEntity.userId, userId));
  }

  @HandleErrors('DATABASE_ERROR')
  async findByIdAndUserId(id: string, userId: string) {
    const [row] = await this.db
      .select({
        id: workEntity.id,
        title: workEntity.title,
        status: workEntity.status,
        coverUrl: workEntity.coverMediumUrl,
      })
      .from(workEntity)
      .where(and(eq(workEntity.id, id), eq(workEntity.userId, userId)))
      .limit(1);
    return row;
  }

  @HandleErrors('DATABASE_ERROR')
  async create(data: CreateWorkEntity) {
    const [row] = await this.db
      .insert(workEntity)
      .values(data)
      .returning({ id: workEntity.id });
    return row;
  }

  @HandleErrors('DATABASE_ERROR')
  async update(id: string, data: UpdateWorkEntity) {
    const [row] = await this.db
      .update(workEntity)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workEntity.id, id))
      .returning({ id: workEntity.id });
    return row;
  }

  @HandleErrors('DATABASE_ERROR')
  //🔥 TODO: estos cambian poco, deberiamos cachear
  async existWorkByIdForUserId(workId: string, userId: string) {
    const [row] = await this.db
      .select({ id: workEntity.id })
      .from(workEntity)
      .where(and(eq(workEntity.id, workId), eq(workEntity.userId, userId)))
      .limit(1);
    return !!row;
  }

  @HandleErrors('DATABASE_ERROR')
  //🔥 TODO: estos cambian poco, deberiamos cachear
  async existThemeById(themeId: string) {
    const [row] = await this.db
      .select({ id: workThemeEntity.id })
      .from(workThemeEntity)
      .where(eq(workThemeEntity.id, themeId))
      .limit(1);
    return !!row;
  }

  @HandleErrors('DATABASE_ERROR')
  //🔥 TODO: estos cambian poco, deberiamos cachear
  async existGenreById(genreId: string) {
    const [row] = await this.db
      .select({ id: workGenreEntity.id })
      .from(workGenreEntity)
      .where(eq(workGenreEntity.id, genreId))
      .limit(1);
    return !!row;
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
