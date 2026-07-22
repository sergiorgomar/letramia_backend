import { Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { WorksRepository } from '../repositories/works.repository';
import { WorkCategoriesRepository } from '../repositories/work-categories.repository';
import { WorkTypesRepository } from '../repositories/work-types.repository';
import { CreateWork } from '../types/create-work.type';
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

  findAll(): Promise<WorkResult[]> {
    return this.worksRepository.findAll();
  }

  async create(dto: CreateWork): Promise<WorkResult> {
    let id = '';
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

    const baseSlug = slugify(dto.title);

    const existingSlugs =
      await this.worksRepository.findSlugsStartingWith(baseSlug);

    if (existingSlugs.length === 0) {
      const created = await this.worksRepository.create({
        ...dto,
        slug: baseSlug,
      });
      id = created.id;
    }

    // El propio baseSlug (sin sufijo) cuenta como "sufijo 1".
    let lastSuffix = 1;
    for (const slug of existingSlugs) {
      const match = slug.match(SUFFIX_PATTERN);
      if (!match) continue;
      const suffix = Number(match[1]);
      if (suffix > lastSuffix) lastSuffix = suffix;
    }
    const created = await this.worksRepository.create({
      ...dto,
      slug: `${baseSlug}-${lastSuffix + 1}`,
    });

    id = created.id;

    return { id };
  }
}
