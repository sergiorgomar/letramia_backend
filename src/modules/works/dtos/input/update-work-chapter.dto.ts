import { IsString, MaxLength } from 'class-validator';

export class UpdateWorkChapterDto {
  @IsString()
  @MaxLength(255)
  title: string;
}
