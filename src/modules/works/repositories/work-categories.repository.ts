import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { DATABASE_PROVIDER } from '@/common/constants';
import { HandleErrors } from '@/common/decorators/handle-errors.decorator';
import { workCategoryEntity } from '../entities/work-category.entity';

export type WorkCategoryEntity = typeof workCategoryEntity.$inferSelect;
export type CreateWorkCategoryEntity = {
  name: string;
};
@Injectable()
export class WorkCategoriesRepository {
  constructor(
    @Inject(DATABASE_PROVIDER) private readonly db: PostgresJsDatabase,
  ) {}

  @HandleErrors('DATABASE_ERROR')
  async create(data: CreateWorkCategoryEntity): Promise<WorkCategoryEntity> {
    const [row] = await this.db
      .insert(workCategoryEntity)
      .values(data)
      .returning();
    return row;
  }

  @HandleErrors('DATABASE_ERROR')
  async findAll(): Promise<WorkCategoryEntity[]> {
    return this.db
      .select({
        id: workCategoryEntity.id,
        name: workCategoryEntity.name,
        createdAt: workCategoryEntity.createdAt,
        updatedAt: workCategoryEntity.updatedAt,
      })
      .from(workCategoryEntity);
  }

  @HandleErrors('DATABASE_ERROR')
  async existsById(id: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: workCategoryEntity.id })
      .from(workCategoryEntity)
      .where(eq(workCategoryEntity.id, id))
      .limit(1);
    return !!row;
  }
}
