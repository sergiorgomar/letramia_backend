import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseDto } from '@/common/decorators/response-dto.decorator';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { RequestUser } from '@/infrastructure/auth/types/request-user.types';

import { WorksFilesService } from '../services/works-files.service';
import { UploadWorkCoverDTO } from '../dtos/output/upload-work-cover.dto';
import { UploadWorkContentDTO } from '../dtos/output/upload-work-content.dto';
import { GetWorkManuscriptDTO } from '../dtos/input/get-work-manuscript.dto';
import { isUUID } from 'class-validator';
import { AppException } from '@/common/exceptions/app.exception';

const MAX_COVER_SIZE_BYTES = 5 * 1024 * 1024; // 5MiB
const MAX_CONTENT_SIZE_BYTES = 5 * 1024 * 1024; // 5MiB

@Controller('files/works')
export class WorksFilesController {
  constructor(private readonly worksFilesService: WorksFilesService) {}

  // Subir la portada de una obra
  @Post(':id/cover')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_COVER_SIZE_BYTES } }),
  )
  @ResponseDto(UploadWorkCoverDTO, 'Portada actualizada con éxito')
  async uploadCover(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file,
    @CurrentUser() user: RequestUser,
  ) {
    await this.worksFilesService.uploadCover(id, user.id, file);
    return { ok: true };
  }

  // Subir el contenido de una obra
  @Post(':id/content')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_CONTENT_SIZE_BYTES } }),
  )
  @ResponseDto(UploadWorkContentDTO, 'Contenido actualizado con éxito')
  async uploadContent(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file,
    @Body('chapterId') chapterId: string,
    @CurrentUser() user: RequestUser,
  ) {
    if (chapterId && !isUUID(chapterId, '4')) {
      throw new AppException('WORK_CHAPTER_NOT_UUID', { chapterId });
    }
    await this.worksFilesService.uploadContent(id, user.id, chapterId, file);
    return { ok: true };
  }

  // controller para obtener el contenido de una obra
  @Post(':workId/get-manuscript')
  @ResponseDto(GetWorkManuscriptDTO, 'Manuscrito obtenido con éxito')
  async getContent(
    @Param('workId', ParseUUIDPipe) workId: string,
    @Body('chapterId') chapterId: string,
    @CurrentUser() user: RequestUser,
  ) {
    if (chapterId && !isUUID(chapterId, '4')) {
      throw new AppException('WORK_CHAPTER_NOT_UUID', { chapterId });
    }
    const manuscript = await this.worksFilesService.getManuscript(
      workId,
      user.id,
      chapterId,
    );
    return { manuscript };
  }
}
