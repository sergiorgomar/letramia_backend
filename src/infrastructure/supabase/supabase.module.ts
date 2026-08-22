import { Global, Module } from '@nestjs/common';
import { SupabaseAdminProvider } from './supabase-admin.provider';
import { SupabaseAnonProvider } from './supabase-anon.provider';
import { SupabaseStorageProvider } from './supabase-storage.provider';
import { LocalStorageProvider } from './local-storage.provider';
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
      useFactory: (supabaseClient: SupabaseClient, config: ConfigService) => {
        const useLocalStorage = config.get('STORAGE_DRIVER') === 'local';
        return useLocalStorage
          ? new LocalStorageProvider('private', config)
          : new SupabaseStorageProvider(supabaseClient, config, 'private');
      },
    },
    {
      provide: PUBLIC_STORAGE,
      inject: [SUPABASE_ADMIN_PROVIDER, ConfigService],
      useFactory: (supabaseClient: SupabaseClient, config: ConfigService) => {
        const useLocalStorage = config.get('STORAGE_DRIVER') === 'local';
        return useLocalStorage
          ? new LocalStorageProvider('public', config)
          : new SupabaseStorageProvider(supabaseClient, config, 'public');
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
