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
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { RequestUser } from '@/infrastructure/auth/types/request-user.types';
import { WorkChaptersService } from '../services/work-chapters.service';
import { CreateWorkChapterDto } from '../dtos/input/create-work-chapter.dto';
import { UpdateWorkChapterDto } from '../dtos/input/update-work-chapter.dto';
import { ReorderWorkChaptersDto } from '../dtos/input/reorder-work-chapters.dto';
import { WorkChapterResponseDto } from '../dtos/output/work-chapter-response.dto';
import { WorkChapterDetailResponseDto } from '../dtos/output/work-chapter-detail-response.dto';
import { DeleteWorkChapterResponseDto } from '../dtos/output/delete-work-chapter-response.dto';

const MAX_CHAPTER_HTML_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

@Controller('works/:workId/chapters')
export class WorkChaptersController {
  constructor(private readonly workChaptersService: WorkChaptersService) {}

  @Get()
  @ResponseDto(WorkChapterResponseDto, 'Capítulos obtenidos con éxito')
  findAll(
    @Param('workId', ParseUUIDPipe) workId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.workChaptersService.findAll(workId, user.id);
  }

  @Get(':chapterId')
  @ResponseDto(WorkChapterDetailResponseDto, 'Capítulo obtenido con éxito')
  findOne(
    @Param('workId', ParseUUIDPipe) workId: string,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.workChaptersService.findOne(workId, chapterId, user.id);
  }

  @Post()
  @ResponseDto(WorkChapterResponseDto, 'Capítulo creado con éxito')
  create(
    @Param('workId', ParseUUIDPipe) workId: string,
    @Body() dto: CreateWorkChapterDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.workChaptersService.create({
      workId,
      userId: user.id,
      title: dto.title,
    });
  }

  // Debe ir declarada ANTES que @Patch(':chapterId'): si no, "reorder" entra
  // por el parámetro y muere en el ParseUUIDPipe.
  @Patch('reorder')
  @ResponseDto(WorkChapterResponseDto, 'Capítulos reordenados con éxito')
  reorder(
    @Param('workId', ParseUUIDPipe) workId: string,
    @Body() dto: ReorderWorkChaptersDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.workChaptersService.reorder(workId, user.id, dto);
  }

  @Patch(':chapterId')
  @ResponseDto(WorkChapterResponseDto, 'Capítulo actualizado con éxito')
  update(
    @Param('workId', ParseUUIDPipe) workId: string,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
    @Body() dto: UpdateWorkChapterDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.workChaptersService.update(workId, chapterId, user.id, dto);
  }

  @Delete(':chapterId')
  @ResponseDto(DeleteWorkChapterResponseDto, 'Capítulo eliminado con éxito')
  async remove(
    @Param('workId', ParseUUIDPipe) workId: string,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
    @CurrentUser() user: RequestUser,
  ) {
    await this.workChaptersService.delete(workId, chapterId, user.id);
    return { id: chapterId };
  }

  @Post(':chapterId/content')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_CHAPTER_HTML_SIZE_BYTES },
    }),
  )
  @ResponseDto(
    WorkChapterResponseDto,
    'Contenido del capítulo guardado con éxito',
  )
  uploadContent(
    @Param('workId', ParseUUIDPipe) workId: string,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
    @UploadedFile() file: Request['file'],
    @CurrentUser() user: RequestUser,
  ) {
    return this.workChaptersService.uploadContent(
      workId,
      chapterId,
      user.id,
      file,
    );
  }
}
