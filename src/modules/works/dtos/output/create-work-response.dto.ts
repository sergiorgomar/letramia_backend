import { IsUUID } from 'class-validator';

export class CreateWorkResponseDto {
  @IsUUID()
  id: string;
}
