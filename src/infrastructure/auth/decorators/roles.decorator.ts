import { SetMetadata } from '@nestjs/common';
import { RoleName } from '../types/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Define los roles requeridos para acceder a un endpoint.
 *
 * @example
 * @Roles(RoleName.ADMIN, RoleName.SUPERVISOR)
 * @Get('users')
 * getUsers() { ... }
 */
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
