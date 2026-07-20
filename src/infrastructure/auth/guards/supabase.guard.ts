import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RequestUser } from '../types/request-user.types';
import { SUPABASE_ANON_PROVIDER } from '@/common/constants';
import { AppException } from '@/common/exceptions/app.exception';
import { UsersRepository } from '@/modules/accounts/repositories/users.repository';

/**
 * Guard global de autenticación con el access token de Supabase.
 *
 * Flujo:
 * 1. Si el endpoint está marcado con @Public() → pasa sin validar.
 * 2. Lee el header `Authorization: Bearer <token>`.
 * 3. Verifica el token contra Supabase (`auth.getUser`).
 * 4. Resuelve el usuario local por email (fuente de la verdad, ver user.entity.ts).
 * 5. Adjunta `req.user: RequestUser`.
 * 6. Errores:
 *    - Sin token / token inválido → 401 (INVALID_TOKEN)
 *    - Usuario local no encontrado → 401 (ACCOUNT_NOT_FOUND)
 *    - Usuario local deshabilitado → 403 (ACCOUNT_DISABLED)
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(SUPABASE_ANON_PROVIDER)
    private readonly supabaseAnon: SupabaseClient,
    private readonly usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: RequestUser }>();

    const authHeader = request.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;

    if (!accessToken) {
      throw new AppException('INVALID_TOKEN', { reason: 'missing_header' });
    }

    const { data, error } = await this.supabaseAnon.auth.getUser(accessToken);
    if (error || !data.user?.email) {
      throw new AppException('INVALID_TOKEN', {}, error);
    }

    const user = await this.usersRepository.findByEmail(data.user.email);
    if (!user) {
      throw new AppException('ACCOUNT_NOT_FOUND', { email: data.user.email });
    }

    if (!user.active) {
      throw new AppException('ACCOUNT_DISABLED', { userId: user.id });
    }

    request.user = {
      id: user.id,
      email: user.email,
      userTypes: user.userTypes,
      active: user.active,
    };

    return true;
  }
}
