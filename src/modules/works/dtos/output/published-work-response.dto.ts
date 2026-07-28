import { IsBoolean, IsDate, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

export class PublishedWorkResponseDto {
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

  @IsUrl()
  @IsOptional()
  coverUrl: string | null;

  @IsDate()
  createdAt: Date;
}
