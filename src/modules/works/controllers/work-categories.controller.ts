import { Controller, Get, Post, Body } from '@nestjs/common';
import { WorkCategoriesService } from '../services/work-categories.service';
import { CreateWorkCategoryDto } from '../dtos/input/create-work-category.dto';
import { WorkCategoryResponseDto } from '../dtos/output/work-category-response.dto';
import { ResponseDto } from '@/common/decorators/response-dto.decorator';

@Controller('work-categories')
export class WorkCategoriesController {
  constructor(private readonly workCategoriesService: WorkCategoriesService) {}

  @Get()
  @ResponseDto(WorkCategoryResponseDto, 'Categorías obtenidas con éxito')
  findAll() {
    return this.workCategoriesService.findAll();
  }

  @Post()
  @ResponseDto(WorkCategoryResponseDto, 'Categoría creada con éxito')
  create(@Body() dto: CreateWorkCategoryDto) {
    return this.workCategoriesService.create(dto);
  }
}
