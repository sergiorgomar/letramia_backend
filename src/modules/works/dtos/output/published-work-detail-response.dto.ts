import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
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
  categoryId: string;

  @IsString()
  categoryName: string;

  @IsString()
  categorySlug: string;

  @IsUUID()
  typeId: string;

  @IsString()
  typeName: string;

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
