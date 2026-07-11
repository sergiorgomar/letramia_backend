import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DATABASE_PROVIDER } from '@/common/constants';

export const DatabaseProvider: Provider = {
  provide: DATABASE_PROVIDER,
  inject: [ConfigService],

  useFactory: (configService: ConfigService): PostgresJsDatabase => {
    const connectionString = configService.get<string>('DATABASE_URL')!;
    const client = postgres(connectionString, {
      // Required if DATABASE_URL points at Supabase's pooler (PgBouncer, port 6543)
      // in transaction mode, which doesn't support prepared statements.
      prepare: false,
    });
    return drizzle(client, { logger: true });
  },
};
