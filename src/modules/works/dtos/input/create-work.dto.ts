import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateWorkDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsUUID()
  workCategoryId: string;

  @IsUUID()
  workTypeId: string;

  @IsString()
  @IsOptional()
  synopsis: string;
}
