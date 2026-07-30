import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class UpdateWorkDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title: string;

  @IsUUID()
  @IsOptional()
  workThemeId: string;

  @IsString()
  @IsOptional()
  synopsis: string;
}
