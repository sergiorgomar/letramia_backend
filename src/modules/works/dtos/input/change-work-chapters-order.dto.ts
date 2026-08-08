import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class ChangeWorkChaptersOrderDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  chapterIds: string[];
}
