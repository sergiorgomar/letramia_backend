import { Cache } from 'cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { AppException } from '@/common/exceptions/app.exception';
import { PRIVATE_STORAGE } from '@/common/constants';

import { SupabaseStorageProvider } from '@/infrastructure/supabase/supabase-storage.provider';

import { WorksRepository } from '../repositories/works.repository';
import { CreateWork } from '../types/create-work.type';
import { CreateWorkResult } from '../types/create-work-result.type';
import { slugify } from '../utils/slugify';
import { getNextSlug } from '../utils/get-next-slug';

// const PAGE_DATA_CACHE_TTL_MS = 60_000; // 1minuto

@Injectable()
export class WorksService {
  constructor(
    private readonly worksRepository: WorksRepository,
    @Inject(PRIVATE_STORAGE)
    private readonly supabaseStorageProvider: SupabaseStorageProvider,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findAllWorksByUser(userId: string): Promise<any> {
    // const cacheKey = `web:works:epalines:${userId}`;
    // const cachedData = await this.cacheManager.get(cacheKey);
    // if (cachedData) {
    //   console.log('Cached works');
    //   return cachedData;
    // }

    const works = await this.worksRepository.findAllByUserId(userId);

    //await this.cacheManager.set(cacheKey, works, PAGE_DATA_CACHE_TTL_MS);

    return works;
  }

  async findOne(workId: string, userId: string) {
    const work = await this.worksRepository.findByIdAndUserId(workId, userId);
    if (!work) {
      throw new AppException('WORK_NOT_FOUND', { workId });
    }

    return work;
  }

  async create(dto: CreateWork): Promise<CreateWorkResult> {
    const [themeExists, genreExist] = await Promise.all([
      this.worksRepository.existThemeBySlug(dto.workThemeSlug),
      this.worksRepository.existGenreBySlug(dto.workGenreSlug),
    ]);

    if (!themeExists) {
      throw new AppException('WORK_THEME_NOT_FOUND', {
        workThemeSlug: dto.workThemeSlug,
      });
    }

    if (!genreExist) {
      throw new AppException('WORK_GENRE_NOT_FOUND', {
        workGenreSlug: dto.workGenreSlug,
      });
    }

    // validar slugs repetidos
    let slug = slugify(dto.title);
    const existingSlugs =
      await this.worksRepository.findSlugsStartingWith(slug);
    if (existingSlugs.length > 0) slug = getNextSlug(slug, existingSlugs);

    // TODO: 🔥 FIX I do not like this
    const ids = await this.worksRepository.findThemeAndGenreIdsBySlug(
      dto.workThemeSlug,
      dto.workGenreSlug,
    );

    if (!ids.themeId) {
      throw new AppException('WORK_THEME_NOT_FOUND', {
        workThemeSlug: dto.workThemeSlug,
      });
    }

    if (!ids.genreId) {
      throw new AppException('WORK_GENRE_NOT_FOUND', {
        workGenreSlug: dto.workGenreSlug,
      });
    }

    // TODO: 🔥 Validate if genre is admited for synopsis
    return await this.worksRepository.create({
      userId: dto.userId,
      title: dto.title,
      synopsis: dto.synopsis ?? null,
      slug,
      workThemeId: ids.themeId,
      workGenreId: ids.genreId,
    });
  }
}
