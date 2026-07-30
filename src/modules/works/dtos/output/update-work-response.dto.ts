import { IsUUID } from 'class-validator';

export class UpdateWorkResponseDto {
  @IsUUID()
  id: string;
}
