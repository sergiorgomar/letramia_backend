import { IsBoolean } from 'class-validator';

export class UploadWorkCoverDTO {
  @IsBoolean()
  ok: boolean;
}
