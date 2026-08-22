import { IsArray, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class WorkContentImageDTO {
  @IsUrl({ require_tld: false })
  url: string;
}

export class ListWorkContentImagesDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkContentImageDTO)
  images: WorkContentImageDTO[];
}
