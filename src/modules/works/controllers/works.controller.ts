import { Controller, Get, Post, Body } from '@nestjs/common';
import { ResponseDto } from '@/common/decorators/response-dto.decorator';
import { WorksService } from '../services/works.service';
import { CreateWorkDto } from '../dtos/input/create-work.dto';
import { WorkResponseDto } from '../dtos/output/work-response.dto';
import { CreateWorkResponseDto } from '../dtos/output/create-work-response.dto';

@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Get()
  @ResponseDto(WorkResponseDto, 'Obras obtenidas con éxito')
  findAll() {
    return this.worksService.findAll();
  }

  @Post()
  @ResponseDto(CreateWorkResponseDto, 'Obra creada con éxito')
  create(@Body() dto: CreateWorkDto): Promise<CreateWorkResponseDto> {
    return this.worksService.create(dto);
  }
}
