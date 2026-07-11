import { Injectable } from '@nestjs/common';
import { WorkCategoriesRepository } from '../repositories/work-categories.repository';
import { CreateWorkCategoryDto } from '../dtos/input/create-work-category.dto';
import { WorkCategoryResult } from '../types/work-category-result.type';

@Injectable()
export class WorkCategoriesService {
  constructor(
    private readonly workCategoriesRepository: WorkCategoriesRepository,
  ) {}

  create(dto: CreateWorkCategoryDto): Promise<WorkCategoryResult> {
    return this.workCategoriesRepository.create(dto);
  }

  findAll(): Promise<WorkCategoryResult[]> {
    return this.workCategoriesRepository.findAll();
  }
}
