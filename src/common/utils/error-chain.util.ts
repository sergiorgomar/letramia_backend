import { AppException } from '../exceptions/app.exception';

export interface SerializedError {
  name: string;
  message: string;
  code?: string;
  context?: Record<string, unknown>;
  stack?: string;
}

export function serializeErrorChain(error: unknown): SerializedError[] {
  const chain: SerializedError[] = [];
  let current: unknown = error;

  while (current instanceof Error) {
    const entry: SerializedError = {
      name: current.name,
      message: current.message,
      stack: current.stack,
    };

    if (current instanceof AppException) {
      entry.code = current.code;
      entry.context = current.context;
    }

    chain.push(entry);
    current = (current as Error & { cause?: unknown }).cause;
  }

  return chain;
}
