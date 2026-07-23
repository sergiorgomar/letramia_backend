import { Controller, Get, Param, Query } from '@nestjs/common';
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

  @Get('work-categories')
  @ResponseDto(PublishedCategoryResponseDto, 'Categorías obtenidas con éxito')
  findAllCategories() {
    return this.publicWorksService.findAllCategories();
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
