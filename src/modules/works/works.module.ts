import { Module } from '@nestjs/common';
import { WorksController } from './controllers/works.controller';
import { WorksService } from './services/works.service';
import { WorksRepository } from './repositories/works.repository';
import { WorkChaptersController } from './controllers/work-chapters.controller';
import { WorkChaptersService } from './services/work-chapters.service';
import { WorkChaptersRepository } from './repositories/work-chapters.repository';

@Module({
  controllers: [WorksController, WorkChaptersController],
  providers: [
    WorksService,
    WorksRepository,
    WorkChaptersRepository,
    WorkChaptersService,
  ],
  exports: [WorksRepository],
})
export class WorksModule {}
