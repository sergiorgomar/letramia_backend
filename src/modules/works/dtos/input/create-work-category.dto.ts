import { IsString, MaxLength } from 'class-validator';

export class CreateWorkCategoryDto {
  @IsString()
  @MaxLength(100)
  name: string;
}
