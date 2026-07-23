import { Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { SupabaseStorageProvider } from '@/infrastructure/supabase/supabase-storage.provider';
import {
  ImageProcessorService,
  IMAGE_VARIANT_NAMES,
} from '@/infrastructure/image/image-processor.service';
import { WorksRepository } from '../repositories/works.repository';
import { WorkCategoriesRepository } from '../repositories/work-categories.repository';
import { WorkTypesRepository } from '../repositories/work-types.repository';
import { CreateWork } from '../types/create-work.type';
import { CreateWorkResult } from '../types/create-work-result.type';
import { UpdateWork } from '../types/update-work.type';
import { WorkResult } from '../types/work-result.type';
import { slugify } from '../utils/slugify';

const SUFFIX_PATTERN = /-(\d+)$/;

const COVER_ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

// Portada de libro: vertical, entre 3:5 (0.6) y 4:5 (0.8) de ancho/alto.
const COVER_MIN_ASPECT_RATIO = 0.6;
const COVER_MAX_ASPECT_RATIO = 0.8;

@Injectable()
export class WorksService {
  constructor(
    private readonly worksRepository: WorksRepository,
    private readonly workCategoriesRepository: WorkCategoriesRepository,
    private readonly workTypesRepository: WorkTypesRepository,
    private readonly supabaseStorageProvider: SupabaseStorageProvider,
    private readonly imageProcessorService: ImageProcessorService,
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

  async updateCover(
    id: string,
    userId: string,
    file?: Express.Multer.File,
  ): Promise<WorkResult> {
    const work = await this.worksRepository.findByIdAndUserId(id, userId);
    if (!work) {
      throw new AppException('WORK_NOT_FOUND', { id, userId });
    }

    if (!file) {
      throw new AppException('WORK_COVER_FILE_MISSING', { id, userId });
    }

    if (!COVER_ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new AppException('WORK_COVER_UNSUPPORTED_TYPE', {
        id,
        userId,
        mimetype: file.mimetype,
      });
    }

    const { width, height } = await this.imageProcessorService.getDimensions(
      file.buffer,
    );
    const aspectRatio = width / height;
    if (
      aspectRatio < COVER_MIN_ASPECT_RATIO ||
      aspectRatio > COVER_MAX_ASPECT_RATIO
    ) {
      throw new AppException('WORK_COVER_INVALID_ASPECT_RATIO', {
        id,
        userId,
        width,
        height,
        aspectRatio,
      });
    }

    const variants = await this.imageProcessorService.generateVariants(
      file.buffer,
    );

    // Ruta determinística: un re-upload pisa la portada anterior (upsert)
    // en vez de acumular archivos huérfanos en el bucket. Todas las
    // variantes se guardan como WebP, sin conservar el archivo original.
    await Promise.all(
      IMAGE_VARIANT_NAMES.map((name) => {
        const variant = variants[name];
        const path = `works/${id}/cover/${name}.${variant.extension}`;
        return this.supabaseStorageProvider.upload(
          path,
          variant.buffer,
          variant.contentType,
        );
      }),
    );

    return work;
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
