import { Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, or, eq, ne, like, desc, asc } from 'drizzle-orm';
import { DATABASE_PROVIDER } from '@/common/constants';
import { HandleErrors } from '@/common/decorators/handle-errors.decorator';
import { workEntity } from '../entities/work.entity';
import { workThemeEntity } from '../entities/work-theme.entity';
import { workGenreEntity } from '../entities/work-genre.entity';
import { ConfigService } from '@nestjs/config';
import { workChapterEntity } from '../entities/work-chapter.entity';

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
  private PUBLIC_BUCKET_URL = '';
  constructor(
    @Inject(DATABASE_PROVIDER) private readonly db: PostgresJsDatabase,
    private readonly config: ConfigService,
  ) {
    this.PUBLIC_BUCKET_URL =
      this.config.getOrThrow<string>('PUBLIC_BUCKET_URL');
  }

  @HandleErrors('WORKS_REPOSITORY_FIND_ALL_BY_USER_ID_ERROR')
  async findAllByUserId(userId: string) {
    // throw new Error("Epa")
    const works = await this.db
      .select({
        id: workEntity.id,
        title: workEntity.title,
        status: workEntity.status,
      })
      .from(workEntity)
      .where(eq(workEntity.userId, userId))
      .orderBy(desc(workEntity.createdAt));

    return works.map((work) => ({
      ...work,
      // 🔥 TODO: mini_thumb.webp -- magic string
      coverUrl: `${this.PUBLIC_BUCKET_URL}/works/${work.id}/cover/mini_thumb.webp`,
    }));
  }

  //🔥 todo, np entiendo esta consulta
  @HandleErrors('WORKS_REPOSITORY_FIND_BY_ID_AND_USER_ID_ERROR')
  async findByIdAndUserId(id: string, userId: string) {
    const rows = await this.db
      .select({
        id: workEntity.id,
        title: workEntity.title,
        status: workEntity.status,
        synopsis: workEntity.synopsis,
        updatedAt: workEntity.updatedAt,
        // updatedAt: workEntity.p,
        genreName: workGenreEntity.name,
        themeName: workThemeEntity.name,

        supportsChapters: workGenreEntity.supportsChapters,
        chapterId: workChapterEntity.id,
        chapterTitle: workChapterEntity.title,
        chapterWordCount: workChapterEntity.wordCount,
        chapterCharacterCount: workChapterEntity.characterCount,
      })
      .from(workEntity)
      .innerJoin(
        workGenreEntity,
        eq(workEntity.workGenreId, workGenreEntity.id),
      )
      .innerJoin(
        workThemeEntity,
        eq(workEntity.workThemeId, workThemeEntity.id),
      )
      .leftJoin(workChapterEntity, eq(workChapterEntity.workId, workEntity.id))
      .where(and(eq(workEntity.id, id), eq(workEntity.userId, userId)))
      .orderBy(asc(workChapterEntity.sequence));

    const work = rows[0];
    if (!work) return undefined;

    return {
      id: work.id,
      title: work.title,
      status: work.status,
      synopsis: work.synopsis,
      updatedAt: work.updatedAt,
      genreName: work.genreName,
      themeName: work.themeName,
      supportsChapters: work.supportsChapters,
      // 🔥 TODO: thumb.wepb -- magic string
      coverUrl: `${this.PUBLIC_BUCKET_URL}/works/${work.id}/cover/thumb.webp`,
      chapters: rows.flatMap((row) => {
        if (
          row.chapterId === null ||
          row.chapterTitle === null ||
          row.chapterWordCount === null ||
          row.chapterCharacterCount === null
        ) {
          return [];
        }
        return [
          {
            id: row.chapterId,
            title: row.chapterTitle,
            wordCount: row.chapterWordCount,
            characterCount: row.chapterCharacterCount,
          },
        ];
      }),
    };
  }

  @HandleErrors('WORKS_REPOSITORY_CREATE_ERROR')
  async create(data: CreateWorkEntity) {
    const [row] = await this.db
      .insert(workEntity)
      .values(data)
      .returning({ id: workEntity.id });
    return row;
  }

  @HandleErrors('WORKS_REPOSITORY_UPDATE_ERROR')
  async update(id: string, data: UpdateWorkEntity) {
    const [row] = await this.db
      .update(workEntity)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workEntity.id, id))
      .returning({ id: workEntity.id });
    return row;
  }

  @HandleErrors('WORKS_REPOSITORY_EXIST_WORK_BY_ID_FOR_USER_ID_ERROR')
  //🔥 TODO: estos cambian poco, deberiamos cachear
  async existWorkByIdForUserId(workId: string, userId: string) {
    const [row] = await this.db
      .select({ id: workEntity.id })
      .from(workEntity)
      .where(and(eq(workEntity.id, workId), eq(workEntity.userId, userId)))
      .limit(1);
    return !!row;
  }

  @HandleErrors('WORKS_REPOSITORY_EXIST_THEME_BY_SLUG_ERROR')
  //🔥 TODO: estos cambian poco, deberiamos cachear
  async existThemeBySlug(themeSlug: string) {
    const [row] = await this.db
      .select({ id: workThemeEntity.id })
      .from(workThemeEntity)
      .where(eq(workThemeEntity.slug, themeSlug))
      .limit(1);
    return !!row;
  }

  @HandleErrors('WORKS_REPOSITORY_EXIST_GENRE_BY_SLUG_ERROR')
  //🔥 TODO: estos cambian poco, deberiamos cachear
  async existGenreBySlug(genreSlug: string) {
    const [row] = await this.db
      .select({ id: workGenreEntity.id })
      .from(workGenreEntity)
      .where(eq(workGenreEntity.slug, genreSlug))
      .limit(1);
    return !!row;
  }

  @HandleErrors('WORKS_REPOSITORY_FIND_THEME_AND_GENRE_IDS_BY_SLUG_ERROR')
  //🔥 TODO: estos cambian poco, deberiamos cachear
  async findThemeAndGenreIdsBySlug(themeSlug: string, genreSlug: string) {
    const [themeRow] = await this.db
      .select({ id: workThemeEntity.id })
      .from(workThemeEntity)
      .where(eq(workThemeEntity.slug, themeSlug))
      .limit(1);
    const [genreRow] = await this.db
      .select({ id: workGenreEntity.id })
      .from(workGenreEntity)
      .where(eq(workGenreEntity.slug, genreSlug))
      .limit(1);
    return { themeId: themeRow?.id, genreId: genreRow?.id };
  }

  // Trae solo los slugs que puedan colisionar con `baseSlug` (el propio y sus
  // variantes con sufijo `-2`, `-3`, ...) para resolver el siguiente sufijo
  // disponible sin traer toda la tabla.
  @HandleErrors('WORKS_REPOSITORY_FIND_SLUGS_STARTING_WITH_ERROR')
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
