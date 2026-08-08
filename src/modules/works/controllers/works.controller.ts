import {
  Controller,
  Get,
  Post,
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
import { WorkResponseByIdDto } from '../dtos/output/work-response-by-id';

@Controller('works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  // Obtener las obras de un usuario
  @Get()
  @ResponseDto(WorkResponseDto, 'Obras literarias obtenidas con éxito')
  findAll(@CurrentUser() user: RequestUser): Promise<WorkResponseDto[]> {
    return this.worksService.findAllWorksByUser(user.id);
  }

  // Obtener el detalle de 1 libro dado 1 ID.
  @Get(':id')
  @ResponseDto(WorkResponseByIdDto, 'Obra literaria obtenida con éxito')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<WorkResponseByIdDto> {
    return this.worksService.findOne(id, user.id);
  }

  // Crear los datos de una obra (no incluye cover)
  @Post()
  @ResponseDto(CreateWorkResponseDto, 'Obra literaria creada con éxito')
  create(
    @Body() dto: CreateWorkDto,
    @CurrentUser() user: RequestUser,
  ): Promise<CreateWorkResponseDto> {
    return this.worksService.create({ ...dto, userId: user.id });
  }

  //🔥 Actualizar los datos de una obra (no incluye cover)
  //🔥 TODO: Eliminar una obra
  //🔥 TODO: Verificar si el slug de una obra se repite
}
