import { Controller, Get, Post, Body } from '@nestjs/common';
import { WorkTypesService } from '../services/work-types.service';
import { CreateWorkTypeDto } from '../dtos/input/create-work-type.dto';
import { WorkTypeResponseDto } from '../dtos/output/work-type-response.dto';
import { ResponseDto } from '@/common/decorators/response-dto.decorator';

@Controller('work-types')
export class WorkTypesController {
  constructor(private readonly workTypesService: WorkTypesService) {}

  @Get()
  @ResponseDto(WorkTypeResponseDto, 'Tipos obtenidos con éxito')
  findAll() {
    return this.workTypesService.findAll();
  }

  @Post()
  @ResponseDto(WorkTypeResponseDto, 'Tipo creado con éxito')
  create(@Body() dto: CreateWorkTypeDto) {
    return this.workTypesService.create(dto);
  }
}
