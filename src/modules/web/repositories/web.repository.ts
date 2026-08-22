import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { type SQL, desc, and, eq, or, ilike, asc, ne, sql } from 'drizzle-orm';
import { DATABASE_PROVIDER } from '@/common/constants';
import { HandleErrors } from '@/common/decorators/handle-errors.decorator';

import { userEntity } from '@/modules/accounts/entities/user.entity';
import { workEntity } from '@/modules/works/entities/work.entity';
import { workThemeEntity } from '@/modules/works/entities/work-theme.entity';
import { workGenreEntity } from '@/modules/works/entities/work-genre.entity';
import { WorkStatus } from '@/modules/works/types/work-status.enum';
import { workChapterEntity } from '@/modules/works/entities/work-chapter.entity';
import { PublishedWorkSort } from '@/modules/works/types/published-work-sort.enum';

@Injectable()
export class WebRepository {
  private PUBLIC_BUCKET_URL = '';

  constructor(
    @Inject(DATABASE_PROVIDER) private readonly db: PostgresJsDatabase,
    private readonly config: ConfigService,
  ) {
    this.PUBLIC_BUCKET_URL =
      this.config.getOrThrow<string>('PUBLIC_BUCKET_URL');
  }

  //🔥 todo: NO ME GUSYA ESTO AQUI, REVISAR
  private getCoverUrl(
    workId: string,
    variant: 'thumb' | 'small',
    coverUpdatedAt: Date,
  ): string {
    return `${this.PUBLIC_BUCKET_URL}/works/${workId}/cover/${variant}.webp?v=${coverUpdatedAt.getTime()}`;
  }

  @HandleErrors('DATABASE_ERROR')
  // 🔥 TODO: eliminar este query cuando se retire sponsorBanner del contrato de /web/page-data.
  async getSponsorBannerData() {
    const works = await this.db
      .select({
        id: workEntity.id,
        coverUpdatedAt: workEntity.coverUpdatedAt,
        workSlug: workEntity.slug,
        title: workEntity.title,
        publishedAt: workEntity.updatedAt, //🔥 TODO: works needs published at date
        synopsis: workEntity.synopsis,
        authorName: userEntity.name,
        themeName: workThemeEntity.name,
        genreName: workGenreEntity.name,
      })
      .from(workEntity)
      .innerJoin(userEntity, eq(workEntity.userId, userEntity.id))
      .innerJoin(
        workThemeEntity,
        eq(workEntity.workThemeId, workThemeEntity.id),
      )
      .innerJoin(
        workGenreEntity,
        and(
          eq(workEntity.workGenreId, workGenreEntity.id),
          ne(workGenreEntity.slug, 'poema'),
        ),
      )
      .where(eq(workEntity.status, WorkStatus.PUBLISHED))
      .orderBy(desc(workEntity.createdAt))
      .limit(5);

    return works.map((w) => ({
      slug: w.workSlug,
      title: w.title,
      publishedAt: w.publishedAt,
      authorName: w.authorName,
      synopsis: w.synopsis,
      genreName: w.genreName,
      themeName: w.themeName,
      // 🔥 TODO: thumb.wepb -- magic string
      imageUrl: this.getCoverUrl(w.id, 'thumb', w.coverUpdatedAt),
    }));
  }

  @HandleErrors('DATABASE_ERROR')
  async getThemes() {
    return await this.db
      .select({
        slug: workThemeEntity.slug,
        name: workThemeEntity.name,
      })
      .from(workThemeEntity);
  }

  @HandleErrors('DATABASE_ERROR')
  async getGenres() {
    return await this.db
      .select({
        slug: workGenreEntity.slug,
        name: workGenreEntity.name,
      })
      .from(workGenreEntity);
  }

  //🔥 todo: IMRPVOE, esto no escala, me va tirar la db
  @HandleErrors('DATABASE_ERROR')
  async findSitemapRows() {
    return this.db
      .select({
        workSlug: workEntity.slug,
        chapterSlug: workChapterEntity.slug,
        themeSlug: workThemeEntity.slug,
        themeName: workThemeEntity.name,
        genreSlug: workGenreEntity.slug,
        genreName: workGenreEntity.name,
      })
      .from(workEntity)
      .innerJoin(
        workThemeEntity,
        eq(workThemeEntity.id, workEntity.workThemeId),
      )
      .innerJoin(
        workGenreEntity,
        eq(workGenreEntity.id, workEntity.workGenreId),
      )
      .leftJoin(
        workChapterEntity,
        and(
          eq(workChapterEntity.workId, workEntity.id),
          eq(workChapterEntity.status, WorkStatus.PUBLISHED),
        ),
      )
      .where(eq(workEntity.status, WorkStatus.PUBLISHED));
  }

  @HandleErrors('DATABASE_ERROR')
  async getLastWorks() {
    const lastWorks = await this.db
      .select({
        id: workEntity.id,
        coverUpdatedAt: workEntity.coverUpdatedAt,
        workSlug: workEntity.slug,
        synopsis: workEntity.synopsis,
        title: workEntity.title,
        authorName: userEntity.name,
        genreName: workGenreEntity.name,
        themeName: workThemeEntity.name,
        publishedAt: workEntity.createdAt, //🔥 TODO: publisued at
      })
      .from(workEntity)
      .where(eq(workEntity.status, WorkStatus.PUBLISHED))
      .innerJoin(
        workGenreEntity,
        and(
          eq(workEntity.workGenreId, workGenreEntity.id),
          ne(workGenreEntity.slug, 'poema'),
        ),
      )
      .innerJoin(
        workThemeEntity,
        eq(workEntity.workThemeId, workThemeEntity.id),
      )
      .innerJoin(userEntity, eq(workEntity.userId, userEntity.id))
      .orderBy(desc(workEntity.createdAt))
      .limit(6);

    return lastWorks.map((w) => ({
      slug: w.workSlug,
      title: w.title,
      synopsis: w.synopsis,
      // 🔥 TODO: thumb.wepb -- magic string
      coverUrl: this.getCoverUrl(w.id, 'thumb', w.coverUpdatedAt),
      genreName: w.genreName,
      themeName: w.themeName,
      authorName: w.authorName,
      publishedAt: w.publishedAt,
    }));
  }

  @HandleErrors('DATABASE_ERROR')
  async findPublishedWork(slug: string) {
    const [work] = await this.db
      .select({
        id: workEntity.id,
        coverUpdatedAt: workEntity.coverUpdatedAt,
        title: workEntity.title,
        synopsis: workEntity.synopsis,
        //🔥 TODO: date of published is requiered
        publishedAt: workEntity.updatedAt,
        themeName: workThemeEntity.name,
        themeSlug: workThemeEntity.slug,
        genreName: workGenreEntity.name,
        genreSlug: workGenreEntity.slug,
        supportsChapters: workGenreEntity.supportsChapters,
        authorName: userEntity.name,
      })
      .from(workEntity)
      .innerJoin(
        workThemeEntity,
        eq(workThemeEntity.id, workEntity.workThemeId),
      )
      .innerJoin(
        workGenreEntity,
        eq(workGenreEntity.id, workEntity.workGenreId),
      )
      .innerJoin(userEntity, eq(userEntity.id, workEntity.userId))
      .where(
        and(
          eq(workEntity.slug, slug),
          eq(workEntity.status, WorkStatus.PUBLISHED),
        ),
      )
      .limit(1);

    if (!work) return null;

    const chapters = await this.db
      .select({
        slug: workChapterEntity.slug,
        title: workChapterEntity.title,
      })
      .from(workChapterEntity)
      .where(
        and(
          eq(workChapterEntity.workId, work.id),
          eq(workChapterEntity.status, WorkStatus.PUBLISHED),
        ),
      )
      .orderBy(asc(workChapterEntity.sequence));
    return {
      ...work,
      // 🔥 TODO: thumb.wepb -- magic string
      coverUrl: this.getCoverUrl(work.id, 'small', work.coverUpdatedAt),
      chapterCount: chapters.length,
      chapters,
    };
  }

  @HandleErrors('DATABASE_ERROR')
  async findByQuery({
    search,
    themeSlug,
    genreSlug,
    sort,
  }: {
    search?: string;
    themeSlug?: string;
    genreSlug?: string;
    sort?: PublishedWorkSort;
  }) {
    const filters: SQL[] = [eq(workEntity.status, WorkStatus.PUBLISHED)];

    const normalizedSearch = search?.trim();

    if (normalizedSearch) {
      filters.push(
        or(
          ilike(workEntity.title, `%${normalizedSearch}%`),
          ilike(workEntity.synopsis, `%${normalizedSearch}%`),
          // ilike(userEntity.name, `%${normalizedSearch}%`),
        )!,
      );
    }

    if (themeSlug) {
      filters.push(eq(workThemeEntity.slug, themeSlug));
    }

    if (genreSlug) {
      filters.push(eq(workGenreEntity.slug, genreSlug));
    }

    const orderBy =
      sort === PublishedWorkSort.ALPHABETICAL
        ? asc(workEntity.title)
        : desc(workEntity.createdAt);
    const works = await this.db
      .select({
        id: workEntity.id,
        coverUpdatedAt: workEntity.coverUpdatedAt,
        slug: workEntity.slug,
        title: workEntity.title,
        synopsis: workEntity.synopsis,
        //publishedAt: workEntity.updatedAt,
        theme: workThemeEntity.name,
        genre: workGenreEntity.name,
        authorName: userEntity.name,
      })
      .from(workEntity)
      .leftJoin(workThemeEntity, eq(workThemeEntity.id, workEntity.workThemeId))
      .leftJoin(workGenreEntity, eq(workGenreEntity.id, workEntity.workGenreId))
      .innerJoin(userEntity, eq(userEntity.id, workEntity.userId))
      .where(and(...filters))
      .orderBy(orderBy)
      .limit(100);
    return works.map((w) => ({
      ...w,
      // 🔥 TODO: thumb.wepb -- magic string
      thumbCoverUrl: this.getCoverUrl(w.id, 'thumb', w.coverUpdatedAt),
    }));
  }

  @HandleErrors('DATABASE_ERROR')
  async findPublishedChapterBySlugs(workSlug: string, chapterSlug: string) {
    const [row] = await this.db
      .select({
        workId: workEntity.id,
        workSlug: workEntity.slug,
        chapterId: workChapterEntity.id,
        chapterSequence: workChapterEntity.sequence,
        chapterTitle: workChapterEntity.title,
        nextChapterSlug: sql<string | null>`
          (
            SELECT next_chapter.slug
            FROM ${workChapterEntity} AS next_chapter
            WHERE next_chapter.work_id = ${workEntity.id}
              AND next_chapter.sequence > ${workChapterEntity.sequence}
              AND next_chapter.status = 'published'
            ORDER BY next_chapter.sequence ASC
            LIMIT 1
          )
        `,
        previousChapterSlug: sql<string | null>`
          (
            SELECT previous_chapter.slug
            FROM ${workChapterEntity} AS previous_chapter
            WHERE previous_chapter.work_id = ${workEntity.id}
              AND previous_chapter.sequence < ${workChapterEntity.sequence}
              AND previous_chapter.status = 'published'
            ORDER BY previous_chapter.sequence DESC
            LIMIT 1
          )
        `,
        totalChapters: sql<number>`
          (
            SELECT COUNT(*)
            FROM ${workChapterEntity} AS chapter_count
            WHERE chapter_count.work_id = ${workEntity.id}
              AND chapter_count.status = 'published'
          )
        `.mapWith(Number),
        bookThemeName: workThemeEntity.name,
        bookThemeSlug: workThemeEntity.slug,
        authorName: userEntity.name,
      })
      .from(workEntity)
      .innerJoin(workChapterEntity, eq(workChapterEntity.workId, workEntity.id))
      .innerJoin(
        workThemeEntity,
        eq(workThemeEntity.id, workEntity.workThemeId),
      )
      .innerJoin(userEntity, eq(userEntity.id, workEntity.userId))
      .where(
        and(
          eq(workEntity.slug, workSlug),
          eq(workEntity.status, WorkStatus.PUBLISHED),
          eq(workChapterEntity.slug, chapterSlug),
          eq(workChapterEntity.status, WorkStatus.PUBLISHED),
        ),
      )
      .limit(1);
    return row;
  }
}
