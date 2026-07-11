import { IsDate, IsString, IsUUID } from 'class-validator';

export class WorkCategoryResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
