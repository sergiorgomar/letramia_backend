import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class SponsorBannerDTO {
  @IsUrl()
  imageUrl: string;

  @IsString()
  title: string;

  @IsString()
  slug: string;
}

export class ThemeDTO {
  @IsUUID()
  id: string;

  @IsString()
  name: string;
}

export class GenreDTO {
  @IsUUID()
  id: string;

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

  @IsOptional()
  thumbCoverUrl: string | null;
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
