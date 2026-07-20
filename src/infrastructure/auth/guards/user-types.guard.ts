import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_TYPES_KEY } from '../decorators/user-types.decorator';
// import type { Request } from 'express';
import { UserType } from '../types/user-type.enum';
// import { AppException } from '../../../common/exceptions/app.exception';
// import { ErrorCodes } from '../../../common/errors/error-codes';

@Injectable()
export class UserTypesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredUserTypes = this.reflector.getAllAndOverride<UserType[]>(
      USER_TYPES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Ruta sin tipos de usuario especificados
    if (!requiredUserTypes) return true;

    // Si no hay usuario en el context del request
    // const { user } = context.switchToHttp().getRequest<Request>();
    // if (!user)
    //   throw new AppException(ErrorCodes.GUARD_ROLE_USER_NOT_FOUND, {
    //     notFoundedUser: user,
    //   });

    // // Si no tiene el tipo de usuario necesario
    // const hasRequiredUserType = requiredUserTypes.includes(user.user_type);
    // if (!hasRequiredUserType)
    //   throw new AppException(ErrorCodes.GUARD_ROLE_INSUFFICIENT_PERMISSIONS, {
    //     requiredUserTypes,
    //     currentUserType: user.user_type,
    //   });

    return true;
  }
}
