import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// infrastructure modules
import { DatabaseModule } from '@/infrastructure/database/database.module';
// Bussines modules
import { SystemModule } from '@/modules/system/system.module';
import { WorksModule } from '@/modules/works/works.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    // infra
    DatabaseModule,

    // bussines
    SystemModule,
    WorksModule,
  ],
})
export class AppModule {}
