import { AppException } from '../exceptions/app.exception';

export class ExceptionMapper {
  static toAppException(error: unknown): AppException {
    if (error instanceof AppException) return error;

    // if (ExceptionMapper.isFirebaseError(error)) {
    //   return new AppException(
    //     'FIREBASE_ERROR',
    //     { firebaseCode: (error as { code: string }).code },
    //     error,
    //   );
    // }

    return new AppException(
      'UNKNOWN_ERROR',
      { raw: String(error) },
      error instanceof Error ? error : undefined,
    );
  }

  // private static isFirebaseError(error: unknown): boolean {
  //   return (
  //     typeof error === 'object' &&
  //     error !== null &&
  //     'code' in error &&
  //     typeof (error as Record<string, unknown>).code === 'string' &&
  //     String((error as Record<string, unknown>).code).startsWith('auth/')
  //   );
  // }
}
