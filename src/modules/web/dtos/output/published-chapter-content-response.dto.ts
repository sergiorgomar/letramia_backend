import { IsInt, IsOptional, IsString } from 'class-validator';

export class PublishedChapterContentResponseDto {
  @IsString()
  workSlug: string;

  @IsInt()
  totalChapters: number;

  @IsString()
  bookThemeName: string;

  @IsString()
  bookThemeSlug: string;

  @IsString()
  authorName: string;

  @IsString()
  chapterTitle: string;

  @IsInt()
  chapterSequence: number;

  @IsString()
  @IsOptional()
  nextChapterSlug: string | null;

  @IsString()
  @IsOptional()
  previousChapterSlug: string | null;

  @IsString()
  @IsOptional()
  chapterContent: string | null;
}
