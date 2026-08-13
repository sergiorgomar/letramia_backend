import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateWorkDetailsDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  synopsis?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  workThemeSlug: string;
}
