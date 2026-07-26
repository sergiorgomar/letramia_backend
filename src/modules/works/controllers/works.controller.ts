import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { ResponseDto } from '@/common/decorators/response-dto.decorator';
import { WorksService } from '../services/works.service';
import { CreateWorkDto } from '../dtos/input/create-work.dto';
import { UpdateWorkStatusDto } from '../dtos/input/update-work-status.dto';
import { WorkResponseDto } from '../dtos/output/work-response.dto';
import { CreateWorkResponseDto } from '../dtos/output/create-work-response.dto';
import { DeleteWorkResponseDto } from '../dtos/output/delete-work-response.dto';
import { RequestUser } from '@/infrastructure/auth/types/request-user.types';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';

const MAX_COVER_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

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

  @Patch(':id/status')
  @ResponseDto(WorkResponseDto, 'Estado de la obra actualizado con éxito')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkStatusDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.worksService.updateStatus(id, user.id, dto);
  }

  @Post(':id/cover')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_COVER_SIZE_BYTES } }),
  )
  @ResponseDto(WorkResponseDto, 'Portada actualizada con éxito')
  uploadCover(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Request['file'],
    @CurrentUser() user: RequestUser,
  ) {
    return this.worksService.updateCover(id, user.id, file);
  }

  @Delete(':id')
  @ResponseDto(DeleteWorkResponseDto, 'Obra eliminada con éxito')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    await this.worksService.delete(id, user.id);
    return { id };
  }
}
