import { Inject, Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { PRIVATE_STORAGE } from '@/common/constants';
import { SupabaseStorageProvider } from '@/infrastructure/supabase/supabase-storage.provider';
import {
  ImageProcessorService,
  ImageVariantName,
  IMAGE_VARIANT_NAMES,
} from '@/infrastructure/image/image-processor.service';
import { WorkEntity, WorksRepository } from '../repositories/works.repository';
import { WorkThemesRepository } from '../repositories/work-themes.repository';
import { WorkGenresRepository } from '../repositories/work-genres.repository';
import { WorkChaptersRepository } from '../repositories/work-chapters.repository';
import { CreateWork } from '../types/create-work.type';
import { CreateWorkResult } from '../types/create-work-result.type';
import { UpdateWork } from '../types/update-work.type';
import { UpdateWorkStatus } from '../types/update-work-status.type';
import { WorkResult } from '../types/work-result.type';
import { slugify } from '../utils/slugify';
import { WorkStatus } from '../types/work-status.enum';

const SUFFIX_PATTERN = /-(\d+)$/;

const COVER_ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

// Portada de libro: vertical, entre 3:5 (0.6) y 4:5 (0.8) de ancho/alto.
const COVER_MIN_ASPECT_RATIO = 0.6;
const COVER_MAX_ASPECT_RATIO = 0.8;

// Margen de seguridad: se re-firma un poco antes de que venza de verdad,
// para no arriesgarse a servir una URL que expira a mitad de un request.
const COVER_URL_REFRESH_MARGIN_MS = 5 * 60 * 1000;

const DEFAULT_COVER_VARIANT: ImageVariantName = 'medium';

// Qué columna de WorkEntity guarda la URL de cada variante.
const COVER_VARIANT_COLUMN: Record<
  ImageVariantName,
  'coverThumbUrl' | 'coverSmallUrl' | 'coverMediumUrl' | 'coverLargeUrl'
> = {
  thumb: 'coverThumbUrl',
  small: 'coverSmallUrl',
  medium: 'coverMediumUrl',
  large: 'coverLargeUrl',
};

@Injectable()
export class WorksService {
  constructor(
    private readonly worksRepository: WorksRepository,
    private readonly workThemesRepository: WorkThemesRepository,
    private readonly workGenresRepository: WorkGenresRepository,
    private readonly workChaptersRepository: WorkChaptersRepository,
    @Inject(PRIVATE_STORAGE)
    private readonly supabaseStorageProvider: SupabaseStorageProvider,
    private readonly imageProcessorService: ImageProcessorService,
  ) {}

  async findAllByUser(
    userId: string,
    coverVariant: ImageVariantName = DEFAULT_COVER_VARIANT,
  ): Promise<WorkResult[]> {
    const works = await this.worksRepository.findAllByUserId(userId);
    return Promise.all(
      works.map((work) => this.withFreshCoverUrl(work, coverVariant)),
    );
  }

  async findOne(
    id: string,
    userId: string,
    coverVariant: ImageVariantName = DEFAULT_COVER_VARIANT,
  ): Promise<WorkResult> {
    const work = await this.worksRepository.findByIdAndUserId(id, userId);
    if (!work) {
      throw new AppException('WORK_NOT_FOUND', { id, userId });
    }
    return this.withFreshCoverUrl(work, coverVariant);
  }

  // Cache-aside: si las signed URLs guardadas siguen vigentes (con margen),
  // se reutiliza la de la variante pedida tal cual; si vencieron (o nunca se
  // firmaron), se piden las 4 de nuevo a Supabase y se persisten juntas
  // (comparten un único vencimiento, porque se suben todas juntas).
  private async withFreshCoverUrl(
    work: WorkEntity,
    coverVariant: ImageVariantName,
  ): Promise<WorkResult> {
    if (!work.coverMediumUrl) {
      return this.toWorkResult(work, coverVariant);
    }

    const stillValid =
      work.coverUrlExpiresAt &&
      work.coverUrlExpiresAt.getTime() - COVER_URL_REFRESH_MARGIN_MS >
        Date.now();
    if (stillValid) {
      return this.toWorkResult(work, coverVariant);
    }

    const refreshed = await this.refreshCoverUrls(work.id);
    return this.toWorkResult(refreshed, coverVariant);
  }

  // Firma las 4 variantes de portada y persiste las URLs + el vencimiento
  // compartido. Devuelve la fila actualizada completa.
  private async refreshCoverUrls(id: string): Promise<WorkEntity> {
    const signed = await Promise.all(
      IMAGE_VARIANT_NAMES.map(async (name) => {
        const path = `works/${id}/cover/${name}.webp`;
        const { url, expiresAt } =
          await this.supabaseStorageProvider.getSignedUrl(path);
        return { name, url, expiresAt };
      }),
    );

    const urlByVariant = Object.fromEntries(
      signed.map(({ name, url }) => [name, url]),
    ) as Record<ImageVariantName, string>;

    return this.worksRepository.updateCoverUrls(id, {
      coverThumbUrl: urlByVariant.thumb,
      coverSmallUrl: urlByVariant.small,
      coverMediumUrl: urlByVariant.medium,
      coverLargeUrl: urlByVariant.large,
      //coverUrlExpiresAt: signed[0].expiresAt,
    });
  }

  async create(dto: CreateWork): Promise<CreateWorkResult> {
    const themeExists = await this.workThemesRepository.existsById(
      dto.workThemeId,
    );
    if (!themeExists) {
      throw new AppException('WORK_CATEGORY_NOT_FOUND', {
        workThemeId: dto.workThemeId,
      });
    }

    const genre = await this.workGenresRepository.findById(dto.workGenreId);
    if (!genre) {
      throw new AppException('WORK_TYPE_NOT_FOUND', {
        workGenreId: dto.workGenreId,
      });
    }

    const slug = await this.resolveUniqueSlug(dto.title);

    return this.worksRepository.create({ ...dto, synopsis: genre.name === 'Poema' ? null : dto.synopsis, slug });
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

    const themeExists = await this.workThemesRepository.existsById(
      dto.workThemeId,
    );
    if (!themeExists) {
      throw new AppException('WORK_CATEGORY_NOT_FOUND', {
        workThemeId: dto.workThemeId,
      });
    }

    const genre = await this.workGenresRepository.findById(dto.workGenreId);
    if (!genre) {
      throw new AppException('WORK_TYPE_NOT_FOUND', {
        workGenreId: dto.workGenreId,
      });
    }

    // Solo se regenera el slug si el título realmente cambió: si no, cada
    // guardado sin cambios de título recalcularía colisión contra sí mismo.
    const slug =
      dto.title === work.title
        ? work.slug
        : await this.resolveUniqueSlug(dto.title, id);

    const updated = await this.worksRepository.update(id, { ...dto, synopsis: genre.name === 'Poema' ? null : dto.synopsis, slug });
    return this.toWorkResult(updated, DEFAULT_COVER_VARIANT);
  }

  // Publicar / despublicar. El estado es lo único que decide si la obra se
  // ve en la web, así que se cambia por su propia vía y no dentro del update
  // general (que pisaría el estado sin querer en cada guardado de info).
  async updateStatus(
    id: string,
    userId: string,
    dto: UpdateWorkStatus,
  ): Promise<WorkResult> {
    const work = await this.worksRepository.findByIdAndUserId(id, userId);
    if (!work) {
      throw new AppException('WORK_NOT_FOUND', { id, userId });
    }

    if (dto.status === WorkStatus.PUBLISHED) {
      const genre = await this.workGenresRepository.findById(work.workGenreId);
      const isPoem = genre?.name === 'Poema';
      const hasContent = isPoem
        ? Boolean((await this.supabaseStorageProvider.downloadText(`works/${id}/poem.html`))?.trim())
        : (await this.workChaptersRepository.findAllByWorkId(id)).length > 0;

      if (!hasContent) {
        throw new AppException('WORK_CANNOT_PUBLISH_WITHOUT_CONTENT', { id, userId, isPoem });
      }
    }

    const updated = await this.worksRepository.updateStatus(id, {
      status: dto.status,
    });

    return this.toWorkResult(updated, DEFAULT_COVER_VARIANT);
  }


  async delete(id: string, userId: string): Promise<void> {
    const work = await this.worksRepository.findByIdAndUserId(id, userId);
    if (!work) {
      throw new AppException('WORK_NOT_FOUND', { id, userId });
    }

    const chapters = await this.workChaptersRepository.findAllByWorkId(id);
    const storagePaths = [
      ...IMAGE_VARIANT_NAMES.map((name) => `works/${id}/cover/${name}.webp`),
      ...chapters.map((chapter) => `works/${id}/chapters/${chapter.id}.html`),
      `works/${id}/poem.html`,
    ];

    // Primero se limpia Storage. Si este paso falla, la obra queda intacta y
    // el usuario puede volver a intentar el borrado sin perder sus datos.
    await this.supabaseStorageProvider.remove(storagePaths);
    await this.worksRepository.deleteWithChapters(id);
  }

  private async assertPoemOwned(id: string, userId: string): Promise<void> {
    const work = await this.worksRepository.findByIdAndUserId(id, userId);
    const genre = work && await this.workGenresRepository.findById(work.workGenreId);
    if (!work || !genre || genre.name !== 'Poema') throw new AppException('WORK_NOT_FOUND', { id, userId });
  }

  private async toWorkResult(work: WorkEntity, coverVariant: ImageVariantName): Promise<WorkResult> {
    const genre = await this.workGenresRepository.findById(work.workGenreId);
    const chapters = await this.workChaptersRepository.findAllByWorkId(work.id);
    return toWorkResult(work, coverVariant, genre?.name === 'Poema' && chapters.length === 0);
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

function toWorkResult(
  work: WorkEntity,
  coverVariant: ImageVariantName,
  isPoem: boolean,
): WorkResult {
  const { coverThumbUrl, coverSmallUrl, coverMediumUrl, coverLargeUrl, ...rest } =
    work;
  const byVariant = { coverThumbUrl, coverSmallUrl, coverMediumUrl, coverLargeUrl };

  return {
    ...rest,
    coverUrl: byVariant[COVER_VARIANT_COLUMN[coverVariant]],
    isPoem,
  };
}
