import { Injectable } from '@nestjs/common';
import { WorksRepository } from '../repositories/works.repository';
import { CreateWorkDto } from '../dtos/input/create-work.dto';
import { WorkResult } from '../types/work-result.type';

@Injectable()
export class WorksService {
  constructor(private readonly worksRepository: WorksRepository) {}

  findAll(): Promise<WorkResult[]> {
    return this.worksRepository.findAll();
  }

  create(dto: CreateWorkDto): Promise<WorkResult> {
    return this.worksRepository.create(dto);
  }
}
