import { Injectable } from '@nestjs/common';
import { WorkCategoriesRepository } from '../repositories/work-categories.repository';
import { CreateWorkCategory } from '../types/create-work-category.type';
import { WorkCategoryResult } from '../types/work-category-result.type';

@Injectable()
export class WorkCategoriesService {
  constructor(
    private readonly workCategoriesRepository: WorkCategoriesRepository,
  ) {}

  create(dto: CreateWorkCategory): Promise<WorkCategoryResult> {
    return this.workCategoriesRepository.create(dto);
  }

  findAll(): Promise<WorkCategoryResult[]> {
    return this.workCategoriesRepository.findAll();
  }
}
