import { IsEnum } from 'class-validator';
import { WorkStatus } from '../../types/work-status.enum';

export class PublishWorkChapterResponseDto {
  @IsEnum(WorkStatus)
  status: WorkStatus;
}
