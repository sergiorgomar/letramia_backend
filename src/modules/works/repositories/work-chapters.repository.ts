import { Inject, Injectable } from '@nestjs/common';
import { and, asc, desc, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_PROVIDER } from '@/common/constants';
import { HandleErrors } from '@/common/decorators/handle-errors.decorator';
import { workChapterEntity } from '../entities/work-chapter.entity';
import { workEntity } from '../entities/work.entity';
import { workGenreEntity } from '../entities/work-genre.entity';

@Injectable()
export class WorkChaptersRepository {
  constructor(
    @Inject(DATABASE_PROVIDER) private readonly db: PostgresJsDatabase,
  ) {}

  @HandleErrors('WORK_CHAPTERS_REPOSITORY_FIND_WORK_BY_ID_AND_USER_ID_ERROR')
  async findWorkByIdAndUserId(workId: string, userId: string) {
    const [work] = await this.db
      .select({
        id: workEntity.id,
        workGenreId: workEntity.workGenreId,
        supportsChapters: workGenreEntity.supportsChapters,
      })
      .from(workEntity)
      .innerJoin(
        workGenreEntity,
        eq(workGenreEntity.id, workEntity.workGenreId),
      )
      .where(and(eq(workEntity.id, workId), eq(workEntity.userId, userId)))
      .limit(1);

    return work;
  }

  @HandleErrors('WORK_CHAPTERS_REPOSITORY_CREATE_ERROR')
  async create(workId: string, title: string, slug: string, sequence: number) {
    const [chapter] = await this.db
      .insert(workChapterEntity)
      .values({ workId, title, slug, sequence })
      .returning({
        id: workChapterEntity.id,
      });

    return { id: chapter.id };
  }

  @HandleErrors('WORK_CHAPTERS_REPOSITORY_FIND_ALL_IDS_BY_WORK_ID_ERROR')
  async findAllIdsByWorkId(workId: string) {
    return this.db
      .select({
        id: workChapterEntity.id,
      })
      .from(workChapterEntity)
      .where(eq(workChapterEntity.workId, workId))
      .orderBy(asc(workChapterEntity.sequence));
  }

  @HandleErrors('WORK_CHAPTERS_REPOSITORY_FIND_BY_ID_AND_WORK_ID_ERROR')
  async findByIdAndWorkId(chapterId: string, workId: string) {
    const [chapter] = await this.db
      .select({
        id: workChapterEntity.id,
      })
      .from(workChapterEntity)
      .where(
        and(
          eq(workChapterEntity.id, chapterId),
          eq(workChapterEntity.workId, workId),
        ),
      )
      .limit(1);

    return chapter;
  }

  @HandleErrors('WORK_CHAPTERS_REPOSITORY_FIND_BY_SLUG_AND_WORK_ID_ERROR')
  async findBySlugAndWorkId(slug: string, workId: string) {
    const [chapter] = await this.db
      .select({ id: workChapterEntity.id })
      .from(workChapterEntity)
      .where(
        and(
          eq(workChapterEntity.slug, slug),
          eq(workChapterEntity.workId, workId),
        ),
      )
      .limit(1);

    return chapter;
  }

  @HandleErrors('WORK_CHAPTERS_REPOSITORY_FIND_LAST_SEQUENCE_BY_WORK_ID_ERROR')
  async findLastSequenceByWorkId(workId: string) {
    const [chapter] = await this.db
      .select({ sequence: workChapterEntity.sequence })
      .from(workChapterEntity)
      .where(eq(workChapterEntity.workId, workId))
      .orderBy(desc(workChapterEntity.sequence))
      .limit(1);

    return chapter;
  }

  @HandleErrors('WORK_CHAPTERS_REPOSITORY_UPDATE_TITLE_ERROR')
  async updateTitle(chapterId: string, title: string, slug: string) {
    const [chapter] = await this.db
      .update(workChapterEntity)
      .set({ title, slug, updatedAt: new Date() })
      .where(eq(workChapterEntity.id, chapterId))
      .returning({
        id: workChapterEntity.id,
      });

    return { id: chapter.id };
  }

  @HandleErrors('WORK_CHAPTERS_REPOSITORY_UPDATE_ORDER_ERROR')
  async updateOrder(chapterIds: string[]): Promise<void> {
    await this.db.transaction(async (transaction) => {
      for (const [index, chapterId] of chapterIds.entries()) {
        await transaction
          .update(workChapterEntity)
          .set({ sequence: index + 1, updatedAt: new Date() })
          .where(eq(workChapterEntity.id, chapterId));
      }
    });
  }
}
