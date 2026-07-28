import { Module } from '@nestjs/common';
import { SupabaseModule } from '@/infrastructure/supabase/supabase.module';
import { ImageModule } from '@/infrastructure/image/image.module';
import { WorksModule } from '@/modules/works/works.module';
import { WorksFilesController } from './controllers/works-files.controller';
import { WorksFilesService } from './services/works-files.service';

@Module({
  imports: [SupabaseModule, WorksModule, ImageModule],
  controllers: [WorksFilesController],
  providers: [WorksFilesService],
})
export class FilesModule {}
