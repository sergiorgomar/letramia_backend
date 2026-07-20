import { IsString, IsNumber } from 'class-validator';

export class LoginResponseDto {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;

  @IsNumber()
  expiresAt: number;
}
