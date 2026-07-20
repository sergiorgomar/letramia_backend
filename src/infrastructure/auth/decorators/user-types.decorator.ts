import { SetMetadata } from '@nestjs/common';
import { UserType } from '../types/user-type.enum';

export const USER_TYPES_KEY = 'userTypes';

/**
 * Define qué tipos de usuario (Escritor, Lector) pueden acceder a un endpoint.
 *
 * @example
 * @UserTypes(UserType.ESCRITOR)
 * @Get('works')
 * getWorks() { ... }
 */
export const UserTypes = (...userTypes: UserType[]) =>
  SetMetadata(USER_TYPES_KEY, userTypes);
