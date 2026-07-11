import { IsString, MaxLength } from 'class-validator';

export class CreateWorkTypeDto {
  @IsString()
  @MaxLength(100)
  name: string;
}
