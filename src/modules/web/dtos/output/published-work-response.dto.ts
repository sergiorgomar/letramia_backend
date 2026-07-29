import { IsBoolean, IsDate, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

export class PublishedWorkResponseDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  synopsis: string | null;

  @IsString()
  authorName: string;

  @IsString()
  theme: string;

  @IsString()
  genre: string;

  @IsUrl()
  @IsOptional()
  thumbCoverUrl: string | null;
}
