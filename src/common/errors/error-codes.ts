import { WORKS_ERROR_CATALOG } from './error-works-codes';

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
  ACCOUNT_ALREADY_EXISTS: {
    code: 'ACC-0001',
    status: 409,
    message: 'Ya existe una cuenta registrada con ese correo.',
    internalMessage: 'Supabase Auth rechazó el signUp: correo duplicado',
  },
  ACCOUNT_ALREADY_EXISTS_IN_DB: {
    code: 'ACC-0003',
    status: 409,
    message: 'Ya existe una cuenta registrada con ese correo.',
    internalMessage: 'Ya existe una cuenta con ese correo en base de datos',
  },
  SUPABASE_AUTH_ERROR: {
    code: 'ACC-0002',
    status: 500,
    message: 'Error interno del servidor.',
    internalMessage: 'Fallo llamando a Supabase Auth Admin',
  },
  INVALID_CREDENTIALS: {
    code: 'ACC-0004',
    status: 401,
    message: 'Correo o contraseña incorrectos.',
    internalMessage: 'Supabase Auth rechazó el signInWithPassword',
  },
  USER_DOESNT_EXIST_FOR_LOGIN: {
    code: 'ACC-0005',
    status: 401,
    message: 'Correo o contraseña incorrectos.',
    internalMessage: 'El usuario no existe en base de datos',
  },
  INVALID_TOKEN: {
    code: 'ACC-0006',
    status: 401,
    message: 'Sesión inválida o expirada.',
    internalMessage: 'Supabase Auth rechazó el access token (getUser)',
  },
  ACCOUNT_NOT_FOUND: {
    code: 'ACC-0007',
    status: 401,
    message: 'Sesión inválida o expirada.',
    internalMessage: 'Token válido en Supabase pero sin usuario en base de datos',
  },
  ACCOUNT_DISABLED: {
    code: 'ACC-0008',
    status: 403,
    message: 'Tu cuenta está deshabilitada.',
    internalMessage: 'El usuario existe pero active = false',
  },
  INVALID_REFRESH_TOKEN: {
    code: 'ACC-0009',
    status: 401,
    message: 'Error refrescando token.',
    internalMessage: 'Supabase Auth rechazó el refreshSession',
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
  PAYLOAD_TOO_LARGE: {
    code: 'APP-0002',
    status: 413,
    message: 'Su solicitud es demasiado grande, reduzca el tamaño de sus archivos.',
    internalMessage:
      'Body-parser o Multer rechazaron la request por exceder su límite de tamaño',
  },

  // ── CUSTOM by module, service, etc.. ──────────────────────────────────────────
  ...WORKS_ERROR_CATALOG,
} as const;

export type ErrorKey = keyof typeof ERROR_CATALOG;
export type ErrorCode = (typeof ERROR_CATALOG)[ErrorKey]['code'];
