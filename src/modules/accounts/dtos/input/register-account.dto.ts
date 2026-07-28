import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  ArrayNotEmpty,
} from 'class-validator';
import { UserType } from '@/infrastructure/auth/types/user-type.enum';

export class RegisterAccountDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  // El usuario decide su(s) tipo(s) al registrarse: Escritor, Lector, o ambos.
  @ArrayNotEmpty()
  @IsEnum(UserType, { each: true })
  userTypes: UserType[];
}
