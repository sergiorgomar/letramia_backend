import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_PROVIDER } from '@/common/constants';
import { HandleErrors } from '@/common/decorators/handle-errors.decorator';
import { passwordResetTokenEntity } from '../entities/password-reset-token.entity';

type CreatePasswordResetToken = {
  hash: string;
  userId: string;
  expiresAt: Date;
};

@Injectable()
export class PasswordResetTokensRepository {
  constructor(
    @Inject(DATABASE_PROVIDER) private readonly db: PostgresJsDatabase,
  ) {}

  @HandleErrors('DATABASE_ERROR')
  async create(data: CreatePasswordResetToken): Promise<void> {
    await this.db.transaction(async (transaction) => {
      await transaction
        .update(passwordResetTokenEntity)
        .set({ usedAt: new Date() })
        .where(
          and(
            eq(passwordResetTokenEntity.userId, data.userId),
            isNull(passwordResetTokenEntity.usedAt),
          ),
        );

      await transaction.insert(passwordResetTokenEntity).values(data);
    });
  }

  @HandleErrors('DATABASE_ERROR')
  async consume(hash: string): Promise<{ userId: string } | undefined> {
    const [token] = await this.db
      .update(passwordResetTokenEntity)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(passwordResetTokenEntity.hash, hash),
          gt(passwordResetTokenEntity.expiresAt, new Date()),
          isNull(passwordResetTokenEntity.usedAt),
        ),
      )
      .returning({ userId: passwordResetTokenEntity.userId });

    return token;
  }
}
