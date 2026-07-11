import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_PROVIDER } from '@/common/constants';

@Injectable()
export class SystemService {
  constructor(
    @Inject(DATABASE_PROVIDER) private readonly db: PostgresJsDatabase,
  ) {}

  async healthCheck(): Promise<string> {
    const r = await this.db.execute(sql`select * from public.books_categories`);
    console.log('Health check result:', r);
    return 'System is healthy';
  }
}
