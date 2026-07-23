import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class WorkChapterDetailResponseDto {
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

  @IsString()
  @IsOptional()
  content: string | null;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
