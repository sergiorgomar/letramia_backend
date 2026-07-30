import { IsEnum, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';
import { WorkStatus } from '../../types/work-status.enum';

export class WorkResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsEnum(WorkStatus)
  status: WorkStatus;

  @IsUrl()
  @IsOptional()
  coverUrl: string | null;
}
