import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateWorkChapterTitleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;
}
