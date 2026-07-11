import { Controller, Get, Post, Body } from '@nestjs/common';
import { WorksService } from './works.service';
import { CreateWorkDto } from './dtos/input/create-work.dto';

@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Get()
  findAll() {
    return this.worksService.findAll();
  }

  @Post()
  create(@Body() dto: CreateWorkDto) {
    return this.worksService.create(dto);
  }
}
