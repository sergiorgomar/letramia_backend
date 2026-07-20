import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN_PROVIDER } from '@/common/constants';

export const SupabaseAdminProvider: Provider = {
  provide: SUPABASE_ADMIN_PROVIDER,
  inject: [ConfigService],

  useFactory: (configService: ConfigService): SupabaseClient => {
    const url = configService.get<string>('SUPABASE_URL')!;
    const serviceRoleKey = configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    )!;

    return createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  },
};
