import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateWorkDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsUUID()
  workThemeId: string;

  @IsUUID()
  workGenreId: string;

  @IsString()
  @IsOptional()
  synopsis: string;
}
