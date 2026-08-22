import { Cache } from 'cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { SupabaseStorageProvider } from '@/infrastructure/supabase/supabase-storage.provider';

import { AppException } from '@/common/exceptions/app.exception';
import { PRIVATE_STORAGE } from '@/common/constants';

import { PageData } from '../types/page-data.type';
import { WebRepository } from '../repositories/web.repository';
import { PublishedWorkSort } from '@/modules/works/types/published-work-sort.enum';

const PAGE_DATA_CACHE_KEY = 'web:page-data';
const PAGE_DATA_CACHE_TTL_MS = 60_000; // 1minuto
const WORK_NOT_FOUND_CACHE_TTL_MS = 180_000; // 3 minutos

@Injectable()
export class WebService {
  constructor(
    private readonly webRepository: WebRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject(PRIVATE_STORAGE)
    private readonly privateStorageService: SupabaseStorageProvider,
  ) {}

  async getSitemapData() {
    const rows = await this.webRepository.findSitemapRows();
    const works = new Map<
      string,
      { slug: string; chapters: { slug: string }[] }
    >();
    const themes = new Map<string, { slug: string; name: string }>();
    const genres = new Map<string, { slug: string; name: string }>();

    for (const row of rows) {
      themes.set(row.themeSlug, {
        slug: row.themeSlug,
        name: row.themeName,
      });
      genres.set(row.genreSlug, {
        slug: row.genreSlug,
        name: row.genreName,
      });

      const work = works.get(row.workSlug) ?? {
        slug: row.workSlug,
        chapters: [],
      };
      if (row.chapterSlug) work.chapters.push({ slug: row.chapterSlug });
      works.set(row.workSlug, work);
    }

    return {
      themes: [...themes.values()],
      genres: [...genres.values()],
      works: [...works.values()],
    };
  }

  async getPageData(): Promise<PageData> {
    const cachedData =
      await this.cacheManager.get<PageData>(PAGE_DATA_CACHE_KEY);

    if (cachedData) return cachedData;

    const [sponsorBanner, themes, genres, lastWorks] = await Promise.all([
      this.webRepository.getSponsorBannerData(),
      this.webRepository.getThemes(),
      this.webRepository.getGenres(),
      this.webRepository.getLastWorks(),
    ]);
    const pageData: PageData = {
      sponsorBanner,
      themes,
      genres,
      lastWorks,
    };

    //🔥 TODO: implement revalidate cache instead of ttls minutes
    /**
     * Mejor todavía: invalidar la caché cuando haya cambios
      En lugar de esperar un TTL, puedes borrar la caché cuando:
      Se crea una obra.
      Se publica una obra.
      Se modifica un género.
      Se modifica un tema.
      Se actualiza una portada.
    */
    await this.cacheManager.set(
      PAGE_DATA_CACHE_KEY,
      pageData,
      PAGE_DATA_CACHE_TTL_MS,
    );

    return pageData;
  }

  async getWorkInfo(slug: string) {
    const WORK_NOT_FOUND_VALUE = '__NOT_FOUND__';

    const cacheKey = `web:work:${slug}`;

    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData === WORK_NOT_FOUND_VALUE) {
      throw new AppException('WORK_NOT_FOUND', { slug });
    }
    if (cachedData) return cachedData;

    const work = await this.webRepository.findPublishedWork(slug);
    if (!work) {
      await this.cacheManager.set(
        cacheKey,
        WORK_NOT_FOUND_VALUE,
        WORK_NOT_FOUND_CACHE_TTL_MS,
      );
      throw new AppException('WORK_NOT_FOUND', { slug });
    }

    const { supportsChapters, ...workResponse } = work;
    let text: null | string = null;
    if (!supportsChapters) {
      text = await this.privateStorageService.downloadText(
        `works/${workResponse.id}/manuscript.html`,
      );
    }

    //🔥 TODO: implement revalidate cache instead of ttls minutes
    /**
     * Mejor todavía: invalidar la caché cuando haya cambios
      En lugar de esperar un TTL, puedes borrar la caché cuando:
      Se MODIFICA la obra.
    */
    await this.cacheManager.set(
      cacheKey,
      { ...workResponse, text },
      PAGE_DATA_CACHE_TTL_MS,
    );

    return { ...workResponse, text };
  }

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
    return await this.webRepository.findByQuery({
      search,
      themeSlug,
      genreSlug,
      sort,
    });
  }

  async findChapterContent(workSlug: string, chapterSlug: string) {
    const WORK_NOT_FOUND_VALUE = '__NOT_FOUND__';
    const cacheKey = `web:work:${workSlug}:${chapterSlug}`;

    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData === WORK_NOT_FOUND_VALUE) {
      throw new AppException('WEB_CONTENT_NOT_FOUND_FOR_SLUGS', {
        workSlug,
        chapterSlug,
      });
    }
    if (cachedData) return cachedData;

    const chapter = await this.webRepository.findPublishedChapterBySlugs(
      workSlug,
      chapterSlug,
    );

    if (!chapter) {
      await this.cacheManager.set(
        cacheKey,
        WORK_NOT_FOUND_VALUE,
        PAGE_DATA_CACHE_TTL_MS,
      );
      throw new AppException('WEB_CONTENT_NOT_FOUND_FOR_SLUGS', {
        workSlug,
        chapterSlug,
      });
    }

    const {
      workId,
      chapterId,
      workSlug: publishedWorkSlug,
      totalChapters,
      bookThemeName,
      bookThemeSlug,
      authorName,
      chapterTitle,
      chapterSequence,
      nextChapterSlug,
      previousChapterSlug,
    } = chapter;

    if (!workId || !chapterId) {
      await this.cacheManager.set(
        cacheKey,
        WORK_NOT_FOUND_VALUE,
        PAGE_DATA_CACHE_TTL_MS,
      );
      throw new AppException('WEB_CONTENT_NOT_FOUND_FOR_SLUGS', {
        workSlug,
        chapterSlug,
      });
    }
    const content = await this.privateStorageService.downloadText(
      `works/${workId}/chapters/${chapterId}.html`,
    );

    const chapterContent = {
      workSlug: publishedWorkSlug,
      totalChapters,
      bookThemeName,
      bookThemeSlug,
      authorName,
      chapterTitle,
      chapterSequence,
      nextChapterSlug,
      previousChapterSlug,
      chapterContent: content,
    };

    await this.cacheManager.set(
      cacheKey,
      chapterContent,
      PAGE_DATA_CACHE_TTL_MS,
    );

    return chapterContent;
  }
}
