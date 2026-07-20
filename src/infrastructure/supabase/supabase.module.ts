import { Global, Module } from '@nestjs/common';
import { SupabaseAdminProvider } from './supabase-admin.provider';
import { SupabaseAnonProvider } from './supabase-anon.provider';

@Global()
@Module({
  providers: [SupabaseAdminProvider, SupabaseAnonProvider],
  exports: [SupabaseAdminProvider, SupabaseAnonProvider],
})
export class SupabaseModule {}
