import { IsUrl, IsUUID } from 'class-validator';

export class UploadWorkContentImageDTO {
  @IsUUID()
  id: string;

  @IsUrl({ require_tld: false })
  url: string;
}
