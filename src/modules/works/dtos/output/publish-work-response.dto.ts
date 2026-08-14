import { IsString } from 'class-validator';
import { WorkStatus } from '../../types/work-status.enum';

export class PublishWorkResponseDto {
  @IsString()
  status: WorkStatus;
}
