import { Inject, Injectable } from '@nestjs/common';
import { PRIVATE_STORAGE } from '@/common/constants';
import { AppException } from '@/common/exceptions/app.exception';
import { SupabaseStorageProvider } from '@/infrastructure/supabase/supabase-storage.provider';
import { ContentSecurityUtils } from '@/common/utils/content-security.utils';
import { WorkChaptersRepository } from '../repositories/work-chapters.repository';
import { WorksRepository } from '../repositories/works.repository';
import { slugify } from '../utils/slugify';
import { WorkStatus } from '../types/work-status.enum';

@Injectable()
export class WorkChaptersService {
  constructor(
    private readonly workChaptersRepository: WorkChaptersRepository,
    private readonly worksRepository: WorksRepository,
    @Inject(PRIVATE_STORAGE)
    private readonly privateStorageService: SupabaseStorageProvider,
  ) {}

  async create(workId: string, userId: string, title: string) {
    //🔥 TODO: La validación de propiedad se repite en los flujos de capítulos; no extraerla a un método sin aprobación.
    const work = await this.workChaptersRepository.findWorkByIdAndUserId(
      workId,
      userId,
    );

    if (!work) {
      throw new AppException('CHAPTER_WORK_NOT_FOUND', { workId });
    }

    if (work.status === WorkStatus.REJECTED) {
      throw new AppException('CHAPTER_WORK_REJECTED_CANNOT_BE_CHANGED', {
        workId,
      });
    }

    if (!work.supportsChapters) {
      throw new AppException('CHAPTERS_NOT_SUPPORTED_FOR_WORK_GENRE', {
        workId,
        workGenreId: work.workGenreId,
      });
    }

    // validar que el work tenga un genero que acepte chapters, solo novelas y libros aceptan, pero la clave la tiene el genre id en supportsChapters

    const slug = slugify(title);
    const chapterWithSameSlug =
      await this.workChaptersRepository.findBySlugAndWorkId(slug, workId);

    if (chapterWithSameSlug) {
      throw new AppException('CHAPTER_TITLE_ALREADY_EXISTS', {
        workId,
        title,
        slug,
      });
    }

    const lastChapter =
      await this.workChaptersRepository.findLastSequenceByWorkId(workId);

    const { id } = await this.workChaptersRepository.create(
      workId,
      title,
      slug,
      (lastChapter?.sequence ?? 0) + 1,
    );

    return { id };
  }

  async changeOrder(workId: string, userId: string, chapterIds: string[]) {
    //🔥 TODO: si ya está publicada la obra lo mandamos a la chingada
    //🔥 TODO: La validación de propiedad se repite en los flujos de capítulos; no extraerla a un método sin aprobación.
    const work = await this.workChaptersRepository.findWorkByIdAndUserId(
      workId,
      userId,
    );

    if (!work) {
      throw new AppException('CHAPTER_WORK_NOT_FOUND', { workId, userId });
    }

    if (work.status === WorkStatus.REJECTED) {
      throw new AppException('CHAPTER_WORK_REJECTED_CANNOT_BE_CHANGED', {
        workId,
      });
    }

    const chapters =
      await this.workChaptersRepository.findAllActiveChaptersByWorkId(workId);
    const currentChapterIds = new Set(chapters.map((chapter) => chapter.id));
    const requestedChapterIds = new Set(chapterIds);
    const isExactOrder =
      chapterIds.length === chapters.length &&
      requestedChapterIds.size === chapterIds.length &&
      chapterIds.every((chapterId) => currentChapterIds.has(chapterId));

    if (!isExactOrder) {
      throw new AppException('CHAPTER_REORDER_MISMATCH', {
        workId,
        expected: chapters.length,
        received: chapterIds.length,
      });
    }

    const movedPublishedChapter = chapters.some(
      (chapter, index) =>
        chapter.status === WorkStatus.PUBLISHED &&
        chapterIds[index] !== chapter.id,
    );
    if (movedPublishedChapter) {
      throw new AppException('CHAPTER_PUBLISHED_POSITION_CANNOT_CHANGE', {
        workId,
      });
    }

    await this.workChaptersRepository.updateOrder(chapterIds);
  }

  async updateTitle(
    workId: string,
    chapterId: string,
    userId: string,
    title: string,
  ) {
    //🔥 TODO: La validación de propiedad se repite en los flujos de capítulos; no extraerla a un método sin aprobación.
    const work = await this.workChaptersRepository.findWorkByIdAndUserId(
      workId,
      userId,
    );

    if (!work) {
      throw new AppException('CHAPTER_WORK_NOT_FOUND', { workId, userId });
    }

    if (work.status === WorkStatus.REJECTED) {
      throw new AppException('CHAPTER_WORK_REJECTED_CANNOT_BE_CHANGED', {
        workId,
      });
    }

    const chapter = await this.workChaptersRepository.findByIdAndWorkId(
      chapterId,
      workId,
    );

    if (!chapter) {
      throw new AppException('CHAPTER_NOT_FOUND', { workId, chapterId });
    }

    if (
      chapter.status === WorkStatus.REJECTED ||
      chapter.status === WorkStatus.PUBLISHED
    ) {
      throw new AppException('CHAPTER_STATUS_CANNOT_BE_CHANGED', {
        workId,
        chapterId,
        status: chapter.status,
      });
    }

    const nextTitle = title.trim();
    const slug = slugify(nextTitle);
    const chapterWithSameSlug =
      await this.workChaptersRepository.findBySlugAndWorkId(slug, workId);

    if (chapterWithSameSlug && chapterWithSameSlug.id !== chapterId) {
      throw new AppException('CHAPTER_TITLE_ALREADY_EXISTS', {
        workId,
        chapterId,
        title: nextTitle,
        slug,
      });
    }

    return this.workChaptersRepository.updateTitle(chapterId, nextTitle, slug);
  }

  async publish(workId: string, chapterId: string, userId: string) {
    const work = await this.workChaptersRepository.findWorkByIdAndUserId(
      workId,
      userId,
    );

    if (!work) {
      throw new AppException('CHAPTER_WORK_NOT_FOUND', { workId });
    }

    if (work.status === WorkStatus.REJECTED) {
      throw new AppException('CHAPTER_WORK_REJECTED_CANNOT_BE_CHANGED', {
        workId,
      });
    }

    if (!work.supportsChapters) {
      throw new AppException('CHAPTERS_NOT_SUPPORTED_FOR_WORK_GENRE', {
        workId,
        workGenreId: work.workGenreId,
      });
    }

    const chapter = await this.workChaptersRepository.findByIdAndWorkId(
      chapterId,
      workId,
    );

    if (!chapter) {
      throw new AppException('CHAPTER_NOT_FOUND', { workId, chapterId });
    }

    if (chapter.status === WorkStatus.PUBLISHED) {
      throw new AppException('CHAPTER_ALREADY_PUBLISHED', {
        workId,
        chapterId,
      });
    }

    if (chapter.publicationAttemptsRemaining <= 0) {
      throw new AppException('CHAPTER_NOT_MORE_PUBLISH_ATTEMPTS', {
        workId,
        chapterId,
      });
    }

    if (chapter.sequence === null) {
      throw new AppException('CHAPTER_NOT_IN_ACTIVE_SEQUENCE', {
        workId,
        chapterId,
      });
    }

    // Se intenta publicar una obra que no es el orden adecuado
    const hasUnpublishedChapterBefore =
      await this.workChaptersRepository.hasUnpublishedBefore(
        workId,
        chapter.sequence,
      );
    if (hasUnpublishedChapterBefore) {
      throw new AppException('CHAPTER_MUST_BE_PUBLISHED_IN_ORDER', {
        workId,
        chapterId,
        sequence: chapter.sequence,
      });
    }

    const manuscript = await this.privateStorageService.downloadText(
      `works/${workId}/chapters/${chapterId}.html`,
    );

    if (!manuscript?.trim()) {
      throw new AppException('CHAPTER_HAS_NOT_MANUSCRIPT_FOR_PUBLISH', {
        workId,
        chapterId,
      });
    }

    const wordCount = ContentSecurityUtils.countWords(manuscript);
    if (wordCount < 600) {
      throw new AppException('CHAPTER_IS_TOO_SHORT', { workId, chapterId });
    }

    const analysis = ContentSecurityUtils.analyzeSpam(manuscript, {
      allowLinks: true,
    });
    if (analysis.isSpam) {
      if (chapter.publicationAttemptsRemaining === 1) {
        const rejectedChapter =
          await this.workChaptersRepository.markAsRejected(
            chapterId,
            workId,
            analysis.reasons,
          );

        const rejectedChapterCount =
          await this.workChaptersRepository.countRejectedByWorkId(workId);
        if (rejectedChapterCount >= 3) {
          await this.worksRepository.markWorkAsRejected(workId, userId, [
            `La obra acumuló ${rejectedChapterCount} capítulos rechazados por políticas de publicación.`,
          ]);
        }

        return rejectedChapter;
      }

      return this.workChaptersRepository.markAsRequiresReview(
        chapterId,
        workId,
        analysis.reasons,
      );
    }

    const publishedChapter = await this.workChaptersRepository.markAsPublished(
      chapterId,
      workId,
    );

    //🔥 worksRepository is of this domain??
    if (work.status === WorkStatus.DRAFT) {
      await this.worksRepository.markWorkAsPublished(workId, userId);
    }

    return publishedChapter;
  }

  async delete(workId: string, chapterId: string, userId: string) {
    //🔥 TODO: La validación de propiedad se repite en los flujos de capítulos; no extraerla a un método sin aprobación.
    const work = await this.workChaptersRepository.findWorkByIdAndUserId(
      workId,
      userId,
    );

    if (!work) {
      throw new AppException('CHAPTER_WORK_NOT_FOUND', { workId, userId });
    }

    if (work.status === WorkStatus.REJECTED) {
      throw new AppException('CHAPTER_WORK_REJECTED_CANNOT_BE_CHANGED', {
        workId,
      });
    }

    const chapter = await this.workChaptersRepository.findByIdAndWorkId(
      chapterId,
      workId,
    );

    if (!chapter) {
      throw new AppException('CHAPTER_NOT_FOUND', { workId, chapterId });
    }

    if (
      chapter.status === WorkStatus.PUBLISHED ||
      chapter.status === WorkStatus.REJECTED
    ) {
      throw new AppException('CHAPTER_STATUS_CANNOT_BE_CHANGED', {
        workId,
        chapterId,
        status: chapter.status,
      });
    }

    const path = `works/${workId}/chapters/${chapterId}.html`;

    try {
      await this.privateStorageService.remove(path);
    } catch (error) {
      throw new AppException(
        'CHAPTER_HTML_DELETE_ERROR',
        { workId, chapterId, path },
        error,
      );
    }

    await this.workChaptersRepository.deleteAndReorder(chapterId, workId);

    return { id: chapterId };
  }
}
