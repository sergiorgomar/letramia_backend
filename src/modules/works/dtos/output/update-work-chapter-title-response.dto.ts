import { IsUUID } from 'class-validator';

export class UpdateWorkChapterTitleResponseDto {
  @IsUUID()
  id: string;
}
