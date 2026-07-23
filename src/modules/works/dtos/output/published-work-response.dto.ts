import { IsDate, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

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
  categoryId: string;

  @IsString()
  categoryName: string;

  @IsString()
  categorySlug: string;

  @IsUrl()
  @IsOptional()
  coverUrl: string | null;

  @IsDate()
  createdAt: Date;
}
