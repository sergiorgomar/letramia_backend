import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateWorkDetailsDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  synopsis?: string;

  @IsString()
  workThemeSlug: string;
}
