import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { type SQL, desc, and, eq, sql, or, ilike, asc } from 'drizzle-orm';
import { DATABASE_PROVIDER } from '@/common/constants';
import { HandleErrors } from '@/common/decorators/handle-errors.decorator';

import { userEntity } from '@/modules/accounts/entities/user.entity';
import { workEntity } from '@/modules/works/entities/work.entity';
import { workThemeEntity } from '@/modules/works/entities/work-theme.entity';
import { workGenreEntity } from '@/modules/works/entities/work-genre.entity';
import { WorkStatus } from '@/modules/works/types/work-status.enum';
import { workChapterEntity } from '@/modules/works/entities/work-chapter.entity';
import { PublishedWorkSort } from '@/modules/works/types/published-work-sort.enum';

import { SponsorBanner } from '../types/sponsor-banner.type';
import { Themes } from '../types/themes.type';
import { Genres } from '../types/genres.type';
import { LastWorks } from '../types/last-works.type';

@Injectable()
export class WebRepository {
  constructor(
    @Inject(DATABASE_PROVIDER) private readonly db: PostgresJsDatabase,
  ) {}

  @HandleErrors('DATABASE_ERROR')
  async getSponsorBannerData(): Promise<SponsorBanner> {
    const works = await this.db
      .select({
        workSlug: workEntity.slug,
        coverLargeUrl: workEntity.coverLargeUrl,
        title: workEntity.title,
      })
      .from(workEntity)
      .orderBy(desc(workEntity.createdAt))
      .limit(5);

    return works.map((w) => ({
      slug: w.workSlug,
      title: w.title,
      imageUrl: w.coverLargeUrl,
    }));
  }

  @HandleErrors('DATABASE_ERROR')
  async getThemes(): Promise<Themes> {
    return await this.db
      .select({
        id: workThemeEntity.id,
        name: workThemeEntity.name,
      })
      .from(workThemeEntity);
  }

  @HandleErrors('DATABASE_ERROR')
  async getGenres(): Promise<Genres> {
    return await this.db
      .select({
        id: workGenreEntity.id,
        name: workGenreEntity.name,
      })
      .from(workGenreEntity);
  }

  @HandleErrors('DATABASE_ERROR')
  async getLastWorks(): Promise<LastWorks> {
    const lastWorks = await this.db
      .select({
        workSlug: workEntity.slug,
        coverThumbUrl: workEntity.coverThumbUrl,
        synopsis: workEntity.synopsis,
        title: workEntity.title,
      })
      .from(workEntity)
      .where(eq(workEntity.status, WorkStatus.PUBLISHED))
      .orderBy(desc(workEntity.createdAt))
      .limit(100);

    return lastWorks.map((w) => ({
      slug: w.workSlug,
      title: w.title,
      synopsis: w.synopsis,
      thumbCoverUrl: w.coverThumbUrl,
    }));
  }

  @HandleErrors('DATABASE_ERROR')
  async findPublishedWork(slug: string) {
    const [row] = await this.db
      .select({
        id: workEntity.id,
        title: workEntity.title,
        synopsis: workEntity.synopsis,
        //🔥 TODO: date of published is requiered
        publishedAt: workEntity.updatedAt,
        themeName: workThemeEntity.name,
        genreName: workGenreEntity.name,
        authorName: userEntity.name,
        chapterCount: sql<number>`
          (
            SELECT COUNT(*)
            FROM ${workChapterEntity}
            WHERE ${workChapterEntity.workId} = ${workEntity.id}
          )
        `.mapWith(Number),
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
      .innerJoin(
        userEntity,
        eq(userEntity.id, workEntity.userId),
      )
      .leftJoin(
        workChapterEntity,
        eq(workChapterEntity.workId, workEntity.id),
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

  @HandleErrors('DATABASE_ERROR')
  async findByQuery({ 
    search,
    themeSlug,
    genreSlug,
    sort
  }: {
    search?: string;
    themeSlug?: string;
    genreSlug?: string;
    sort?: PublishedWorkSort
  }) {
    const filters: SQL[] = [
      eq(workEntity.status, WorkStatus.PUBLISHED),
    ];

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
        slug: workEntity.slug,
        title: workEntity.title,
        synopsis: workEntity.synopsis,
        thumbCoverUrl: workEntity.coverThumbUrl,
        //publishedAt: workEntity.updatedAt,
        theme: workThemeEntity.name,
        genre:  workGenreEntity.name,
        authorName: userEntity.name,
      })
      .from(workEntity)
      .leftJoin(
        workThemeEntity,
        eq(workThemeEntity.id, workEntity.workThemeId),
      )
      .leftJoin(
        workGenreEntity,
        eq(workGenreEntity.id, workEntity.workGenreId),
      )
      .innerJoin(
        userEntity,
        eq(userEntity.id, workEntity.userId),
      )
      .where(and(...filters))
      .orderBy(orderBy)
      .limit(100);
    return works; 
  }

  @HandleErrors('DATABASE_ERROR')
  async findWorkAndChapterIdsBySlugs(workSlug: string, chapterSlug: string) {
    const [row] = await this.db
      .select({
        workId: workEntity.id,
        chapterId: workChapterEntity.id,
        chapterSecuence: workChapterEntity.sequence,
        chapterTitle: workChapterEntity.title,
      })
      .from(workEntity)
      .innerJoin(
        workChapterEntity,
        eq(workChapterEntity.workId, workEntity.id),
      )
      .where(
        and(
          eq(workEntity.slug, workSlug),
          eq(workEntity.status, WorkStatus.PUBLISHED),
          eq(workChapterEntity.slug, chapterSlug),
        ),
      )
      .limit(1);
    return row ?? { workId: '', chapterId: '', chapterSecuence: '', chapterTitle: '' };
  }
}
