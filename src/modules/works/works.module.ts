import { Module } from '@nestjs/common';
import { WorksController } from './controllers/works.controller';
import { WorksService } from './services/works.service';
import { WorksRepository } from './repositories/works.repository';
import { WorkThemesController } from './controllers/work-themes.controller';
import { WorkThemesService } from './services/work-themes.service';
import { WorkThemesRepository } from './repositories/work-themes.repository';
import { WorkGenresController } from './controllers/work-genres.controller';
import { WorkGenresService } from './services/work-genres.service';
import { WorkGenresRepository } from './repositories/work-genres.repository';
import { WorkChaptersController } from './controllers/work-chapters.controller';
import { WorkChaptersService } from './services/work-chapters.service';
import { WorkChaptersRepository } from './repositories/work-chapters.repository';
import { PublicWorksController } from './controllers/public-works.controller';
import { PublicWorksService } from './services/public-works.service';

@Module({
  controllers: [
    WorksController,
    WorkThemesController,
    WorkGenresController,
    WorkChaptersController,
    PublicWorksController,
  ],
  providers: [
    WorksService,
    WorksRepository,
    WorkChaptersRepository,
    WorkThemesService,
    WorkThemesRepository,
    WorkGenresService,
    WorkGenresRepository,
    WorkChaptersService,
    PublicWorksService,
  ],
})
export class WorksModule {}
