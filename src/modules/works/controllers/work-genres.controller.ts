import { Controller, Get, Post, Body } from '@nestjs/common';
import { WorkGenresService } from '../services/work-genres.service';
import { CreateWorkGenreDto } from '../dtos/input/create-work-genre.dto';
import { WorkGenreResponseDto } from '../dtos/output/work-genre-response.dto';
import { ResponseDto } from '@/common/decorators/response-dto.decorator';

@Controller('work-genres')
export class WorkGenresController {
  constructor(private readonly workGenresService: WorkGenresService) {}

  @Get()
  @ResponseDto(WorkGenreResponseDto, 'Géneros obtenidos con éxito')
  findAll() {
    return this.workGenresService.findAll();
  }

  @Post()
  @ResponseDto(WorkGenreResponseDto, 'Género creado con éxito')
  create(@Body() dto: CreateWorkGenreDto) {
    return this.workGenresService.create(dto);
  }
}
