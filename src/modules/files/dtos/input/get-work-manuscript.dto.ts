import { IsString } from 'class-validator';

export class GetWorkManuscriptDTO {
  @IsString()
  manuscript: string;
}
