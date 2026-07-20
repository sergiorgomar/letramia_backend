import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

//import { FirebaseProvider } from '../../firebase/firebase.provider';
//import { UsersRepository } from '../../../modules/users/repositories/users.repository';
import { AppException } from '../../../common/exceptions/app.exception';
// import { ErrorCodes } from '../../../common/errors/error-codes';

/**
 * Guard global de autenticación con Firebase ID Token.
 *
 * Flujo:
 * 1. Si el endpoint está marcado con @Public() → pasa sin validar.
 * 2. Lee el header `Authorization: Bearer <token>`.
 * 3. Verifica el token con Firebase Admin (`verifyIdToken`).
 * 4. Resuelve el usuario local por uid (o email como fallback).
 * 5. Adjunta `req.user: RequestUser`.
 * 6. Errores:
 *    - Sin token / token inválido → 401 Unauthorized
 *    - Usuario local no encontrado / inactivo → 403 Forbidden
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    // private readonly firebase: FirebaseProvider,
    // private readonly usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    //const request = context.switchToHttp().getRequest<Request>();

    throw new AppException('NO_AUTORIZADO', { details: 'Token expirado' });

    // Extraer el Bearer token
    // const authHeader = request.headers.authorization;
    // if (!authHeader) throw new AppException(ErrorCodes.GUARD_TOKEN_REQUIRED);
    // if (!authHeader?.startsWith('Bearer '))
    //   throw new AppException(ErrorCodes.GUARD_TOKEN_MALFORMED, {
    //     malformedToken: authHeader,
    //   });

    // // Verificar el token con Firebase
    // const token = authHeader.slice(7);
    // const decodedToken = await this.firebase.verifyIdToken(token);

    // // verificar que el usuario de firebase exist Y no este deshabilitado
    // const firebaseUser = await this.firebase.getUser(decodedToken.uid);
    // if (!firebaseUser || firebaseUser.disabled)
    //   throw new AppException(ErrorCodes.GUARD_USER_FIREBASE_NOT_ACTIVE, {
    //     deactivatedUser: firebaseUser,
    //   });

    // // verificar que el usuario exista en base de datos
    // const user = await this.usersRepository.findWithRoleByEmail(
    //   decodedToken.email ?? '',
    // );
    // if (!user)
    //   throw new AppException(ErrorCodes.GUARD_USER_DB_NOT_FOUND, {
    //     userEmail: decodedToken.email,
    //   });

    // // verificar que el usuario esté habilitado
    // if (!user.active)
    //   throw new AppException(ErrorCodes.GUARD_USER_DB_NOT_ACTIVE, {
    //     inactiveUser: user,
    //   });

    // // Verificar que el id de usuario en db coincida con el de UID firebase,
    // // si no es así, significa, que no se ha ha aceptado la invitación
    // if (user.id !== decodedToken.uid)
    //   throw new AppException(ErrorCodes.GUARD_USER_NOT_COMPLETED, {
    //     databaseUserId: user.id,
    //     firebaseUserUID: decodedToken.uid,
    //   });

    // request.user = {
    //   id: user.id,
    //   name: user.name,
    //   email: user.email,
    //   active: user.active,
    //   role_id: user.role_id,
    //   role_identifier: user.role_identifier, // NECESITO EL ROLE NAME
    // };

    return true;
  }
}
