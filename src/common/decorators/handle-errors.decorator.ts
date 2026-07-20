import type { ErrorKey } from '../errors/error-codes';
import { AppException } from '../exceptions/app.exception';

type AsyncFn = (...args: any[]) => Promise<any>;

// Decorador genérico: lanza AppException con el código que indiques.
// @HandleErrors('DATABASE_ERROR')
export function HandleErrors(code: ErrorKey) {
  return <T extends AsyncFn>(
    target: object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> => {
    const original = descriptor.value!;
    const context = { class: target.constructor.name, method: propertyKey };

    descriptor.value = async function (
      this: unknown,
      ...args: Parameters<T>
    ): Promise<Awaited<ReturnType<T>>> {
      try {
        return (await original.apply(this, args)) as Awaited<ReturnType<T>>;
      } catch (error: unknown) {
        if (error instanceof AppException) throw error;
        throw new AppException(code, context, error);
      }
    } as T;

    return descriptor;
  };
}
