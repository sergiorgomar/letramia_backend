import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class ReorderWorkChaptersDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  chapterIds: string[];
}
