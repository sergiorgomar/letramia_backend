import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_PROVIDER } from '@/common/constants';
import { HandleErrors } from '@/common/decorators/handle-errors.decorator';
import { workEntity } from '../entities/work.entity';

export type WorkEntity = typeof workEntity.$inferSelect;
export type CreateWorkEntity = {
  title: string;
  workCategoryId: string;
  workTypeId: string;
  synopsis?: string | null;
  coverUrl?: string | null;
};

@Injectable()
export class WorksRepository {
  constructor(
    @Inject(DATABASE_PROVIDER) private readonly db: PostgresJsDatabase,
  ) {}

  @HandleErrors('DATABASE_ERROR')
  async create(data: CreateWorkEntity): Promise<WorkEntity> {
    const [row] = await this.db.insert(workEntity).values(data).returning();
    return row;
  }
}
