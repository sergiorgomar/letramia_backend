import { Module } from '@nestjs/common';
import { WorksController } from './controllers/works.controller';
import { WorksService } from './services/works.service';
import { WorksRepository } from './repositories/works.repository';
import { WorkCategoriesController } from './controllers/work-categories.controller';
import { WorkCategoriesService } from './services/work-categories.service';
import { WorkCategoriesRepository } from './repositories/work-categories.repository';
import { WorkTypesController } from './controllers/work-types.controller';
import { WorkTypesService } from './services/work-types.service';
import { WorkTypesRepository } from './repositories/work-types.repository';
import { WorkChaptersController } from './controllers/work-chapters.controller';
import { WorkChaptersService } from './services/work-chapters.service';
import { WorkChaptersRepository } from './repositories/work-chapters.repository';

@Module({
  controllers: [
    WorksController,
    WorkCategoriesController,
    WorkTypesController,
    WorkChaptersController,
  ],
  providers: [
    WorksService,
    WorksRepository,
    WorkCategoriesService,
    WorkCategoriesRepository,
    WorkTypesService,
    WorkTypesRepository,
    WorkChaptersService,
    WorkChaptersRepository,
  ],
})
export class WorksModule {}
