import { CookieOptions } from 'express';

export function getCookieOptions(isProduction: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    ...(isProduction && {
      domain: '.letramia.com',
    }),
  };
}
