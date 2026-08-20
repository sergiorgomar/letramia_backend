import { IsBoolean } from 'class-validator';
export class RecoverAccountResponseDto {
  @IsBoolean()
  ok: boolean;
}
