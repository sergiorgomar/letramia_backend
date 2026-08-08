import { IsUUID } from 'class-validator';

export class CreateWorkChapterResponseDto {
  @IsUUID()
  id: string;
}
