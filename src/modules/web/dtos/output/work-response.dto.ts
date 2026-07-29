import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class WorkResponseDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  synopsis: string;

  @IsDate()
  publishedAt: Date;

  @IsString()
  themeName: string;

  @IsString()
  genreName: string;

  @IsString()
  authorName: string;

  @IsNumber()
  chapterCount: number;

  @IsString()
  @IsOptional()
  text: string | null;
}
