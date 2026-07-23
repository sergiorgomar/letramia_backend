import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ExceptionMapper } from '../utils/exception.mapper';
import { ERROR_CATALOG } from '../errors/error-codes';
import { serializeErrorChain } from '../utils/error-chain.util';
import { ApiErrorBody, ApiMeta } from '../dtos/api-response.dto';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const traceId = crypto.randomUUID();
    const meta = new ApiMeta({ traceId, timestamp: new Date().toISOString() });

    // ── HttpException de NestJS (ValidationPipe, NotFound etc.) ────────────────────
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse() as
        string | { message: string | string[] };

      const rawMessage = typeof res === 'string' ? res : res.message;
      const isValidation = status === 400 && Array.isArray(rawMessage);
      const isPayloadTooLarge = status === 413;

      const body = new ApiErrorBody({
        message: isValidation
          ? 'Error de validación'
          : isPayloadTooLarge
            ? ERROR_CATALOG.PAYLOAD_TOO_LARGE.message
            : typeof rawMessage === 'string'
              ? rawMessage
              : 'Error en la solicitud',
        error: {
          code: isValidation
            ? ERROR_CATALOG.VALIDATION_ERROR.code
            : isPayloadTooLarge
              ? ERROR_CATALOG.PAYLOAD_TOO_LARGE.code
              : `HTTP-${status}`,
          ...(Array.isArray(rawMessage) && { details: rawMessage }),
        },
        meta,
      });

      this.logger.warn({
        ...body,
        path: request.url,
        method: request.method,
      });

      response.status(status).json(body);
      return;
    }

    // ── AppException (propias) o errores desconocidos ─────────────────────
    const appException = ExceptionMapper.toAppException(exception);

    const entry = ERROR_CATALOG[appException.code];
    const status = appException.status;

    const body = new ApiErrorBody({
      message: entry.message,
      error: {
        code: entry.code,
      },
      meta,
    });

    this.logger.error({
      internal: entry.internalMessage,
      ...body,
      //authenticated_user: request.user ?? null,
      context: appException.context,
      path: request.url,
      method: request.method,
      chain: serializeErrorChain(appException.cause),
    });

    response.status(status).json(body);
  }
}
