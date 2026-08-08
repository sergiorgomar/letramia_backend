import { IsBoolean } from 'class-validator';

export class ChangeWorkChaptersOrderResponseDto {
  @IsBoolean()
  ok: boolean;
}
