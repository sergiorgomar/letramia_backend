import { RoleName } from './role.enum';

/**
 * Shape de `req.user` después de que `FirebaseAuthGuard` resuelve la request.
 * Disponible en cualquier handler/servicio a través del decorador `@CurrentUser()`.
 */
export interface RequestUser {
  id: string;
  name: string;
  email: string;
  active: boolean;
  role_id: string;
  role_identifier: RoleName;
}
