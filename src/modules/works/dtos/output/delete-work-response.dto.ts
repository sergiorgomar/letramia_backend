import { IsUUID } from 'class-validator';

export class DeleteWorkResponseDto {
  @IsUUID()
  id: string;
}
