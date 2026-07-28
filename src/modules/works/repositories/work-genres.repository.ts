import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { DATABASE_PROVIDER } from '@/common/constants';
import { HandleErrors } from '@/common/decorators/handle-errors.decorator';
import { workGenreEntity } from '../entities/work-genre.entity';

export type WorkGenreEntity = typeof workGenreEntity.$inferSelect;
export type CreateWorkGenreEntity = {
  name: string;
};

@Injectable()
export class WorkGenresRepository {
  constructor(
    @Inject(DATABASE_PROVIDER) private readonly db: PostgresJsDatabase,
  ) {}

  @HandleErrors('DATABASE_ERROR')
  async create(data: CreateWorkGenreEntity): Promise<WorkGenreEntity> {
    const [row] = await this.db.insert(workGenreEntity).values(data).returning();
    return row;
  }

  @HandleErrors('DATABASE_ERROR')
  async findAll(): Promise<WorkGenreEntity[]> {
    return this.db
      .select({
        id: workGenreEntity.id,
        name: workGenreEntity.name,
        createdAt: workGenreEntity.createdAt,
        updatedAt: workGenreEntity.updatedAt,
      })
      .from(workGenreEntity);
  }

  @HandleErrors('DATABASE_ERROR')
  async existsById(id: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: workGenreEntity.id })
      .from(workGenreEntity)
      .where(eq(workGenreEntity.id, id))
      .limit(1);
    return !!row;
  }

  @HandleErrors('DATABASE_ERROR')
  async findById(id: string): Promise<WorkGenreEntity | undefined> {
    const [row] = await this.db.select().from(workGenreEntity).where(eq(workGenreEntity.id, id)).limit(1);
    return row;
  }
}
