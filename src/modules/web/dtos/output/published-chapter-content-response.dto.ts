import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class PublishedChapterContentResponseDto {
  @IsString()
  title: string;

  @IsInt()
  sequence: number;

  @IsString()
  @IsOptional()
  content: string | null;
}
