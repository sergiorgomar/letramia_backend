import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  SUPABASE_ADMIN_PROVIDER,
  SUPABASE_ANON_PROVIDER,
} from '@/common/constants';
import { AppException } from '@/common/exceptions/app.exception';
import { ProviderName } from '@/infrastructure/auth/types/provider-name.enum';
import { UserType } from '@/infrastructure/auth/types/user-type.enum';
import { UsersRepository } from '../repositories/users.repository';

const CURRENT_AUTH_PROVIDER = ProviderName.SUPABASE;

@Injectable()
export class AccountsService {
  constructor(
    @Inject(SUPABASE_ADMIN_PROVIDER)
    private readonly supabaseAdmin: SupabaseClient,
    @Inject(SUPABASE_ANON_PROVIDER)
    private readonly supabaseAnon: SupabaseClient,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createAccount(
    email: string,
    password: string,
    name: string,
    userTypes: UserType[],
  ) {
    if (email.includes('letramia')) {
      throw new AppException('NOT_ADMITED_MAIL', { email: email });
    }
    const emailTaken = await this.usersRepository.existsByEmail(email);
    if (emailTaken) {
      throw new AppException('ACCOUNT_ALREADY_EXISTS_IN_DB', {
        email: email,
      });
    }
    const { data, error } = await this.supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

    if (error) {
      if (error.code === 'email_exists' || error.status === 422) {
        throw new AppException(
          'ACCOUNT_ALREADY_EXISTS',
          { email: email },
          error,
        );
      }
      throw new AppException('SUPABASE_AUTH_ERROR', { email }, error);
    }

    const user = await this.usersRepository.create({
      email: email,
      name: name,
      providerName: CURRENT_AUTH_PROVIDER,
      providerId: data.user.id,
      userTypes: userTypes,
    });

    return { id: user.id };
  }

  async login(email: string, password: string) {
    const emailTaken = await this.usersRepository.existsByEmail(email);
    if (!emailTaken) {
      throw new AppException('USER_DOESNT_EXIST_FOR_LOGIN', {
        email: email,
      });
    }

    const { data, error } = await this.supabaseAnon.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      throw new AppException('INVALID_CREDENTIALS', { email }, error);
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at!,
    };
  }

  async refresh(refreshToken: string) {
    const { data, error } = await this.supabaseAnon.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new AppException('INVALID_REFRESH_TOKEN', {}, error);
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at!,
    };
  }
}
