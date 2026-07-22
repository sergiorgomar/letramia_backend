import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  SUPABASE_ADMIN_PROVIDER,
  SUPABASE_ANON_PROVIDER,
} from '@/common/constants';
import { AppException } from '@/common/exceptions/app.exception';
import { ProviderName } from '@/infrastructure/auth/types/provider-name.enum';
import { AccountResult } from '../types/account-result.type';
import { LoginResult } from '../types/login-result.type';
import { UsersRepository } from '../repositories/users.repository';
import { CreateAccount } from '../types/create-account.type';
import { LoginAccountDto } from '../dtos/input/login-account.dto';
import { RefreshTokenDto } from '../dtos/input/refresh-token.dto';

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

  async createAccount(dto: CreateAccount): Promise<AccountResult> {
    const emailTaken = await this.usersRepository.existsByEmail(dto.email);
    if (emailTaken) {
      throw new AppException('ACCOUNT_ALREADY_EXISTS_IN_DB', {
        email: dto.email,
      });
    }
    const { data, error } = await this.supabaseAdmin.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
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
      name: dto.name,
      providerName: CURRENT_AUTH_PROVIDER,
      providerId: data.user.id,
      userTypes: dto.userTypes,
    });

    return { id: user.id };
  }

  async login(dto: LoginAccountDto): Promise<LoginResult> {
    const emailTaken = await this.usersRepository.existsByEmail(dto.email);
    if (!emailTaken) {
      throw new AppException('USER_DOESNT_EXIST_FOR_LOGIN', {
        email: dto.email,
      });
    }

    const { data, error } = await this.supabaseAnon.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      throw new AppException(
        'INVALID_CREDENTIALS',
        { email: dto.email },
        error,
      );
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at!,
    };
  }

  async refresh(dto: RefreshTokenDto): Promise<LoginResult> {
    const { data, error } = await this.supabaseAnon.auth.refreshSession({
      refresh_token: dto.refreshToken,
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
