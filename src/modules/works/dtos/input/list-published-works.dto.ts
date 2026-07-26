import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PublishedWorkSort } from '../../types/published-work-sort.enum';

export class ListPublishedWorksDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  categorySlug?: string;

  @IsString()
  @IsOptional()
  typeSlug?: string;

  @IsEnum(PublishedWorkSort)
  @IsOptional()
  sort?: PublishedWorkSort;
}
