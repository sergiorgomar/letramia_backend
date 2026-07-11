import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APIResponseDTO } from '../dtos/api-response.dto';
import { AppException } from '../exceptions/app.exception';
import {
  RESPONSE_DTO_KEY,
  type ResponseDtoMeta,
} from '../decorators/response-dto.decorator';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.get<ResponseDtoMeta>(
      RESPONSE_DTO_KEY,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data: unknown) => {
        if (!meta) return new APIResponseDTO({ message: 'OK', payload: data });

        const payload = Array.isArray(data)
          ? data.map((item) => this.toValidatedDto(meta.dto, item))
          : this.toValidatedDto(meta.dto, data);

        return new APIResponseDTO({ message: meta.message, payload });
      }),
    );
  }

  private toValidatedDto<T extends object>(dto: new () => T, data: unknown): T {
    const instance = plainToInstance(dto, data);
    const errors = validateSync(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new AppException('RESPONSE_SHAPE_ERROR', {
        dto: dto.name,
        errors: errors.map((e) => ({
          property: e.property,
          constraints: e.constraints,
        })),
      });
    }

    return instance;
  }
}
