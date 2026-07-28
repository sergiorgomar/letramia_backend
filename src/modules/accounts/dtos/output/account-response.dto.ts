import { IsUUID } from 'class-validator';

export class AccountResponseDto {
  @IsUUID()
  id: string;
}
