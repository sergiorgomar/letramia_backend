import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { DATABASE_PROVIDER } from '@/common/constants';
import { HandleErrors } from '@/common/decorators/handle-errors.decorator';
import { UserType } from '@/infrastructure/auth/types/user-type.enum';
import { ProviderName } from '@/infrastructure/auth/types/provider-name.enum';
import { userEntity } from '../entities/user.entity';

export type UserEntity = typeof userEntity.$inferSelect;
export type CreateUserEntity = {
  email: string;
  providerName: ProviderName;
  providerId: string;
  userTypes: UserType[];
};

@Injectable()
export class UsersRepository {
  constructor(
    @Inject(DATABASE_PROVIDER) private readonly db: PostgresJsDatabase,
  ) {}

  @HandleErrors('DATABASE_ERROR')
  async create(data: CreateUserEntity): Promise<UserEntity> {
    const [row] = await this.db.insert(userEntity).values(data).returning();
    return row;
  }

  @HandleErrors('DATABASE_ERROR')
  async existsByEmail(email: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: userEntity.id })
      .from(userEntity)
      .where(eq(userEntity.email, email))
      .limit(1);
    return !!row;
  }

  @HandleErrors('DATABASE_ERROR')
  async findByEmail(email: string): Promise<UserEntity | undefined> {
    const [row] = await this.db
      .select()
      .from(userEntity)
      .where(eq(userEntity.email, email))
      .limit(1);
    return row;
  }
}
