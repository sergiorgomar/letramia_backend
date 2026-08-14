import { IsOptional, IsString, IsUrl } from 'class-validator';

export class PublishedWorkResponseDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  synopsis: string | null;

  @IsString()
  authorName: string;

  @IsString()
  theme: string;

  @IsString()
  genre: string;

  //🔥 JUST FOR DEVELOP
  @IsUrl({ require_tld: false })
  @IsOptional()
  thumbCoverUrl: string | null;
}
