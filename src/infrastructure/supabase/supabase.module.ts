import { Global, Module } from '@nestjs/common';
import { SupabaseAdminProvider } from './supabase-admin.provider';
import { SupabaseAnonProvider } from './supabase-anon.provider';
import { SupabaseStorageProvider } from './supabase-storage.provider';
import {
  SUPABASE_ADMIN_PROVIDER,
  PRIVATE_STORAGE,
  PUBLIC_STORAGE,
} from '@/common/constants';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';

@Global()
@Module({
  providers: [
    SupabaseAdminProvider,
    SupabaseAnonProvider,
    {
      provide: PRIVATE_STORAGE,
      inject: [SUPABASE_ADMIN_PROVIDER, ConfigService],
      useFactory: (supabase: SupabaseClient, config: ConfigService) => {
        return new SupabaseStorageProvider(
          supabase,
          config.get<string>('SUPABASE_PRIVATE_BUCKET')!,
        );
      },
    },
    {
      provide: PUBLIC_STORAGE,
      inject: [SUPABASE_ADMIN_PROVIDER, ConfigService],
      useFactory: (supabase: SupabaseClient, config: ConfigService) => {
        return new SupabaseStorageProvider(
          supabase,
          config.get<string>('SUPABASE_PUBLIC_BUCKET')!,
        );
      },
    },
  ],
  exports: [
    SupabaseAdminProvider,
    SupabaseAnonProvider,
    PRIVATE_STORAGE,
    PUBLIC_STORAGE,
  ],
})
export class SupabaseModule {}
