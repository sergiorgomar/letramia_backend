import { createHash, randomBytes } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  SUPABASE_ADMIN_PROVIDER,
  SUPABASE_ANON_PROVIDER,
} from '@/common/constants';
import { AppException } from '@/common/exceptions/app.exception';
import { ProviderName } from '@/infrastructure/auth/types/provider-name.enum';
import { UserType } from '@/infrastructure/auth/types/user-type.enum';
import { ResendMailService } from '@/infrastructure/mail/resend-mail.service';
import { PasswordResetTokensRepository } from '../repositories/password-reset-tokens.repository';
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
    private readonly passwordResetTokensRepository: PasswordResetTokensRepository,
    private readonly mail: ResendMailService,
    private readonly config: ConfigService,
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

  async recoverAccount(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user || !user.active) return;

    const token = randomBytes(32).toString('base64url');
    const hash = createHash('sha256').update(token).digest('hex');

    // 1 hora
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.passwordResetTokensRepository.create({
      hash,
      userId: user.id,
      expiresAt,
    });

    const resetUrl = new URL(
      this.config.getOrThrow<string>('PASSWORD_RESET_URL'),
    );
    resetUrl.searchParams.set('hash', token);

    return this.mail.sendRecoverPassword(email, resetUrl.toString());
  }

  async resetPassword(hash: string, password: string): Promise<void> {
    const tokenHash = createHash('sha256').update(hash).digest('hex');
    const token = await this.passwordResetTokensRepository.consume(tokenHash);

    if (!token) {
      throw new AppException('PASSWORD_RESET_TOKEN_INVALID');
    }

    const user = await this.usersRepository.findById(token.userId);
    if (!user) {
      throw new AppException('PASSWORD_RESET_USER_NOT_FOUND');
    }

    const { error } = await this.supabaseAdmin.auth.admin.updateUserById(
      user.providerId,
      { password },
    );

    if (error) {
      throw new AppException('SUPABASE_AUTH_ERROR', { userId: user.id }, error);
    }
  }
}
