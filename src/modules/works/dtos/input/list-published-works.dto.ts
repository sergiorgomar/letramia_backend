import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PublishedWorkSort } from '../../types/published-work-sort.enum';

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
