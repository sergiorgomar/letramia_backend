import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { WorkStatus } from '../../types/work-status.enum';

export class WorkResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsUUID()
  workCategoryId: string;

  @IsUUID()
  workTypeId: string;

  @IsString()
  @IsOptional()
  synopsis: string | null;

  @IsEnum(WorkStatus)
  status: WorkStatus;

  @IsUrl()
  @IsOptional()
  coverUrl: string | null;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
