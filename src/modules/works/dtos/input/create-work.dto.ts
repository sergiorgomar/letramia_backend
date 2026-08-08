import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateWorkDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  workThemeSlug: string;

  @IsString()
  workGenreSlug: string;

  @IsString()
  @IsOptional()
  synopsis: string;
}
