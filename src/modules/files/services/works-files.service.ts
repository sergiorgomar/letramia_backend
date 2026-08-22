import { Inject, Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { SupabaseStorageProvider } from '@/infrastructure/supabase/supabase-storage.provider';
import {
  ImageProcessorService,
  IMAGE_VARIANT_NAMES,
} from '@/infrastructure/image/image-processor.service';
import { PRIVATE_STORAGE, PUBLIC_STORAGE } from '@/common/constants';
import { FilesRepository } from '../repositories/files.repository';
import { ContentSecurityUtils } from '@/common/utils/content-security.utils';
import { WorkStatus } from '@/modules/works/types/work-status.enum';
import { randomUUID } from 'node:crypto';

@Injectable()
export class WorksFilesService {
  constructor(
    @Inject(PUBLIC_STORAGE)
    private readonly publicStorageService: SupabaseStorageProvider,
    @Inject(PRIVATE_STORAGE)
    private readonly privateStorageService: SupabaseStorageProvider,
    private readonly imageService: ImageProcessorService,
    private readonly filesRepository: FilesRepository,
  ) {}

  async uploadCover(id: string, userId: string, file?: any): Promise<void> {
    const work = await this.filesRepository.findWorkByIdAndUserId(id, userId);
    if (!work) {
      throw new AppException('WORK_NOT_FOUND', { id });
    }

    if (work.status === WorkStatus.REJECTED) {
      throw new AppException('WORK_REJECTED_CANNOT_BE_CHANGED', { id });
    }

    if (!file) {
      throw new AppException('WORK_COVER_FILE_MISSING', { id });
    }

    if (!this.imageService.isValidWorkCoverMimeType(file.mimetype)) {
      throw new AppException('WORK_COVER_UNSUPPORTED_TYPE', {
        id,
        userId,
        mimetype: file.mimetype,
      });
    }

    // const aspectRatio = await this.imageService.getAspectRatio(file.buffer);
    // if (!this.imageService.isValidWorkCoverAspectRatio(aspectRatio)) {
    //   throw new AppException('WORK_COVER_INVALID_ASPECT_RATIO', {
    //     file,
    //     id,
    //     userId,
    //     aspectRatio,
    //   });
    // }

    const variants = await this.imageService.generateCoverVariants(file.buffer);

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

    await this.filesRepository.updateWorkCoverTimestamp(work.id);
  }

  async uploadContent(
    workId: string,
    userId: string,
    chapterId,
    file: any,
  ): Promise<void> {
    // validations
    if (!file) throw new AppException('WORK_CONTENT_FILE_MISSING', { workId });
    if (file.mimetype !== 'text/html')
      throw new AppException('WORK_CONTENT_UNSUPPORTED_TYPE', {
        mimetype: file.mimetype,
      });

    const work = await this.filesRepository.findWorkContentByIdAndUserId(
      workId,
      userId,
      chapterId,
    );
    if (!work) {
      throw new AppException('WORK_NOT_FOUND', { workId });
    }

    if (work.workStatus === WorkStatus.REJECTED) {
      throw new AppException('CHAPTER_WORK_REJECTED_CANNOT_BE_CHANGED', {
        workId,
      });
    }

    if (work.chapterStatus === WorkStatus.REJECTED) {
      throw new AppException('CHAPTER_STATUS_CANNOT_BE_CHANGED', {
        workId,
        chapterId,
        status: work.chapterStatus,
      });
    }

    /**
     * 🔥 DARLE UNA VUELTA A ESTO DE LAS SANITIZADAS, DEL SPAM
     * ESTA TODO MUY REVUELTO NO SE ENTIENDE BIEN
     */
    const { wordCount, characterCount, html } =
      ContentSecurityUtils.sanitizeHtmlWithStats(file.buffer.toString('utf8'), {
        allowLinks: true,
        allowImages: true,
        allowYoutube: true,
        allowTiktok: true,
        allowInstagram: true,
        allowFacebook: true,
        allowedImageUrlPrefix: this.publicStorageService.getPublicUrl(
          `works/${workId}/content-images/`,
        ),
      });

    //🔥🔥 IMPORTANTE, DEBEMOS PASAR EL MODELO DE IA POR ACA TAMBIEN!!
    const isPublishedContent = work.chapterId
      ? work.chapterStatus === WorkStatus.PUBLISHED
      : work.workStatus === WorkStatus.PUBLISHED;
    if (isPublishedContent) {
      const publishedWordCount = ContentSecurityUtils.countWords(html);
      if (publishedWordCount < 600) {
        throw new AppException('PUBLISHED_CONTENT_TOO_SHORT', {
          workId,
          chapterId,
          wordCount: publishedWordCount,
        });
      }

      const analysis = ContentSecurityUtils.analyzeSpam(html, {
        allowLinks: true,
      });
      if (analysis.isSpam) {
        throw new AppException('PUBLISHED_CONTENT_IS_SPAM', {
          workId,
          chapterId,
          reasons: analysis.reasons,
        });
      }
    }

    const sanitizedBuffer = Buffer.from(html, 'utf8');

    if (!work.supportsChapters) {
      await this.privateStorageService.upload(
        `works/${workId}/manuscript.html`,
        sanitizedBuffer,
        'text/html',
      );
      await this.filesRepository.updateWorkStats(
        workId,
        wordCount,
        characterCount,
      );
      return;
    }

    if (!chapterId || !work.chapterId) {
      throw new AppException('WORK_CONTENT_INFO_NOT_CORRECT', {
        chapterId,
        more: 'Missing or invalid chapterId for a work with chapters',
      });
    }
    await this.privateStorageService.upload(
      `works/${work.id}/chapters/${work.chapterId}.html`,
      sanitizedBuffer,
      'text/html',
    );
    await this.filesRepository.updateChapterStats(
      chapterId,
      wordCount,
      characterCount,
    );
  }

  async uploadContentImage(
    workId: string,
    userId: string,
    file?: any,
  ): Promise<{ id: string; url: string }> {
    if (!file) {
      throw new AppException('WORK_CONTENT_IMAGE_FILE_MISSING', { workId });
    }
    if (!this.imageService.isValidContentImageMimeType(file.mimetype)) {
      throw new AppException('WORK_CONTENT_IMAGE_UNSUPPORTED_TYPE', {
        mimetype: file.mimetype,
      });
    }

    const work = await this.filesRepository.findWorkContentByIdAndUserId(
      workId,
      userId,
      undefined,
    );
    if (!work) throw new AppException('WORK_NOT_FOUND', { workId });
    if (work.workStatus === WorkStatus.REJECTED) {
      throw new AppException('CHAPTER_WORK_REJECTED_CANNOT_BE_CHANGED', {
        workId,
      });
    }
    let image;
    try {
      image = await this.imageService.generateContentImage(file.buffer);
    } catch {
      throw new AppException('WORK_CONTENT_IMAGE_UNSUPPORTED_TYPE', {
        mimetype: file.mimetype,
      });
    }

    const id = randomUUID();
    const path = `works/${workId}/content-images/${id}.${image.extension}`;
    await this.publicStorageService.upload(
      path,
      image.buffer,
      image.contentType,
    );

    return { id, url: this.publicStorageService.getPublicUrl(path) };
  }

  async listContentImages(
    workId: string,
    userId: string,
  ): Promise<{ images: { url: string }[] }> {
    const work = await this.filesRepository.findWorkByIdAndUserId(
      workId,
      userId,
    );
    if (!work) throw new AppException('WORK_NOT_FOUND', { workId });

    const directory = `works/${workId}/content-images`;
    const paths = await this.publicStorageService.list(directory);

    return {
      images: paths.map((path) => ({
        url: this.publicStorageService.getPublicUrl(path),
      })),
    };
  }

  async getManuscript(workId: string, userId: string, chapterId) {
    const work = await this.filesRepository.findWorkContentByIdAndUserId(
      workId,
      userId,
      chapterId,
    );
    if (!work) {
      throw new AppException('WORK_NOT_FOUND', { workId });
    }
    if (!work.supportsChapters) {
      return this.privateStorageService.downloadText(
        `works/${workId}/manuscript.html`,
      );
    }

    if (!chapterId || !work.chapterId) {
      throw new AppException('WORK_CONTENT_INFO_NOT_CORRECT', {
        chapterId,
        more: 'Missing or invalid chapterId for a work with chapters',
      });
    }
    return this.privateStorageService.downloadText(
      `works/${work.id}/chapters/${work.chapterId}.html`,
    );
  }
}
