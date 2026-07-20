import { UserType } from './user-type.enum';

/**
 * Shape de `req.user` después de que `FirebaseAuthGuard` resuelve la request.
 * Disponible en cualquier handler/servicio a través del decorador `@CurrentUser()`.
 */
export interface RequestUser {
  id: string;
  name: string;
  email: string;
  active: boolean;
  user_type_id: string;
  user_type: UserType;
}
