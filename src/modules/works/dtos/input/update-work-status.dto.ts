import { IsEnum } from 'class-validator';
import { WorkStatus } from '../../types/work-status.enum';

export class UpdateWorkStatusDto {
  @IsEnum(WorkStatus)
  status: WorkStatus;
}
