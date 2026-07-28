import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ResponseDto } from '@/common/decorators/response-dto.decorator';
import { Public } from '@/infrastructure/auth/decorators/public.decorator';
import { PublicWorksService } from '../services/public-works.service';
import { ListPublishedWorksDto } from '../dtos/input/list-published-works.dto';
import { PublishedWorkResponseDto } from '../dtos/output/published-work-response.dto';
import { PublishedWorkDetailResponseDto } from '../dtos/output/published-work-detail-response.dto';
import { PublishedChapterContentResponseDto } from '../dtos/output/published-chapter-content-response.dto';
import { PublishedCategoryResponseDto } from '../dtos/output/published-category-response.dto';

// Catálogo público de la web de lectores: solo obras publicadas y sin sesión.
@Public()
@Controller('public')
export class PublicWorksController {
  constructor(private readonly publicWorksService: PublicWorksService) {}

  @Get('work-themes')
  @ResponseDto(PublishedCategoryResponseDto, 'Categorías obtenidas con éxito')
  findAllCategories() {
    return this.publicWorksService.findAllCategories();
  }

  @Get('work-genres')
  @ResponseDto(PublishedCategoryResponseDto, 'Tipos obtenidos con éxito')
  findAllTypes() {
    return this.publicWorksService.findAllTypes();
  }

  @Get('sitemap.xml')
  async sitemap(@Res() response: Response) {
    const xml = await this.publicWorksService.buildSitemap();
    response.setHeader('Content-Type', 'application/xml; charset=utf-8');
    response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600');
    response.send(xml);
  }

  @Get('works')
  @ResponseDto(PublishedWorkResponseDto, 'Obras obtenidas con éxito')
  findAll(@Query() query: ListPublishedWorksDto) {
    return this.publicWorksService.findAllPublished(query);
  }

  @Get('works/:slug')
  @ResponseDto(PublishedWorkDetailResponseDto, 'Obra obtenida con éxito')
  findOne(@Param('slug') slug: string) {
    return this.publicWorksService.findPublishedBySlug(slug);
  }

  @Get('works/:workSlug/chapters/:chapterSlug')
  @ResponseDto(
    PublishedChapterContentResponseDto,
    'Capítulo obtenido con éxito',
  )
  findChapter(
    @Param('workSlug') workSlug: string,
    @Param('chapterSlug') chapterSlug: string,
  ) {
    return this.publicWorksService.findPublishedChapter(workSlug, chapterSlug);
  }
}
