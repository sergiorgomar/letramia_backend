import {
  Controller,
  // Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ResponseDto } from '@/common/decorators/response-dto.decorator';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { RequestUser } from '@/infrastructure/auth/types/request-user.types';
import { WorkChaptersService } from '../services/work-chapters.service';
import { CreateWorkChapterDto } from '../dtos/input/create-work-chapter.dto';
import { ChangeWorkChaptersOrderDto } from '../dtos/input/change-work-chapters-order.dto';
import { UpdateWorkChapterTitleDto } from '../dtos/input/update-work-chapter-title.dto';
import { CreateWorkChapterResponseDto } from '../dtos/output/create-work-chapter-response.dto';
// import { GetWorkChapterResponseDto } from '../dtos/output/get-work-chapter-response.dto';
// import { GetWorkChaptersResponseDto } from '../dtos/output/get-work-chapters-response.dto';
import { ChangeWorkChaptersOrderResponseDto } from '../dtos/output/change-work-chapters-order-response.dto';
import { UpdateWorkChapterTitleResponseDto } from '../dtos/output/update-work-chapter-title-response.dto';

@Controller('works/:workId/chapters')
export class WorkChaptersController {
  constructor(private readonly workChaptersService: WorkChaptersService) {}

  @Post()
  @ResponseDto(CreateWorkChapterResponseDto, 'Capítulo creado con éxito')
  create(
    @Param('workId', ParseUUIDPipe) workId: string,
    @Body() dto: CreateWorkChapterDto,
    @CurrentUser() user: RequestUser,
  ): Promise<CreateWorkChapterResponseDto> {
    return this.workChaptersService.create(workId, user.id, dto.title);
  }

  @Patch('order')
  @ResponseDto(
    ChangeWorkChaptersOrderResponseDto,
    'Orden de capítulos actualizado con éxito',
  )
  async changeOrder(
    @Param('workId', ParseUUIDPipe) workId: string,
    @Body() dto: ChangeWorkChaptersOrderDto,
    @CurrentUser() user: RequestUser,
  ) {
    await this.workChaptersService.changeOrder(workId, user.id, dto.chapterIds);
    return { ok: true };
  }

  @Patch(':chapterId/title')
  @ResponseDto(
    UpdateWorkChapterTitleResponseDto,
    'Título del capítulo actualizado con éxito',
  )
  updateTitle(
    @Param('workId', ParseUUIDPipe) workId: string,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
    @Body() dto: UpdateWorkChapterTitleDto,
    @CurrentUser() user: RequestUser,
  ): Promise<UpdateWorkChapterTitleResponseDto> {
    return this.workChaptersService.updateTitle(
      workId,
      chapterId,
      user.id,
      dto.title,
    );
  }
}
