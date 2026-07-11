import { Module } from '@nestjs/common';
import { WorksController } from './works.controller';
import { WorksService } from './works.service';
import { WorksRepository } from './repositories/works.repository';

@Module({
  controllers: [WorksController],
  providers: [WorksService, WorksRepository],
})
export class WorksModule {}
