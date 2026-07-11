import { Injectable } from '@nestjs/common';
import { WorkTypesRepository } from '../repositories/work-types.repository';
import { CreateWorkTypeDto } from '../dtos/input/create-work-type.dto';
import { WorkTypeResult } from '../types/work-type-result.type';

@Injectable()
export class WorkTypesService {
  constructor(private readonly workTypesRepository: WorkTypesRepository) {}

  create(dto: CreateWorkTypeDto): Promise<WorkTypeResult> {
    return this.workTypesRepository.create(dto);
  }

  findAll(): Promise<WorkTypeResult[]> {
    return this.workTypesRepository.findAll();
  }
}
