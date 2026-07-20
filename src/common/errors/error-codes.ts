export const ERROR_CATALOG = {
  // ── General ──────────────────────────────────────────
  UNKNOWN_ERROR: {
    code: 'APP-0001',
    status: 500,
    message: 'Error interno del servidor.',
    internalMessage: 'Error no clasificado',
  },
  NO_AUTORIZADO: {
    code: 'AUTH-0001',
    status: 401,
    message: 'No tiene permiso para acceder a este recurso.',
    internalMessage: 'Error validando sesión o rol',
  },
  DATABASE_ERROR: {
    code: 'DB-0001',
    status: 500,
    message: 'Error interno del servidor.',
    internalMessage: 'Fallo ejecutando una operación contra la base de datos',
  },
  VALIDATION_ERROR: {
    code: 'VAL-0001',
    status: 400,
    message: 'Error de validación',
    internalMessage: 'El body de la request no pasó las validaciones del DTO',
  },
  RESPONSE_SHAPE_ERROR: {
    code: 'RES-0001',
    status: 500,
    message: 'Error interno del servidor.',
    internalMessage:
      'La respuesta del controller no cumple con su DTO de salida',
  },
} as const;

export type ErrorKey = keyof typeof ERROR_CATALOG;
export type ErrorCode = (typeof ERROR_CATALOG)[ErrorKey]['code'];
