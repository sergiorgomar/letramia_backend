import { Controller, Get, Param, Query } from '@nestjs/common';

import { Public } from '@/infrastructure/auth/decorators/public.decorator';

import { ResponseDto } from '@/common/decorators/response-dto.decorator';

import { WebService } from '../services/web.service';
import { PageDataDTO } from '../dtos/output/page-data-response.dto';
import { WorkResponseDto } from '../dtos/output/work-response.dto';
import { PublishedWorkResponseDto } from '../dtos/output/published-work-response.dto';
import { ListPublishedWorksDto } from '../dtos/output/list-published-works.dto';
import { PublishedChapterContentResponseDto } from '../dtos/output/published-chapter-content-response.dto';
import { SitemapResponseDTO } from '../dtos/output/sitemap-response.dto';

@Public()
@Controller('web')
export class WebController {
  constructor(private readonly webService: WebService) {}

  // controller para todo lo de la pagina principal
  @Get('page-data')
  @ResponseDto(PageDataDTO)
  getPageData(): Promise<PageDataDTO> {
    return this.webService.getPageData();
  }

  @Get('sitemap')
  @ResponseDto(SitemapResponseDTO)
  getSitemap(): Promise<SitemapResponseDTO> {
    return this.webService.getSitemapData();
  }

  // controller para el detalle de una obra
  @Get(':slug/info')
  @ResponseDto(WorkResponseDto)
  getWork(@Param('slug') slug: string) {
    return this.webService.getWorkInfo(slug);
  }

  // controller para datos de una sección, con query
  @Get('query')
  @ResponseDto(PublishedWorkResponseDto)
  findByQuery(@Query() query: ListPublishedWorksDto) {
    return this.webService.findByQuery({ ...query });
  }

  // controller para obtener el contenido de un capitulo, la lectura.
  @Get(':workSlug/:chapterSlug/content')
  @ResponseDto(PublishedChapterContentResponseDto)
  findChapter(
    @Param('workSlug') workSlug: string,
    @Param('chapterSlug') chapterSlug: string,
  ) {
    return this.webService.findChapterContent(workSlug, chapterSlug);
  }
}
