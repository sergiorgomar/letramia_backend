import { IsEmail, IsEnum, IsUUID } from 'class-validator';
import { UserType } from '@/infrastructure/auth/types/user-type.enum';

export class MeResponseDto {
  @IsUUID()
  id: string;
}
