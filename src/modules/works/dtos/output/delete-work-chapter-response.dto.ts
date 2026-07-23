import { IsUUID } from 'class-validator';

export class DeleteWorkChapterResponseDto {
  @IsUUID()
  id: string;
}
