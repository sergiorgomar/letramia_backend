import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_PROVIDER } from '@/common/constants';
import { HandleErrors } from '@/common/decorators/handle-errors.decorator';
import { workTypeEntity } from '../entities/work-type.entity';

export type WorkTypeEntity = typeof workTypeEntity.$inferSelect;
export type CreateWorkTypeEntity = {
  name: string;
};

@Injectable()
export class WorkTypesRepository {
  constructor(
    @Inject(DATABASE_PROVIDER) private readonly db: PostgresJsDatabase,
  ) {}

  @HandleErrors('DATABASE_ERROR')
  async create(data: CreateWorkTypeEntity): Promise<WorkTypeEntity> {
    const [row] = await this.db.insert(workTypeEntity).values(data).returning();
    return row;
  }

  @HandleErrors('DATABASE_ERROR')
  async findAll(): Promise<WorkTypeEntity[]> {
    return this.db.select().from(workTypeEntity);
  }
}
