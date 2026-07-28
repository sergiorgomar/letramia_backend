import { Controller, Get, Post, Body } from '@nestjs/common';
import { WorkThemesService } from '../services/work-themes.service';
import { CreateWorkThemeDto } from '../dtos/input/create-work-theme.dto';
import { WorkThemeResponseDto } from '../dtos/output/work-theme-response.dto';
import { ResponseDto } from '@/common/decorators/response-dto.decorator';

@Controller('work-themes')
export class WorkThemesController {
  constructor(private readonly workThemesService: WorkThemesService) {}

  @Get()
  @ResponseDto(WorkThemeResponseDto, 'Temáticas obtenidas con éxito')
  findAll() {
    return this.workThemesService.findAll();
  }

  @Post()
  @ResponseDto(WorkThemeResponseDto, 'Temática creada con éxito')
  create(@Body() dto: CreateWorkThemeDto) {
    return this.workThemesService.create(dto);
  }
}
