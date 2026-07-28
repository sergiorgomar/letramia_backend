import { IsString, MaxLength } from 'class-validator';

export class CreateWorkGenreDto {
  @IsString()
  @MaxLength(100)
  name: string;
}
