import { Cache } from 'cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { CatalogsRepository } from '../repositories/catalogs.repository';

const CATALOGS_CACHE_KEY = 'catalogs:themes-and-genres';
const CATALOGS_CACHE_TTL_MS = 12 * 60 * 60 * 1_000; // 12 horas

@Injectable()
export class CatalogsService {
  constructor(
    private readonly catalogsRepository: CatalogsRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findAll() {
    const cachedCatalogs = await this.cacheManager.get(CATALOGS_CACHE_KEY);
    if (cachedCatalogs) return cachedCatalogs;

    const [themes, genres] = await Promise.all([
      this.catalogsRepository.findThemes(),
      this.catalogsRepository.findGenres(),
    ]);
    const catalogs = { themes, genres };

    await this.cacheManager.set(
      CATALOGS_CACHE_KEY,
      catalogs,
      CATALOGS_CACHE_TTL_MS,
    );

    return catalogs;
  }
}
