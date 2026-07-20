import { UserType } from '@/infrastructure/auth/types/user-type.enum';

export type CreateAccount = {
  email: string;
  password: string;
  name: string;
  userTypes: UserType[];
}
