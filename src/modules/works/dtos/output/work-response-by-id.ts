import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  IsDate,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { WorkStatus } from '../../types/work-status.enum';
import { Type } from 'class-transformer';

export class ChapterDTO {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsEnum(WorkStatus)
  status: WorkStatus;

  @IsDate()
  @IsOptional()
  publishedAt: Date | null;

  @IsArray()
  problems: Array<string>;

  @IsNumber()
  attemptsToPublish: number;

  @IsNumber()
  wordCount: number;

  @IsNumber()
  characterCount: number;
}

export class WorkResponseByIdDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsEnum(WorkStatus)
  status: WorkStatus;

  @IsString()
  @IsOptional()
  synopsis: string;

  @IsDate()
  updatedAt: Date;

  @IsDate()
  @IsOptional()
  publishedAt?: Date;

  @IsString()
  genreName: string;

  @IsString()
  themeName: string;

  @IsString()
  workThemeSlug: string;

  @IsBoolean()
  requiresSynopsis: boolean;

  @IsBoolean()
  supportsChapters: boolean;

  @IsNumber()
  attemptsToPublish: number;

  @IsArray()
  problems: Array<string>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChapterDTO)
  chapters: ChapterDTO[];

  //🔥 JUST FOR DEVELOP
  @IsUrl({ require_tld: false })
  @IsOptional()
  coverUrl: string | null;
}
