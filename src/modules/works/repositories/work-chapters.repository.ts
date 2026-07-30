import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, eq, ne, asc, desc } from 'drizzle-orm';
import { DATABASE_PROVIDER } from '@/common/constants';
import { HandleErrors } from '@/common/decorators/handle-errors.decorator';
import { workChapterEntity } from '../entities/work-chapter.entity';

export type WorkChapterEntity = typeof workChapterEntity.$inferSelect;
export type CreateWorkChapterEntity = {
  workId: string;
  title: string;
  slug: string;
  sequence: number;
};
export type UpdateWorkChapterEntity = {
  title: string;
  slug: string;
};
export type UpdateWorkChapterSequenceEntity = {
  id: string;
  sequence: number;
};

const WORK_CHAPTER_COLUMNS = {
  id: workChapterEntity.id,
  workId: workChapterEntity.workId,
  title: workChapterEntity.title,
  slug: workChapterEntity.slug,
  sequence: workChapterEntity.sequence,
  createdAt: workChapterEntity.createdAt,
  updatedAt: workChapterEntity.updatedAt,
};

@Injectable()
export class WorkChaptersRepository {
  constructor(
    @Inject(DATABASE_PROVIDER) private readonly db: PostgresJsDatabase,
  ) {}

  @HandleErrors('DATABASE_ERROR')
  async create(data: CreateWorkChapterEntity): Promise<WorkChapterEntity> {
    const [row] = await this.db
      .insert(workChapterEntity)
      .values(data)
      .returning();
    return row;
  }

  @HandleErrors('DATABASE_ERROR')
  async update(
    id: string,
    data: UpdateWorkChapterEntity,
  ): Promise<WorkChapterEntity> {
    const [row] = await this.db
      .update(workChapterEntity)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workChapterEntity.id, id))
      .returning();
    return row;
  }

  @HandleErrors('DATABASE_ERROR')
  async deleteById(id: string): Promise<void> {
    await this.db.delete(workChapterEntity).where(eq(workChapterEntity.id, id));
  }

  @HandleErrors('DATABASE_ERROR')
  async findAllByWorkId(workId: string): Promise<WorkChapterEntity[]> {
    return this.db
      .select(WORK_CHAPTER_COLUMNS)
      .from(workChapterEntity)
      .where(eq(workChapterEntity.workId, workId))
      .orderBy(asc(workChapterEntity.sequence));
  }

  @HandleErrors('DATABASE_ERROR')
  async findByIdAndWorkId(
    id: string,
    workId: string,
  ): Promise<WorkChapterEntity | undefined> {
    const [row] = await this.db
      .select(WORK_CHAPTER_COLUMNS)
      .from(workChapterEntity)
      .where(
        and(eq(workChapterEntity.id, id), eq(workChapterEntity.workId, workId)),
      )
      .limit(1);
    return row;
  }

  // Devuelve la secuencia más alta usada en el libro, o 0 si aún no hay
  // capítulos. El servicio le suma 1 para asignar la del nuevo capítulo.
  @HandleErrors('DATABASE_ERROR')
  async findMaxSequence(workId: string): Promise<number> {
    const [row] = await this.db
      .select({ sequence: workChapterEntity.sequence })
      .from(workChapterEntity)
      .where(eq(workChapterEntity.workId, workId))
      .orderBy(desc(workChapterEntity.sequence))
      .limit(1);
    return row?.sequence ?? 0;
  }

  @HandleErrors('DATABASE_ERROR')
  async findByWorkIdAndSlug(
    workId: string,
    slug: string,
  ): Promise<WorkChapterEntity | undefined> {
    const [row] = await this.db
      .select(WORK_CHAPTER_COLUMNS)
      .from(workChapterEntity)
      .where(
        and(
          eq(workChapterEntity.workId, workId),
          eq(workChapterEntity.slug, slug),
        ),
      )
      .limit(1);
    return row;
  }

  // Acotado al workId: la unicidad del slug es por libro, no global.
  @HandleErrors('DATABASE_ERROR')
  async existsBySlug(
    workId: string,
    slug: string,
    excludeId?: string,
  ): Promise<boolean> {
    const matches = and(
      eq(workChapterEntity.workId, workId),
      eq(workChapterEntity.slug, slug),
    );
    const [row] = await this.db
      .select({ id: workChapterEntity.id })
      .from(workChapterEntity)
      .where(
        excludeId ? and(matches, ne(workChapterEntity.id, excludeId)) : matches,
      )
      .limit(1);
    return !!row;
  }

  // En transacción: reordenar es todo o nada, si falla a mitad no puede
  // quedar el libro con secuencias mezcladas.
  @HandleErrors('DATABASE_ERROR')
  async updateSequences(
    items: UpdateWorkChapterSequenceEntity[],
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(workChapterEntity)
          .set({ sequence: item.sequence, updatedAt: new Date() })
          .where(eq(workChapterEntity.id, item.id));
      }
    });
  }
}
