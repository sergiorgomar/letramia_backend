import { IsBoolean } from 'class-validator';

export class UploadWorkContentDTO {
  @IsBoolean()
  ok: boolean;
}
