import { IsDate, IsInt, IsString, IsUUID } from 'class-validator';

export class GetWorkChapterResponseDto {
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
