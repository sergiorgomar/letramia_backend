import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// infrastructure modules
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { AuthModule } from '@/infrastructure/auth/auth.module';
import { SupabaseModule } from '@/infrastructure/supabase/supabase.module';

// Bussines modules
import { SystemModule } from '@/modules/system/system.module';
import { WorksModule } from '@/modules/works/works.module';
import { AccountsModule } from '@/modules/accounts/accounts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    // infra
    DatabaseModule,
    AuthModule,
    SupabaseModule,

    // bussines
    SystemModule,
    WorksModule,
    AccountsModule,
  ],
})
export class AppModule {}
