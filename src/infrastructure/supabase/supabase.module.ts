import { Global, Module } from '@nestjs/common';
import { STORAGE_PROVIDER } from '@/common/constants';
import { SupabaseAdminProvider } from './supabase-admin.provider';
import { SupabaseAnonProvider } from './supabase-anon.provider';
import { SupabaseStorageProvider } from './supabase-storage.provider';

@Global()
@Module({
  providers: [
    SupabaseAdminProvider,
    SupabaseAnonProvider,
    { provide: STORAGE_PROVIDER, useClass: SupabaseStorageProvider },
  ],
  exports: [SupabaseAdminProvider, SupabaseAnonProvider, STORAGE_PROVIDER],
})
export class SupabaseModule {}
