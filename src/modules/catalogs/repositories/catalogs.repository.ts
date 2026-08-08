import { Inject } from '@nestjs/common';
import { asc } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { DATABASE_PROVIDER } from '@/common/constants';
import { HandleErrors } from '@/common/decorators/handle-errors.decorator';
import { workGenreEntity } from '@/modules/works/entities/work-genre.entity';
import { workThemeEntity } from '@/modules/works/entities/work-theme.entity';

export class CatalogsRepository {
  constructor(
    @Inject(DATABASE_PROVIDER) private readonly db: PostgresJsDatabase,
  ) {}

  @HandleErrors('DATABASE_ERROR')
  async findThemes() {
    return this.db
      .select({
        id: workThemeEntity.id,
        name: workThemeEntity.name,
        slug: workThemeEntity.slug,
      })
      .from(workThemeEntity)
      .orderBy(asc(workThemeEntity.name));
  }

  @HandleErrors('DATABASE_ERROR')
  async findGenres() {
    return this.db
      .select({
        id: workGenreEntity.id,
        name: workGenreEntity.name,
        slug: workGenreEntity.slug,
        requiresSynopsis: workGenreEntity.requiresSynopsis,
        supportsChapters: workGenreEntity.supportsChapters,
      })
      .from(workGenreEntity)
      .orderBy(asc(workGenreEntity.name));
  }
}
