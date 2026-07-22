import { IsString, IsUUID } from 'class-validator';
export class MeResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;
}
