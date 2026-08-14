import type { Request } from 'express';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { AppException } from '@/common/exceptions/app.exception';
import { AccountsService } from '../services/accounts.service';

export type RefreshedSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export type RefreshRequest = Request & {
  refreshedSession?: RefreshedSession;
};

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly accountsService: AccountsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RefreshRequest>();

    const refreshToken = request.cookies?.refresh_token;

    if (!refreshToken) {
      throw new AppException('INVALID_REFRESH_TOKEN', {
        reason: 'missing_cookie',
      });
    }

    // Supabase valida y rota el refresh token.
    // Si falla, AccountsService lanza INVALID_REFRESH_TOKEN.
    request.refreshedSession = await this.accountsService.refresh(refreshToken);

    return true;
  }
}
