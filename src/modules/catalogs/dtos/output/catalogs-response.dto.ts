import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class ThemeCatalogDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  slug: string;
}

export class GenreCatalogDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsBoolean()
  requiresSynopsis: string;

  @IsBoolean()
  supportsChapters: string;
}

export class CatalogsResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ThemeCatalogDto)
  themes: ThemeCatalogDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GenreCatalogDto)
  genres: GenreCatalogDto[];
}
