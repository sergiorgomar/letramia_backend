import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { join } from 'node:path';

// infrastructure modules
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AuthModule } from '@/infrastructure/auth/auth.module';
import { SupabaseModule } from '@/infrastructure/supabase/supabase.module';
import { ImageModule } from '@/infrastructure/image/image.module';
import { MailModule } from '@/infrastructure/mail/mail.module';

// Bussines modules
import { SystemModule } from '@/modules/system/system.module';
import { WorksModule } from '@/modules/works/works.module';
import { AccountsModule } from '@/modules/accounts/accounts.module';
import { FilesModule } from '@/modules/files/files.module';
import { WebModule } from '@/modules/web/web.module';
import { CatalogsModule } from '@/modules/catalogs/catalogs.module';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
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
    MailModule,

    // bussines
    FilesModule,
    SystemModule,
    WorksModule,
    //🔥IT would be a microservice in ahoter deploy
    WebModule,
    AccountsModule,
    CatalogsModule,
  ],
})
export class AppModule {}
