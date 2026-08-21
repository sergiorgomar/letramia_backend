import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, sql } from 'drizzle-orm';
import { DATABASE_PROVIDER } from '@/common/constants';
import { HandleErrors } from '@/common/decorators/handle-errors.decorator';

import { workGenreEntity } from '@/modules/works/entities/work-genre.entity';
import { workEntity } from '@/modules/works/entities/work.entity';
import { workChapterEntity } from '@/modules/works/entities/work-chapter.entity';

@Injectable()
export class FilesRepository {
  constructor(
    @Inject(DATABASE_PROVIDER) private readonly db: PostgresJsDatabase,
  ) {}

  @HandleErrors('DATABASE_ERROR')
  async findWorkByIdAndUserId(id: string, userId: string) {
    const [work] = await this.db
      .select({ id: workEntity.id })
      .from(workEntity)
      .where(and(eq(workEntity.id, id), eq(workEntity.userId, userId)))
      .limit(1);

    return work;
  }

  @HandleErrors('DATABASE_ERROR')
  async findWorkContentByIdAndUserId(
    workId: string,
    userId: string,
    chapterId,
  ) {
    const [work] = await this.db
      .select({
        id: workEntity.id,
        workStatus: workEntity.status,
        genreSlug: workGenreEntity.slug,
        chapterId: workChapterEntity.id,
        chapterStatus: workChapterEntity.status,
      })
      .from(workEntity)
      .innerJoin(
        workGenreEntity,
        eq(workGenreEntity.id, workEntity.workGenreId),
      )
      .leftJoin(
        workChapterEntity,
        chapterId
          ? and(
              eq(workChapterEntity.id, chapterId),
              eq(workChapterEntity.workId, workEntity.id),
            )
          : sql`false`,
      )
      .where(and(eq(workEntity.id, workId), eq(workEntity.userId, userId)))
      .limit(1);

    return work;
  }

  @HandleErrors('DATABASE_ERROR')
  async updateWorkStats(
    workId: string,
    wordCount: number,
    characterCount: number,
  ) {
    const [row] = await this.db
      .update(workEntity)
      //🔥 TODO: Dates validations UTC-6 or timestamp
      .set({ wordCount, characterCount, updatedAt: new Date() })
      .where(eq(workEntity.id, workId))
      .returning();
    return row;
  }

  @HandleErrors('DATABASE_ERROR')
  async updateChapterStats(
    chapterEntity: string,
    wordCount: number,
    characterCount: number,
  ) {
    const [row] = await this.db
      .update(workChapterEntity)
      //🔥 TODO: Dates validations UTC-6 or timestamp
      .set({ wordCount, characterCount, updatedAt: new Date() })
      .where(eq(workChapterEntity.id, chapterEntity))
      .returning();
    return row;
  }
}
