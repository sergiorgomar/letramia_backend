import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class ChapterDTO {
  @IsString()
  slug: string;

  @IsString()
  title: string;
}

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
  themeSlug: string;

  @IsString()
  genreSlug: string;

  @IsString()
  authorName: string;

  @IsNumber()
  chapterCount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChapterDTO)
  chapters: ChapterDTO[];

  //🔥 JUST FOR DEVELOP
  @IsUrl({ require_tld: false })
  @IsOptional()
  coverUrl: string;

  @IsString()
  @IsOptional()
  text: string | null;
}
