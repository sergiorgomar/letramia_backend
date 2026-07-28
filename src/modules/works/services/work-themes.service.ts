import { Injectable } from '@nestjs/common';
import { WorkThemesRepository } from '../repositories/work-themes.repository';
import { CreateWorkTheme } from '../types/create-work-theme.type';
import { WorkThemeResult } from '../types/work-theme-result.type';

@Injectable()
export class WorkThemesService {
  constructor(
    private readonly workThemesRepository: WorkThemesRepository,
  ) {}

  create(dto: CreateWorkTheme): Promise<WorkThemeResult> {
    return this.workThemesRepository.create(dto);
  }

  findAll(): Promise<WorkThemeResult[]> {
    return this.workThemesRepository.findAll();
  }
}
