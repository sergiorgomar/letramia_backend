import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { DATABASE_PROVIDER } from '@/common/constants';
import { HandleErrors } from '@/common/decorators/handle-errors.decorator';

import { workGenreEntity } from '@/modules/works/entities/work-genre.entity';
import { workEntity } from '@/modules/works/entities/work.entity';

export type UpdateCoverUrls = {
  coverThumbUrl: string;
  coverSmallUrl: string;
  coverMediumUrl: string;
  coverLargeUrl: string;
};
@Injectable()
export class FilesRepository {
  constructor(
    @Inject(DATABASE_PROVIDER) private readonly db: PostgresJsDatabase,
  ) {}

  @HandleErrors('DATABASE_ERROR')
  async findGenreSlugById(genreId: string): Promise<string | null> {
    const [genre] = await this.db
      .select({
        slug: workGenreEntity.slug,
      })
      .from(workGenreEntity)
      .where(eq(workGenreEntity.id, genreId))
      .limit(1);

    return genre?.slug ?? null;
  }

  @HandleErrors('DATABASE_ERROR')
  async updateCoverUrls(id: string, urls: UpdateCoverUrls) {
    const [row] = await this.db
      .update(workEntity)
      //🔥 TODO: Dates validations UTC-6 or timestamp
      .set({ ...urls, updatedAt: new Date() })
      .where(eq(workEntity.id, id))
      .returning();
    return row;
  }
}
