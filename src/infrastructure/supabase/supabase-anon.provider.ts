import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_PROVIDER } from '@/common/constants';

// Cliente con la anon key: para operaciones que actúan "como el usuario"
// (ej. login), a diferencia del admin client que se salta las reglas de auth.
export const SupabaseAnonProvider: Provider = {
  provide: SUPABASE_ANON_PROVIDER,
  inject: [ConfigService],

  useFactory: (configService: ConfigService): SupabaseClient => {
    const url = configService.get<string>('SUPABASE_URL')!;
    const anonKey = configService.get<string>('SUPABASE_ANON_KEY')!;

    return createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  },
};
