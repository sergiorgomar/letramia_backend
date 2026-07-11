import { Injectable } from '@nestjs/common';
import {
  WorksRepository,
  type WorkEntity,
} from './repositories/works.repository';
import { CreateWorkDto } from './dtos/input/create-work.dto';

@Injectable()
export class WorksService {
  constructor(private readonly worksRepository: WorksRepository) {}

  findAll() {
    return [];
  }

  create(dto: CreateWorkDto): Promise<WorkEntity> {
    return this.worksRepository.create(dto);
  }
}
