import { IsBoolean } from 'class-validator';

export class ResetPasswordResponseDto {
  @IsBoolean()
  ok: boolean;
}
