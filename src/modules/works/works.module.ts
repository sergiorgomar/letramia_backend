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

@Module({
  controllers: [WorksController, WorkCategoriesController, WorkTypesController],
  providers: [
    WorksService,
    WorksRepository,
    WorkCategoriesService,
    WorkCategoriesRepository,
    WorkTypesService,
    WorkTypesRepository,
  ],
})
export class WorksModule {}
