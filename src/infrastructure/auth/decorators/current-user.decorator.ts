import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { RequestUser } from '../types/request-user.types';

/**
 * Extrae `req.user` (tipo `RequestUser`) ya resuelto por `FirebaseAuthGuard`.
 *
 * @example
 * // Obtener el usuario completo
 * @Get('profile')
 * getProfile(@CurrentUser() user: RequestUser) { ... }
 *
 * @example
 * // Obtener sólo el uid de Firebase
 * @Get('profile')
 * getProfile(@CurrentUser('firebase') firebase: RequestUser['firebase']) { ... }
 */
export const CurrentUser = createParamDecorator(
  (
    data: keyof RequestUser | undefined,
    ctx: ExecutionContext,
  ): RequestUser | RequestUser[keyof RequestUser] | undefined => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: RequestUser }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
