import { Controller, Get } from '@nestjs/common';

import { ResponseDto } from '@/common/decorators/response-dto.decorator';

import { CatalogsResponseDto } from '../dtos/output/catalogs-response.dto';
import { CatalogsService } from '../services/catalogs.service';

@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Get()
  @ResponseDto(CatalogsResponseDto, 'Catálogos obtenidos con éxito')
  findAll() {
    return this.catalogsService.findAll();
  }
}
