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
import { WorkStatus } from '../types/work-status.enum';
import { ContentSecurityUtils } from '@/common/utils/content-security.utils';

// const PAGE_DATA_CACHE_TTL_MS = 60_000; // 1minuto

@Injectable()
export class WorksService {
  constructor(
    private readonly worksRepository: WorksRepository,
    @Inject(PRIVATE_STORAGE)
    private readonly privateStorageService: SupabaseStorageProvider,
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

  async updateDetails(
    workId: string,
    userId: string,
    title: string,
    synopsis: string | undefined,
    workThemeSlug: string,
  ) {
    const work = await this.worksRepository.findStatusByIdAndUserId(
      workId,
      userId,
    );

    if (!work) {
      throw new AppException('WORK_NOT_FOUND', { workId, userId });
    }

    if (work.status === WorkStatus.PUBLISHED) {
      throw new AppException('WORK_PUBLISHED_CANNOT_BE_UPDATED', {
        workId,
        userId,
      });
    }

    const nextTitle = title.trim();
    const nextWorkThemeSlug = workThemeSlug.trim();
    const nextSynopsis =
      synopsis === undefined ? undefined : synopsis.trim() || null;

    const theme =
      await this.worksRepository.findThemeIdBySlug(nextWorkThemeSlug);

    if (!theme) {
      throw new AppException('WORK_THEME_NOT_FOUND', {
        workThemeSlug: nextWorkThemeSlug,
      });
    }

    const slug = slugify(nextTitle);
    const existingSlugs = await this.worksRepository.findSlugsStartingWith(
      slug,
      workId,
    );
    const nextSlug =
      existingSlugs.length > 0 ? getNextSlug(slug, existingSlugs) : slug;

    const updatedWork = await this.worksRepository.updateDetailsByIdAndUserId(
      workId,
      userId,
      nextTitle,
      nextSlug,
      nextSynopsis,
      theme.id,
    );

    if (updatedWork) return updatedWork;

    throw new AppException('WORK_DETAILS_UPDATE_NOT_APPLIED', {
      workId,
      userId,
    });
  }

  async publish(
    workId: string,
    userId: string,
  ): Promise<{ status: WorkStatus }> {
    const work = await this.worksRepository.findDataForPublish(workId, userId);

    if (!work) {
      throw new AppException('WORK_NOT_FOUND', { workId });
    }

    if (work.status === WorkStatus.PUBLISHED) {
      throw new AppException('WORK_PUBLISHED_ALREADY_PUBLISHED', {
        workId,
      });
    }

    if (work.publicationAttemptsRemaining <= 0) {
      throw new AppException('WORKS_NOT_MORE_PUBLISH_ATTEMPTS', {
        workId,
      });
    }

    //validar que tenga contenido
    switch (work.genreSlug) {
      case 'poema':
      case 'reseña':
      case 'cuento': {
        const manuscript = await this.privateStorageService.downloadText(
          `works/${workId}/manuscript.html`,
        );

        if (!manuscript || manuscript === null || manuscript === '') {
          throw new AppException('WORK_HAS_NOT_MANUSCRIPT_FOR_PUBLISH', {
            workId,
          });
        }

        /**
         * 🔥 DARLE UNA VUELTA A ESTO DE LAS SANITIZADAS, DEL SPAM
         * ESTA TODO MUY REVUELTO NO SE ENTIENDE BIEN
         */
        const planed = ContentSecurityUtils.htmlToPlainText(manuscript);
        const analysis = ContentSecurityUtils.analyzeSpam(planed);
        if (analysis.isSpam) {
          if (work.publicationAttemptsRemaining == 1) {
            this.worksRepository.markWorkAsRejected(
              workId,
              userId,
              analysis.reasons,
            );
            return { status: WorkStatus.REJECTED };
          } else {
            this.worksRepository.markWorkAsRequiresReview(
              workId,
              userId,
              analysis.reasons,
            );
            return { status: WorkStatus.REQUIRES_REVIEW };
          }
        }

        //validar plagio,

        //Publicar obra
        this.worksRepository.markWorkAsPublished(workId, userId);
        return { status: WorkStatus.PUBLISHED };
      }
      case 'novela':
      case 'libro': {
        // si es novela o libro no se puede publicar por este medio,
        // esos hay que publicar cada capitulo
        throw new AppException('WORK_NOT_ADMITED_FOR_PUBLISH', {
          workId,
          genreSlug: work.genreSlug,
        });
      }
      default: {
        throw new AppException('WORK_NOT_ADMITED_FOR_PUBLISH', {
          workId,
          genreSlug: work.genreSlug,
        });
      }
    }
  }
}
