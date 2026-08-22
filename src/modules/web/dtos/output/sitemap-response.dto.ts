import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';

import { GenreDTO, ThemeDTO } from './page-data-response.dto';

export class SitemapChapterDTO {
  @IsString()
  slug: string;
}

export class SitemapWorkDTO {
  @IsString()
  slug: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SitemapChapterDTO)
  chapters: SitemapChapterDTO[];
}

export class SitemapResponseDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ThemeDTO)
  themes: ThemeDTO[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GenreDTO)
  genres: GenreDTO[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SitemapWorkDTO)
  works: SitemapWorkDTO[];
}
