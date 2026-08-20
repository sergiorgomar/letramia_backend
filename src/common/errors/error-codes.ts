import { WORKS_ERROR_CATALOG } from './error-works-codes';
import { WORK_CHAPTERS_ERROR_CATALOG } from './error-work-chapters-codes';
import { CATALOG_ERROR_CATALOG } from './error-catalog-codes';
import { ACCOUNTS_ERROR_CATALOG } from './error-accounts-codes';
import { WEB_ERROR_CATALOG } from './web-codes';

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
  MAIL_SEND_ERROR: {
    code: 'MAIL-0001',
    status: 502,
    message: 'No se pudo enviar el correo.',
    internalMessage: 'Resend rechazó o no pudo procesar el envío',
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
    message:
      'Su solicitud es demasiado grande, reduzca el tamaño de sus archivos.',
    internalMessage:
      'Body-parser o Multer rechazaron la request por exceder su límite de tamaño',
  },

  // ── CUSTOM by module, service, etc.. ──────────────────────────────────────────
  ...WORKS_ERROR_CATALOG,
  ...WORK_CHAPTERS_ERROR_CATALOG,
  ...CATALOG_ERROR_CATALOG,
  ...ACCOUNTS_ERROR_CATALOG,
  ...WEB_ERROR_CATALOG,
} as const;

export type ErrorKey = keyof typeof ERROR_CATALOG;
export type ErrorCode = (typeof ERROR_CATALOG)[ErrorKey]['code'];
