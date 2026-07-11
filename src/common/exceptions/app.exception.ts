import { ERROR_CATALOG, type ErrorKey } from '../errors/error-codes';

export class AppException extends Error {
  public readonly code: ErrorKey;
  public readonly context: Record<string, unknown>;

  constructor(
    code: ErrorKey,
    context: Record<string, unknown> = {},
    cause?: unknown,
  ) {
    const entry = ERROR_CATALOG[code];
    super(entry.message, { cause });
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
  }

  get status(): number {
    return ERROR_CATALOG[this.code].status;
  }
}
