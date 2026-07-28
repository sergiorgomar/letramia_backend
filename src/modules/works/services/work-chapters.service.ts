import { Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { SupabaseStorageProvider } from '@/infrastructure/supabase/supabase-storage.provider';
import {
  WorkChapterEntity,
  WorkChaptersRepository,
} from '../repositories/work-chapters.repository';
import { WorksRepository } from '../repositories/works.repository';
import { WorkGenresRepository } from '../repositories/work-genres.repository';
import { CreateWorkChapter } from '../types/create-work-chapter.type';
import { UpdateWorkChapter } from '../types/update-work-chapter.type';
import { ReorderWorkChapters } from '../types/reorder-work-chapters.type';
import { WorkChapterResult } from '../types/work-chapter-result.type';
import { WorkChapterContentResult } from '../types/work-chapter-content-result.type';
import { slugify } from '../utils/slugify';

const CHAPTER_CONTENT_MIME_TYPE = 'text/html';

@Injectable()
export class WorkChaptersService {
  constructor(
    private readonly workChaptersRepository: WorkChaptersRepository,
    private readonly worksRepository: WorksRepository,
    private readonly workGenresRepository: WorkGenresRepository,
    private readonly supabaseStorageProvider: SupabaseStorageProvider,
  ) {}

  async findAll(workId: string, userId: string): Promise<WorkChapterResult[]> {
    await this.assertWorkOwned(workId, userId, true);
    const chapters = await this.workChaptersRepository.findAllByWorkId(workId);
    return chapters.map(toChapterResult);
  }

  async findOne(
    workId: string,
    chapterId: string,
    userId: string,
  ): Promise<WorkChapterContentResult> {
    await this.assertWorkOwned(workId, userId, true);
    const chapter = await this.getOwnedChapter(workId, chapterId);

    const content = await this.supabaseStorageProvider.downloadText(
      chapterHtmlPath(workId, chapterId),
    );

    return { ...toChapterResult(chapter), content };
  }

  async create(dto: CreateWorkChapter): Promise<WorkChapterResult> {
    await this.assertWorkOwned(dto.workId, dto.userId);

    const slug = await this.resolveAvailableSlug(dto.workId, dto.title);
    const maxSequence = await this.workChaptersRepository.findMaxSequence(
      dto.workId,
    );

    const chapter = await this.workChaptersRepository.create({
      workId: dto.workId,
      title: dto.title,
      slug,
      sequence: maxSequence + 1,
    });

    return toChapterResult(chapter);
  }

  async update(
    workId: string,
    chapterId: string,
    userId: string,
    dto: UpdateWorkChapter,
  ): Promise<WorkChapterResult> {
    await this.assertWorkOwned(workId, userId, true);
    const chapter = await this.getOwnedChapter(workId, chapterId);

    // Solo se revalida el slug si el título realmente cambió, para no
    // chocar contra sí mismo en cada guardado.
    const slug =
      dto.title === chapter.title
        ? chapter.slug
        : await this.resolveAvailableSlug(workId, dto.title, chapterId);

    const updated = await this.workChaptersRepository.update(chapterId, {
      title: dto.title,
      slug,
    });

    return toChapterResult(updated);
  }

  // Recibe el orden completo del libro y reasigna las secuencias 1..n. Se pide
  // la lista entera (y no "mové el capítulo X a la posición Y") para que el
  // resultado sea el mismo sin importar cuántos movimientos hizo el usuario.
  async reorder(
    workId: string,
    userId: string,
    dto: ReorderWorkChapters,
  ): Promise<WorkChapterResult[]> {
    await this.assertWorkOwned(workId, userId, true);

    const chapters = await this.workChaptersRepository.findAllByWorkId(workId);
    const currentIds = new Set(chapters.map((chapter) => chapter.id));
    const receivedIds = new Set(dto.chapterIds);

    // Debe ser exactamente el mismo conjunto: ni de más, ni de menos, ni
    // repetidos. Si no, alguien mandó una lista desincronizada.
    const isSameSet =
      dto.chapterIds.length === chapters.length &&
      receivedIds.size === dto.chapterIds.length &&
      dto.chapterIds.every((id) => currentIds.has(id));

    if (!isSameSet) {
      throw new AppException('CHAPTER_REORDER_MISMATCH', {
        workId,
        expected: chapters.length,
        received: dto.chapterIds.length,
      });
    }

    await this.workChaptersRepository.updateSequences(
      dto.chapterIds.map((id, index) => ({ id, sequence: index + 1 })),
    );

    const reordered = await this.workChaptersRepository.findAllByWorkId(workId);
    return reordered.map(toChapterResult);
  }

  async delete(
    workId: string,
    chapterId: string,
    userId: string,
  ): Promise<void> {
    await this.assertWorkOwned(workId, userId, true);
    await this.getOwnedChapter(workId, chapterId);

    // La fila es la fuente de verdad, así que va primero. El HTML se borra
    // best-effort: un capítulo recién creado puede no tener archivo todavía,
    // y un blob huérfano es mucho menos grave que un capítulo que no se deja
    // eliminar.
    await this.workChaptersRepository.deleteById(chapterId);

    try {
      await this.supabaseStorageProvider.remove(
        chapterHtmlPath(workId, chapterId),
      );
    } catch {
      // Silenciado a propósito: el capítulo ya se eliminó para el usuario.
    }
  }

  async uploadContent(
    workId: string,
    chapterId: string,
    userId: string,
    file?: Express.Multer.File,
  ): Promise<WorkChapterResult> {
    await this.assertWorkOwned(workId, userId, true);
    const chapter = await this.getOwnedChapter(workId, chapterId);

    if (!file) {
      throw new AppException('CHAPTER_CONTENT_FILE_MISSING', {
        workId,
        chapterId,
      });
    }

    if (file.mimetype !== CHAPTER_CONTENT_MIME_TYPE) {
      throw new AppException('CHAPTER_CONTENT_UNSUPPORTED_TYPE', {
        workId,
        chapterId,
        mimetype: file.mimetype,
      });
    }

    // Ruta determinística derivada del id: un re-upload pisa el HTML anterior
    // (upsert) en vez de acumular archivos huérfanos en el bucket.
    await this.supabaseStorageProvider.upload(
      chapterHtmlPath(workId, chapterId),
      file.buffer,
      CHAPTER_CONTENT_MIME_TYPE,
    );

    return toChapterResult(chapter);
  }

  // Verifica que el libro exista y pertenezca al usuario. Cualquier operación
  // sobre capítulos pasa antes por acá.
  private async assertWorkOwned(
    workId: string,
    userId: string,
    allowLegacyChapters = false,
  ): Promise<void> {
    const work = await this.worksRepository.findByIdAndUserId(workId, userId);
    if (!work) {
      throw new AppException('WORK_NOT_FOUND', { id: workId, userId });
    }
    const genre = await this.workGenresRepository.findById(work.workGenreId);
    const hasLegacyChapters = allowLegacyChapters &&
      (await this.workChaptersRepository.findAllByWorkId(workId)).length > 0;
    if (genre?.name === 'Poema' && !hasLegacyChapters) {
      throw new AppException('WORK_NOT_FOUND', { id: workId, userId });
    }
  }

  private async getOwnedChapter(
    workId: string,
    chapterId: string,
  ): Promise<WorkChapterEntity> {
    const chapter = await this.workChaptersRepository.findByIdAndWorkId(
      chapterId,
      workId,
    );
    if (!chapter) {
      throw new AppException('CHAPTER_NOT_FOUND', { chapterId, workId });
    }
    return chapter;
  }

  // A diferencia de las obras, acá NO se agrega sufijo numérico: si el título
  // ya existe en el libro se rechaza y el usuario elige otro.
  private async resolveAvailableSlug(
    workId: string,
    title: string,
    excludeId?: string,
  ): Promise<string> {
    const slug = slugify(title);
    const taken = await this.workChaptersRepository.existsBySlug(
      workId,
      slug,
      excludeId,
    );

    if (taken) {
      throw new AppException('CHAPTER_TITLE_ALREADY_EXISTS', {
        workId,
        title,
        slug,
      });
    }

    return slug;
  }
}

function toChapterResult(chapter: WorkChapterEntity): WorkChapterResult {
  return {
    id: chapter.id,
    workId: chapter.workId,
    title: chapter.title,
    slug: chapter.slug,
    sequence: chapter.sequence,
    createdAt: chapter.createdAt,
    updatedAt: chapter.updatedAt,
  };
}

function chapterHtmlPath(workId: string, chapterId: string): string {
  return `works/${workId}/chapters/${chapterId}.html`;
}
