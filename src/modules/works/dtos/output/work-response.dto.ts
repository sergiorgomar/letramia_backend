import { IsDate, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

export class WorkResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsUUID()
  workCategoryId: string;

  @IsUUID()
  workTypeId: string;

  @IsString()
  @IsOptional()
  synopsis: string | null;

  @IsUrl()
  @IsOptional()
  coverUrl: string | null;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
