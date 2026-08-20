export const ACCOUNTS_ERROR_CATALOG = {
  ACCOUNT_ALREADY_EXISTS: {
    code: 'ACC-0001',
    status: 409,
    message: 'No se ha podido crear su cuenta',
    internalMessage: 'Supabase Auth rechazó el signUp: correo duplicado',
  },
  SUPABASE_AUTH_ERROR: {
    code: 'ACC-0002',
    status: 500,
    message: 'Error interno del servidor.',
    internalMessage: 'Fallo llamando a Supabase Auth Admin',
  },
  ACCOUNT_ALREADY_EXISTS_IN_DB: {
    code: 'ACC-0003',
    status: 409,
    message: 'No se ha podido crear su cuenta',
    internalMessage: 'Ya existe una cuenta con ese correo en base de datos',
  },
  INVALID_CREDENTIALS: {
    code: 'ACC-0004',
    status: 401,
    message: 'Correo o contraseña incorrectos.',
    internalMessage: 'Supabase Auth rechazó el signInWithPassword',
  },
  USER_DOESNT_EXIST_FOR_LOGIN: {
    code: 'ACC-0005',
    status: 400,
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
    internalMessage:
      'Token válido en Supabase pero sin usuario en base de datos',
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
  NOT_ADMITED_MAIL: {
    code: 'ACC-0010',
    status: 400,
    message:
      'Error creando su cuenta. El correo electrónico proporcionado no está permitido',
    internalMessage: 'Ingresaron un correo no admitido',
  },
  PASSWORD_RESET_TOKEN_INVALID: {
    code: 'ACC-0011',
    status: 400,
    message: 'El enlace para restablecer la contraseña no es válido o expiró.',
    internalMessage:
      'El token de recuperación no existe, ya fue usado o expiró',
  },
  PASSWORD_RESET_USER_NOT_FOUND: {
    code: 'ACC-0012',
    status: 400,
    message: 'El enlace para restablecer la contraseña no es válido o expiró.',
    internalMessage:
      'El token de recuperación es válido, pero el usuario asociado no existe',
  },
} as const;
