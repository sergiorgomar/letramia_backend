import { IsDate, IsInt, IsString, IsUUID } from 'class-validator';

export class GetWorkChaptersResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  workId: string;

  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsInt()
  sequence: number;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
