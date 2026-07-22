import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ResponseDto } from '@/common/decorators/response-dto.decorator';
import { WorksService } from '../services/works.service';
import { CreateWorkDto } from '../dtos/input/create-work.dto';
import { WorkResponseDto } from '../dtos/output/work-response.dto';
import { CreateWorkResponseDto } from '../dtos/output/create-work-response.dto';
import { RequestUser } from '@/infrastructure/auth/types/request-user.types';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';

@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Get()
  @ResponseDto(WorkResponseDto, 'Obras obtenidas con éxito')
  findAll(@CurrentUser() user: RequestUser) {
    return this.worksService.findAllByUser(user.id);
  }

  @Get(':id')
  @ResponseDto(WorkResponseDto, 'Obra obtenida con éxito')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.worksService.findOne(id, user.id);
  }

  @Post()
  @ResponseDto(CreateWorkResponseDto, 'Obra creada con éxito')
  create(
    @Body() dto: CreateWorkDto,
    @CurrentUser() user: RequestUser,
  ): Promise<CreateWorkResponseDto> {
    return this.worksService.create({ ...dto, userId: user.id });
  }

  @Patch(':id')
  @ResponseDto(WorkResponseDto, 'Obra actualizada con éxito')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateWorkDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.worksService.update(id, user.id, dto);
  }
}
