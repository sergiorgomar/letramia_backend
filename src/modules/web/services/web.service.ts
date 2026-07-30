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

    // si la obra es un poema, hay que devolver el content
    let text: null | string = null;
    //🔥 TODO:magic strings ta muy gacho esto aca que poema, almenos un enum pudiera ser
    if (work.genreSlug == 'poema') {
      text = await this.privateStorageService.downloadText(
        `works/${work.id}/poem.html`,
      );
    }
    // FALTA--- Otras obras, otros procesos
    //🔥 TODO: implement revalidate cache instead of ttls minutes
    /**
     * Mejor todavía: invalidar la caché cuando haya cambios
      En lugar de esperar un TTL, puedes borrar la caché cuando:
      Se MODIFICA la obra.
    */
    await this.cacheManager.set(
      cacheKey,
      { ...work, text },
      PAGE_DATA_CACHE_TTL_MS,
    );

    return { ...work, text };
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

    const { workId, chapterId, chapterSecuence, chapterTitle } =
      await this.webRepository.findWorkAndChapterIdsBySlugs(
        workSlug,
        chapterSlug,
      );
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

    await this.cacheManager.set(
      cacheKey,
      {
        title: chapterTitle,
        sequence: chapterSecuence,
        content,
      },
      PAGE_DATA_CACHE_TTL_MS,
    );

    return {
      title: chapterTitle,
      sequence: chapterSecuence,
      content,
    };
  }
}
