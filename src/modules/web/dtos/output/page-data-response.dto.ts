import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsDate,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class SponsorBannerDTO {
  //🔥 JUST FOR DEVELOP
  @IsUrl({ require_tld: false })
  @IsOptional()
  imageUrl: string;

  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  authorName: string;

  @IsDate()
  publishedAt: Date;

  @IsString()
  @IsOptional()
  synopsis: string;

  @IsString()
  genreName: string;

  @IsString()
  themeName: string;
}

export class ThemeDTO {
  @IsString()
  slug: string;

  @IsString()
  name: string;
}

export class GenreDTO {
  @IsString()
  slug: string;

  @IsString()
  name: string;
}

export class LastWorkDTO {
  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  synopsis: string | null;

  @IsString()
  authorName: string;

  @IsString()
  themeName: string;

  @IsString()
  genreName: string;

  @IsDate()
  publishedAt: Date;

  @IsOptional()
  coverUrl: string | null;
}

export class PageDataDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SponsorBannerDTO)
  sponsorBanner: SponsorBannerDTO[];

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
  @Type(() => LastWorkDTO)
  lastWorks: LastWorkDTO[];
}
