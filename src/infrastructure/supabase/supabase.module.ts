import { Global, Module } from '@nestjs/common';
import { SupabaseAdminProvider } from './supabase.provider';

@Global()
@Module({
  providers: [SupabaseAdminProvider],
  exports: [SupabaseAdminProvider],
})
export class SupabaseModule {}
