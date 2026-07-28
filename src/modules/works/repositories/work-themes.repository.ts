import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { DATABASE_PROVIDER } from '@/common/constants';
import { HandleErrors } from '@/common/decorators/handle-errors.decorator';
import { workThemeEntity } from '../entities/work-theme.entity';

export type WorkThemeEntity = typeof workThemeEntity.$inferSelect;
export type CreateWorkThemeEntity = {
  name: string;
};
@Injectable()
export class WorkThemesRepository {
  constructor(
    @Inject(DATABASE_PROVIDER) private readonly db: PostgresJsDatabase,
  ) {}

  @HandleErrors('DATABASE_ERROR')
  async create(data: CreateWorkThemeEntity): Promise<WorkThemeEntity> {
    const [row] = await this.db
      .insert(workThemeEntity)
      .values(data)
      .returning();
    return row;
  }

  @HandleErrors('DATABASE_ERROR')
  async findAll(): Promise<WorkThemeEntity[]> {
    return this.db
      .select({
        id: workThemeEntity.id,
        name: workThemeEntity.name,
        createdAt: workThemeEntity.createdAt,
        updatedAt: workThemeEntity.updatedAt,
      })
      .from(workThemeEntity);
  }

  @HandleErrors('DATABASE_ERROR')
  async existsById(id: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: workThemeEntity.id })
      .from(workThemeEntity)
      .where(eq(workThemeEntity.id, id))
      .limit(1);
    return !!row;
  }
}
