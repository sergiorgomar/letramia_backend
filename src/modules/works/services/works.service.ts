import { Inject, Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { PRIVATE_STORAGE } from '@/common/constants';
import { SupabaseStorageProvider } from '@/infrastructure/supabase/supabase-storage.provider';
import { WorksRepository } from '../repositories/works.repository';
import { WorkChaptersRepository } from '../repositories/work-chapters.repository';
import { CreateWork } from '../types/create-work.type';
import { CreateWorkResult } from '../types/create-work-result.type';
import { UpdateWork } from '../types/update-work.type';
import { slugify } from '../utils/slugify';
import { getNextSlug } from '../utils/get-next-slug';

@Injectable()
export class WorksService {
  constructor(
    private readonly worksRepository: WorksRepository,
    private readonly workChaptersRepository: WorkChaptersRepository,
    @Inject(PRIVATE_STORAGE)
    private readonly supabaseStorageProvider: SupabaseStorageProvider,
  ) {}

  async findAllWorksByUser(userId: string) {
    return await this.worksRepository.findAllByUserId(userId);
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
      this.worksRepository.existThemeById(dto.workThemeId),
      this.worksRepository.existGenreById(dto.workGenreId),
    ]);

    if (!themeExists) {
      throw new AppException('WORK_THEME_NOT_FOUND', {
        workThemeId: dto.workThemeId,
      });
    }

    if (!genreExist) {
      throw new AppException('WORK_GENRE_NOT_FOUND', {
        workGenreId: dto.workGenreId,
      });
    }

    // validar slugs repetidos
    let slug = slugify(dto.title);
    const existingSlugs =
      await this.worksRepository.findSlugsStartingWith(slug);
    if (existingSlugs.length > 0) slug = getNextSlug(slug, existingSlugs);

    return await this.worksRepository.create({
      ...dto,
      synopsis: dto.synopsis,
      slug,
    });
  }

  async update(dto: UpdateWork, userId: string) {
    const [workExist, themeExists] = await Promise.all([
      this.worksRepository.existWorkByIdForUserId(dto.id, userId),
      dto.workThemeId !== undefined
        ? this.worksRepository.existThemeById(dto.workThemeId)
        : Promise.resolve(true),
    ]);
    if (!workExist)
      throw new AppException('WORK_NOT_FOUND', { workId: dto.id, userId });

    if (!themeExists) {
      throw new AppException('WORK_THEME_NOT_FOUND', {
        workThemeId: dto.workThemeId,
      });
    }

    // TODO: 🔥 Solo se regenera el slug si el título realmente cambió: si no, cada
    // TODO: 🐛 AQUI HAY UN BUGZASO, SI MANDO EL MISMO TITULO SE QUIEBRAN LOS SLUGS!!
    let slug: string | undefined;
    if (dto.title !== undefined) {
      slug = slugify(dto.title);
      const existingSlugs = await this.worksRepository.findSlugsStartingWith(
        slug,
        dto.id,
      );
      if (existingSlugs.length > 0) slug = getNextSlug(slug, existingSlugs);
    }

    return await this.worksRepository.update(dto.id, {
      ...dto,
      synopsis: dto.synopsis,
      slug,
    });
  }
}
