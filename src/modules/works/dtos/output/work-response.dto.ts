import { IsEnum, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';
import { WorkStatus } from '../../types/work-status.enum';

export class WorkResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsEnum(WorkStatus)
  status: WorkStatus;

  @IsString()
  themeName: string;

  @IsString()
  genreName: string;

  //🔥 JUST FOR DEVELOP
  @IsUrl({ require_tld: false })
  @IsOptional()
  coverUrl: string | null;
}
