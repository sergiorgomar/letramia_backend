import { Injectable } from '@nestjs/common';
import { WorkGenresRepository } from '../repositories/work-genres.repository';
import { CreateWorkGenre } from '../types/create-work-genre.type';
import { WorkGenreResult } from '../types/work-genre-result.type';

@Injectable()
export class WorkGenresService {
  constructor(private readonly workGenresRepository: WorkGenresRepository) {}

  create(dto: CreateWorkGenre): Promise<WorkGenreResult> {
    return this.workGenresRepository.create(dto);
  }

  findAll(): Promise<WorkGenreResult[]> {
    return this.workGenresRepository.findAll();
  }
}
