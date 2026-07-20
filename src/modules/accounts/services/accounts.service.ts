import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN_PROVIDER } from '@/common/constants';
import { AppException } from '@/common/exceptions/app.exception';
import { ProviderName } from '@/infrastructure/auth/types/provider-name.enum';
import { AccountResult } from '../types/account-result.type';
import { UsersRepository } from '../repositories/users.repository';
import { CreateAccount } from '../types/create-account.type';

const CURRENT_AUTH_PROVIDER = ProviderName.SUPABASE;

@Injectable()
export class AccountsService {
  constructor(
    @Inject(SUPABASE_ADMIN_PROVIDER)
    private readonly supabaseAdmin: SupabaseClient,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createAccount(dto: CreateAccount): Promise<AccountResult> {
    const emailTaken = await this.usersRepository.existsByEmail(dto.email);
    if (emailTaken) {
      throw new AppException('ACCOUNT_ALREADY_EXISTS_IN_DB', { email: dto.email });
    }
    
    const { data, error } = await this.supabaseAdmin.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      user_metadata: { name: dto.name },
    });

    if (error) {
      if (error.code === 'email_exists' || error.status === 422) {
        throw new AppException(
          'ACCOUNT_ALREADY_EXISTS',
          { email: dto.email },
          error,
        );
      }
      throw new AppException(
        'SUPABASE_AUTH_ERROR',
        { email: dto.email },
        error,
      );
    }

    const user = await this.usersRepository.create({
      email: dto.email,
      providerName: CURRENT_AUTH_PROVIDER,
      providerId: data.user.id,
      userTypes: dto.userTypes,
    });

    return { id: user.id };
  }
}
