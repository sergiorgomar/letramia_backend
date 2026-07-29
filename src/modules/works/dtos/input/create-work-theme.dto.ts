import { IsString, MaxLength } from 'class-validator';

export class CreateWorkThemeDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(100)
  slug: string;
}
