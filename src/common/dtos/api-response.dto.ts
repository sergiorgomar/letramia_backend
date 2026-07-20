// TODO: SEPARAR ESTOS DTOS EN VARIOS ARCHIVOS
export class ApiMeta {
  readonly traceId: string;
  readonly timestamp: string;

  constructor({ traceId, timestamp }: { traceId: string; timestamp: string }) {
    this.traceId = traceId;
    this.timestamp = timestamp;
  }
}

export class ApiErrorBody {
  readonly message: string;
  readonly error: { code: string; details?: string[] };
  readonly meta: ApiMeta;

  constructor({
    message,
    error,
    meta,
  }: {
    message: string;
    error: { code: string; details?: string[] };
    meta: ApiMeta;
  }) {
    this.message = message;
    this.error = error;
    this.meta = meta;
  }
}

export class APIResponseDTO<T = undefined> {
  readonly message: string;
  readonly payload: T | undefined;
  //readonly meta: ApiMeta;

  constructor({ message, payload }: { message: string; payload?: T }) {
    this.message = message;
    this.payload = payload;
    // this.meta = {
    //   traceId: crypto.randomUUID(),
    //   timestamp: new Date().toISOString(),
    // };
  }
}
