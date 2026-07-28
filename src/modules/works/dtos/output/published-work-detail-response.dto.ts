import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  IsBoolean,
  ValidateNested,
} from 'class-validator';

export class PublishedWorkChapterResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsInt()
  sequence: number;
}

export class PublishedWorkDetailResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  synopsis: string | null;

  @IsString()
  authorName: string;

  @IsUUID()
  themeId: string;

  @IsString()
  themeName: string;

  @IsString()
  themeSlug: string;

  @IsUUID()
  genreId: string;

  @IsString()
  genreName: string;

  @IsBoolean()
  isPoem: boolean;

  @IsString()
  @IsOptional()
  content: string | null;

  @IsUrl()
  @IsOptional()
  coverUrl: string | null;

  @IsDate()
  createdAt: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublishedWorkChapterResponseDto)
  chapters: PublishedWorkChapterResponseDto[];
}
