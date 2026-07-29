import { Module } from '@nestjs/common';
import { WebController } from './controllers/web.controller';
import { WebService } from './services/web.service';
import { WebRepository } from './repositories/web.repository';

// This module is for expose the services for web page
@Module({
  controllers: [WebController],
  providers: [WebService, WebRepository]
})
export class WebModule {}
