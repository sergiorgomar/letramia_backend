import { Injectable } from '@nestjs/common';
import { WorkTypesRepository } from '../repositories/work-types.repository';
import { CreateWorkType } from '../types/create-work-type';
import { WorkTypeResult } from '../types/work-type-result.type';

@Injectable()
export class WorkTypesService {
  constructor(private readonly workTypesRepository: WorkTypesRepository) {}

  create(dto: CreateWorkType): Promise<WorkTypeResult> {
    return this.workTypesRepository.create(dto);
  }

  findAll(): Promise<WorkTypeResult[]> {
    return this.workTypesRepository.findAll();
  }
}
