import { IsDate, IsString, IsUUID } from 'class-validator';

export class WorkTypeResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
