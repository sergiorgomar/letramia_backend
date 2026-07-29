import { PublishedWorkSort } from '@/modules/works/types/published-work-sort.enum';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ListPublishedWorksDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  themeSlug?: string;

  @IsString()
  @IsOptional()
  genreSlug?: string;

  @IsEnum(PublishedWorkSort)
  @IsOptional()
  sort?: PublishedWorkSort;
}
