import { Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { WorksRepository } from '../repositories/works.repository';
import { WorkCategoriesRepository } from '../repositories/work-categories.repository';
import { WorkTypesRepository } from '../repositories/work-types.repository';
import { CreateWork } from '../types/create-work.type';
import { CreateWorkResult } from '../types/create-work-result.type';
import { UpdateWork } from '../types/update-work.type';
import { WorkResult } from '../types/work-result.type';
import { slugify } from '../utils/slugify';

const SUFFIX_PATTERN = /-(\d+)$/;

@Injectable()
export class WorksService {
  constructor(
    private readonly worksRepository: WorksRepository,
    private readonly workCategoriesRepository: WorkCategoriesRepository,
    private readonly workTypesRepository: WorkTypesRepository,
  ) {}

  findAllByUser(userId: string): Promise<WorkResult[]> {
    return this.worksRepository.findAllByUserId(userId);
  }

  async findOne(id: string, userId: string): Promise<WorkResult> {
    const work = await this.worksRepository.findByIdAndUserId(id, userId);
    if (!work) {
      throw new AppException('WORK_NOT_FOUND', { id, userId });
    }
    return work;
  }

  async create(dto: CreateWork): Promise<CreateWorkResult> {
    const categoryExists = await this.workCategoriesRepository.existsById(
      dto.workCategoryId,
    );
    if (!categoryExists) {
      throw new AppException('WORK_CATEGORY_NOT_FOUND', {
        workCategoryId: dto.workCategoryId,
      });
    }

    const typeExists = await this.workTypesRepository.existsById(
      dto.workTypeId,
    );
    if (!typeExists) {
      throw new AppException('WORK_TYPE_NOT_FOUND', {
        workTypeId: dto.workTypeId,
      });
    }

    const slug = await this.resolveUniqueSlug(dto.title);

    return this.worksRepository.create({ ...dto, slug });
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateWork,
  ): Promise<WorkResult> {
    const work = await this.worksRepository.findByIdAndUserId(id, userId);
    if (!work) {
      throw new AppException('WORK_NOT_FOUND', { id, userId });
    }

    const categoryExists = await this.workCategoriesRepository.existsById(
      dto.workCategoryId,
    );
    if (!categoryExists) {
      throw new AppException('WORK_CATEGORY_NOT_FOUND', {
        workCategoryId: dto.workCategoryId,
      });
    }

    const typeExists = await this.workTypesRepository.existsById(
      dto.workTypeId,
    );
    if (!typeExists) {
      throw new AppException('WORK_TYPE_NOT_FOUND', {
        workTypeId: dto.workTypeId,
      });
    }

    // Solo se regenera el slug si el título realmente cambió: si no, cada
    // guardado sin cambios de título recalcularía colisión contra sí mismo.
    const slug =
      dto.title === work.title
        ? work.slug
        : await this.resolveUniqueSlug(dto.title, id);

    return this.worksRepository.update(id, { ...dto, slug });
  }

  private async resolveUniqueSlug(
    title: string,
    excludeId?: string,
  ): Promise<string> {
    const baseSlug = slugify(title);
    const existingSlugs = await this.worksRepository.findSlugsStartingWith(
      baseSlug,
      excludeId,
    );

    if (existingSlugs.length === 0) {
      return baseSlug;
    }

    // El propio baseSlug (sin sufijo) cuenta como "sufijo 1".
    let lastSuffix = 1;
    for (const slug of existingSlugs) {
      const match = slug.match(SUFFIX_PATTERN);
      if (!match) continue;
      const suffix = Number(match[1]);
      if (suffix > lastSuffix) lastSuffix = suffix;
    }

    return `${baseSlug}-${lastSuffix + 1}`;
  }
}
