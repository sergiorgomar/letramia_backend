import { UserType } from './user-type.enum';

/**
 * Shape de `req.user` después de que `SupabaseAuthGuard` resuelve la request.
 * Disponible en cualquier handler/servicio a través del decorador `@CurrentUser()`.
 */
export interface RequestUser {
  id: string;
  email: string;
  userTypes: UserType[];
  active: boolean;
}
