import { IsString, IsUUID } from 'class-validator';

export class PublishedCategoryResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  slug: string;
}
