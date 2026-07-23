import { IsString, MaxLength } from 'class-validator';

export class CreateWorkChapterDto {
  @IsString()
  @MaxLength(255)
  title: string;
}
