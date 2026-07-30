import { Inject, Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { SupabaseStorageProvider } from '@/infrastructure/supabase/supabase-storage.provider';
import {
  ImageProcessorService,
  IMAGE_VARIANT_NAMES,
} from '@/infrastructure/image/image-processor.service';
import { WorksRepository } from '@/modules/works/repositories/works.repository';
import { PRIVATE_STORAGE, PUBLIC_STORAGE } from '@/common/constants';
import { isUUID } from 'class-validator';
import { WorkChaptersRepository } from '@/modules/works/repositories/work-chapters.repository';
import { FilesRepository } from '../repositories/files.repository';

@Injectable()
export class WorksFilesService {
  constructor(
    @Inject(PUBLIC_STORAGE)
    private readonly publicStorageService: SupabaseStorageProvider,
    @Inject(PRIVATE_STORAGE)
    private readonly privateStorageService: SupabaseStorageProvider,
    private readonly imageService: ImageProcessorService,
    private readonly worksRepository: WorksRepository,
    private readonly filesRepository: FilesRepository,
    private readonly worksChaptersRepository: WorkChaptersRepository,
  ) {}

  async uploadCover(id: string, userId: string, file?: any): Promise<void> {
    const work = await this.worksRepository.findByIdAndUserId(id, userId);
    if (!work) {
      throw new AppException('WORK_NOT_FOUND', { id, userId });
    }

    if (!file) {
      throw new AppException('WORK_COVER_FILE_MISSING', { id, userId });
    }

    if (!this.imageService.isValidWorkCoverMimeType(file.mimetype)) {
      throw new AppException('WORK_COVER_UNSUPPORTED_TYPE', {
        id,
        userId,
        mimetype: file.mimetype,
      });
    }

    const aspectRatio = await this.imageService.getAspectRatio(file.buffer);
    if (!this.imageService.isValidWorkCoverAspectRatio(aspectRatio)) {
      throw new AppException('WORK_COVER_INVALID_ASPECT_RATIO', {
        file,
        id,
        userId,
        aspectRatio,
      });
    }

    const variants = await this.imageService.generateCoverVariants(file.buffer);

    // 🔥 TODO: SE ESTA DESPERDICIANDO COMPUTO, hay que guardar solo el path
    // la url publica se forma a partir del bucket
    // https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>

    // upload covers to supabase
    await Promise.all(
      IMAGE_VARIANT_NAMES.map((name) => {
        const variant = variants[name];
        const path = `works/${work.id}/cover/${name}.${variant.extension}`;
        return this.publicStorageService.upload(
          path,
          variant.buffer,
          variant.contentType,
        );
      }),
    );

    // get urls of cover from supabase
    const urls = Object.fromEntries(
      await Promise.all(
        IMAGE_VARIANT_NAMES.map(async (name) => {
          const path = `works/${work.id}/cover/${name}.webp`;
          const url = await this.publicStorageService.getPublicUrl(path);
          return [name, url] as const;
        }),
      ),
    ) as Record<(typeof IMAGE_VARIANT_NAMES)[number], string>;

    // upload cover urls into database
    await this.worksRepository.updateCoverUrls(work.id, {
      coverThumbUrl: urls.thumb,
      coverSmallUrl: urls.small,
      coverMediumUrl: urls.medium,
      coverLargeUrl: urls.large,
    });
  }

  async uploadContent(
    workId: string,
    userId: string,
    info: string,
    file: any,
  ): Promise<void> {
    // validations
    if (!file) throw new AppException('WORK_CONTENT_FILE_MISSING', { workId });
    if (file.mimetype !== 'text/html')
      throw new AppException('WORK_CONTENT_UNSUPPORTED_TYPE', {
        mimetype: file.mimetype,
      });

    if (!info)
      throw new AppException('WORK_CONTENT_INFO_FILE_MISSING', { info });

    //🔥 TODO: esas validaciones estan medio chafas
    let infoJson = {};
    try {
      infoJson = JSON.parse(info);
    } catch (e) {
      throw new AppException('WORK_CONTENT_INFO_NOT_CORRECT', { infoJson }, e);
    }

    if (!('workGenreId' in infoJson)) {
      throw new AppException('WORK_CONTENT_INFO_NOT_CORRECT', {
        infoJson,
        more: 'Not workGenreId into infoJson',
      });
    }

    const workGenreId = String(infoJson.workGenreId);
    if (!isUUID(workGenreId, '4')) {
      throw new AppException('WORK_GENRE_NOT_UUID', { workGenreId });
    }

    // data manipulation
    const slug = await this.filesRepository.findGenreSlugById(workGenreId);
    if (!slug) {
      throw new AppException('WORK_GENRE_NOT_FOUND', { workGenreId });
    }

    const work = await this.worksRepository.findByIdAndUserId(workId, userId);
    if (!work) {
      throw new AppException('WORK_NOT_FOUND', { workId });
    }

    // 🔥 Magic strings
    switch (slug) {
      case 'poema':
        // los poemas suben poem.html
        await this.privateStorageService.upload(
          `works/${workId}/poem.html`,
          file.buffer,
          'text/html',
        );
        break;

      // los libros, novelas llevan capitulos
      case 'novela':
      case 'libro':
        //🔥 TODO: esas validaciones estan medio chafas
        if (!('workChapterId' in infoJson)) {
          throw new AppException('WORK_CONTENT_INFO_NOT_CORRECT', {
            infoJson,
            more: `Missing workChapterId for ${slug}`,
          });
        }
        const workChapterId = String(infoJson.workChapterId);
        if (!isUUID(workChapterId, '4')) {
          throw new AppException('WORK_CHAPTER_NOT_UUID', { workChapterId });
        }
        const chapter = await this.worksChaptersRepository.findByIdAndWorkId(
          workChapterId,
          workId,
        );
        if (!chapter) {
          throw new AppException('WORK_CHAPTER_DOES_NOT_EXIST', {
            workChapterId,
            workId,
          });
        }
        await this.privateStorageService.upload(
          `works/${workId}/chapters/${workChapterId}.html`,
          file.buffer,
          'text/html',
        );
        break;

      // OTROS TIPOS NO SE HAN CONFIGURADO AUN
      default:
        throw new AppException('WORK_CONTENT_UPLOAD_NOT_IMPLEMENTED_YET', {
          slug,
        });
    }
  }
}
