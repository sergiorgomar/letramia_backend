import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

// infrastructure modules
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AuthModule } from '@/infrastructure/auth/auth.module';
import { SupabaseModule } from '@/infrastructure/supabase/supabase.module';
import { ImageModule } from '@/infrastructure/image/image.module';

// Bussines modules
import { SystemModule } from '@/modules/system/system.module';
import { WorksModule } from '@/modules/works/works.module';
import { AccountsModule } from '@/modules/accounts/accounts.module';
import { FilesModule } from '@/modules/files/files.module';
import { WebModule } from '@/modules/web/web.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60_000,
      max: 100,
    }),
    // infra
    DatabaseModule,
    AuthModule,
    SupabaseModule,
    ImageModule,

    // bussines
    FilesModule,
    SystemModule,
    WorksModule,
    //🔥IT would be a microservice in ahoter deploy
    WebModule,
    AccountsModule,
  ],
})
export class AppModule {}
