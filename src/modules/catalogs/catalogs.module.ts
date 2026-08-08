import { Module } from '@nestjs/common';
import { CatalogsRepository } from './repositories/catalogs.repository';
import { CatalogsController } from './controllers/catalogs.controller';
import { CatalogsService } from './services/catalogs.service';

@Module({
  controllers: [CatalogsController],
  providers: [CatalogsService, CatalogsRepository],
})
export class CatalogsModule {}
