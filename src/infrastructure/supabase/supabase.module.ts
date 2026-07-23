import { Global, Module } from '@nestjs/common';
import { SupabaseAdminProvider } from './supabase-admin.provider';
import { SupabaseAnonProvider } from './supabase-anon.provider';
import { SupabaseStorageProvider } from './supabase-storage.provider';

@Global()
@Module({
  providers: [
    SupabaseAdminProvider,
    SupabaseAnonProvider,
    SupabaseStorageProvider,
  ],
  exports: [
    SupabaseAdminProvider,
    SupabaseAnonProvider,
    SupabaseStorageProvider,
  ],
})
export class SupabaseModule {}
