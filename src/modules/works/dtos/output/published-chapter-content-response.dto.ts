import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class PublishedChapterContentResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsInt()
  sequence: number;

  @IsString()
  @IsOptional()
  content: string | null;
}
