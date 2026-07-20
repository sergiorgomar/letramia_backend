import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
// import type { Request } from 'express';
import { RoleName } from '../types/role.enum';
// import { AppException } from '../../../common/exceptions/app.exception';
// import { ErrorCodes } from '../../../common/errors/error-codes';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Ruta sin roles especificados
    if (!requiredRoles) return true;

    // Si no hay usuario en el context del request
    // const { user } = context.switchToHttp().getRequest<Request>();
    // if (!user)
    //   throw new AppException(ErrorCodes.GUARD_ROLE_USER_NOT_FOUND, {
    //     notFoundedUser: user,
    //   });

    // // Si no tiene el rol necesario
    // const hasRequiredRole = requiredRoles.includes(user.role_identifier);
    // if (!hasRequiredRole)
    //   throw new AppException(ErrorCodes.GUARD_ROLE_INSUFFICIENT_PERMISSIONS, {
    //     requiredRoles,
    //     currentRole: user.role_identifier,
    //   });

    return true;
  }
}
