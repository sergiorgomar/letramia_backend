import { Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, or, eq, ne, like, desc, asc, sql } from 'drizzle-orm';
import { DATABASE_PROVIDER } from '@/common/constants';
import { HandleErrors } from '@/common/decorators/handle-errors.decorator';
import { workEntity } from '../entities/work.entity';
import { workThemeEntity } from '../entities/work-theme.entity';
import { workGenreEntity } from '../entities/work-genre.entity';
import { ConfigService } from '@nestjs/config';
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

        genreName: workGenreEntity.name,
        themeName: workThemeEntity.name,
      })
      .from(workEntity)
      .leftJoin(workGenreEntity, eq(workEntity.workGenreId, workGenreEntity.id))
      .leftJoin(workThemeEntity, eq(workEntity.workThemeId, workThemeEntity.id))
      .where(eq(workEntity.userId, userId))
      .orderBy(desc(workEntity.createdAt));

    return works.map((work) => ({
      ...work,
      // 🔥 TODO: mini_thumb.webp -- magic string
      coverUrl: `${this.PUBLIC_BUCKET_URL}/works/${work.id}/cover/mini_thumb.webp`,
    }));
  }

  @HandleErrors('WORKS_REPOSITORY_FIND_BY_ID_AND_USER_ID_ERROR')
  async findByIdAndUserId(id: string, userId: string) {
    const rows = await this.db
      .select({
        id: workEntity.id,
        title: workEntity.title,
        status: workEntity.status,
        synopsis: workEntity.synopsis,
        updatedAt: workEntity.updatedAt,
        publishedAt: workEntity.publishedAt,
        attemptsToPublish: workEntity.publicationAttemptsRemaining,
        problems: workEntity.problems,

        // updatedAt: workEntity.p,
        genreName: workGenreEntity.name,
        themeName: workThemeEntity.name,
        themeSlug: workThemeEntity.slug,

        requiresSynopsis: workGenreEntity.requiresSynopsis,
        supportsChapters: workGenreEntity.supportsChapters,
        chapterId: workChapterEntity.id,
        chapterTitle: workChapterEntity.title,
        chapterStatus: workChapterEntity.status,
        chapterPublishedAt: workChapterEntity.publishedAt,
        chapterProblems: workChapterEntity.problems,
        chapterAttemptsToPublish:
          workChapterEntity.publicationAttemptsRemaining,
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
      publishedAt: work.publishedAt,
      genreName: work.genreName,
      themeName: work.themeName,
      workThemeSlug: work.themeSlug,
      requiresSynopsis: work.requiresSynopsis,
      supportsChapters: work.supportsChapters,
      attemptsToPublish: work.attemptsToPublish,
      problems: work.problems ?? [],
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
            status: row.chapterStatus,
            publishedAt: row.chapterPublishedAt,
            problems: row.chapterProblems ?? [],
            attemptsToPublish: row.chapterAttemptsToPublish,
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

  @HandleErrors('WORKS_REPOSITORY_FIND_STATUS_BY_ID_AND_USER_ID_ERROR')
  async findStatusByIdAndUserId(workId: string, userId: string) {
    const [work] = await this.db
      .select({ status: workEntity.status })
      .from(workEntity)
      .where(and(eq(workEntity.id, workId), eq(workEntity.userId, userId)))
      .limit(1);

    return work;
  }

  @HandleErrors('WORKS_REPOSITORY_FIND_THEME_ID_BY_SLUG_ERROR')
  async findThemeIdBySlug(workThemeSlug: string) {
    const [theme] = await this.db
      .select({ id: workThemeEntity.id })
      .from(workThemeEntity)
      .where(eq(workThemeEntity.slug, workThemeSlug))
      .limit(1);

    return theme;
  }

  @HandleErrors('WORKS_REPOSITORY_UPDATE_DETAILS_BY_ID_AND_USER_ID_ERROR')
  async updateDetailsByIdAndUserId(
    workId: string,
    userId: string,
    title: string,
    slug: string,
    synopsis: string | null | undefined,
    workThemeId: string,
  ) {
    const [work] = await this.db
      .update(workEntity)
      .set({
        title,
        slug,
        ...(synopsis === undefined ? {} : { synopsis }),
        workThemeId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(workEntity.id, workId),
          eq(workEntity.userId, userId),
          eq(workEntity.status, WorkStatus.DRAFT),
        ),
      )
      .returning({ id: workEntity.id });

    return work;
  }

  @HandleErrors('WORKS_REPOSITORY_FIND_DATA_FOR_PUBLISH')
  async findDataForPublish(workId: string, userId: string) {
    const [work] = await this.db
      .select({
        status: workEntity.status,
        publicationAttemptsRemaining: workEntity.publicationAttemptsRemaining,
        genreSlug: workGenreEntity.slug,
      })
      .from(workEntity)
      .innerJoin(
        workGenreEntity,
        eq(workGenreEntity.id, workEntity.workGenreId),
      )
      .where(and(eq(workEntity.id, workId), eq(workEntity.userId, userId)))
      .limit(1);

    return work;
  }

  @HandleErrors('WORKS_REPOSITORY_FIND_DATA_FOR_PUBLISH')
  async markWorkAsRequiresReview(
    workId: string,
    userId: string,
    problems: Array<string>,
  ) {
    const [work] = await this.db
      .update(workEntity)
      .set({
        status: WorkStatus.REQUIRES_REVIEW,
        problems: problems,
        publicationAttemptsRemaining: sql`${workEntity.publicationAttemptsRemaining} - 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(workEntity.id, workId), eq(workEntity.userId, userId)))
      .returning({
        id: workEntity.id,
        status: workEntity.status,
      });

    return work;
  }

  @HandleErrors('DATABASE_ERROR')
  async markWorkAsRejected(
    workId: string,
    userId: string,
    problems: Array<string>,
  ) {
    const [work] = await this.db
      .update(workEntity)
      .set({
        status: WorkStatus.REJECTED,
        problems: problems,
        publicationAttemptsRemaining: 0,
        updatedAt: new Date(),
      })
      .where(and(eq(workEntity.id, workId), eq(workEntity.userId, userId)))
      .returning({
        id: workEntity.id,
        status: workEntity.status,
      });

    return work;
  }

  @HandleErrors('DATABASE_ERROR')
  async markWorkAsPublished(workId: string, userId: string) {
    const [work] = await this.db
      .update(workEntity)
      .set({
        status: WorkStatus.PUBLISHED,
        problems: null,
        publicationAttemptsRemaining: 3,
        updatedAt: new Date(),
        publishedAt: new Date(),
      })
      .where(and(eq(workEntity.id, workId), eq(workEntity.userId, userId)))
      .returning({
        id: workEntity.id,
        status: workEntity.status,
      });

    return work;
  }
}
