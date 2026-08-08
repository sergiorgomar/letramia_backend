import { Cache } from 'cache-manager';
import type { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_ANON_PROVIDER } from '@/common/constants';
import { AppException } from '@/common/exceptions/app.exception';
import { UsersRepository } from '@/modules/accounts/repositories/users.repository';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RequestUser } from '../types/request-user.types';
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
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
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

    const accessToken = request.cookies.access_token;

    if (!accessToken) {
      throw new AppException('INVALID_TOKEN', { reason: 'missing_header' });
    }

    const { data, error } = await this.supabaseAnon.auth.getClaims(accessToken);
    const claims = data?.claims;
    if (error || !claims?.sub || typeof claims.email !== 'string') {
      throw new AppException('INVALID_TOKEN', {}, error);
    }

    const cacheKey = `user:${claims.sub}`;

    let user = await this.cacheManager.get<RequestUser>(cacheKey);

    if (!user) {
      const dbUser = await this.usersRepository.findByEmail(claims.email);

      if (!dbUser) {
        throw new AppException('ACCOUNT_NOT_FOUND', { email: claims.email });
      }

      if (!dbUser.active) {
        throw new AppException('ACCOUNT_DISABLED', { userId: dbUser.id });
      }

      user = {
        //id: '02eb4bbe-2b0e-404e-a953-eaecdcda888e',
        id: dbUser.id,
        email: claims.email,
        name: dbUser.name,
        active: dbUser.active,
      };

      const nowSeconds = Math.floor(Date.now() / 1000);
      const remainingMs = Math.max(0, (Number(claims.exp) - nowSeconds) * 1000);

      //🔥 TODO: revalidate: Al desactivar un usuario o cambiar userTypes,
      // invalida user:${supabaseUserId} inmediatamente.
      await this.cacheManager.set(
        cacheKey,
        user,
        Math.min(remainingMs, 60 * 60 * 1000),
      );
    } else {
      console.log('cached user');
    }

    const requestUser: RequestUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      active: user.active,
    };
    request.user = requestUser;
    return true;
  }
}
