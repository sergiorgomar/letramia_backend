import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { userEntity } from './user.entity';

export const passwordResetTokenEntity = pgTable('password_reset_tokens', {
  hash: varchar('hash', { length: 64 }).primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => userEntity.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
});
