import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemService {
  constructor() {}

  async healthCheck(): Promise<string> {
    return 'System is healthy';
  }
}
