import { Response } from 'express';
import { getCookieOptions } from './get-cookie-options';

interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export function setAuthCookies(
  response: Response,
  session: AuthSession,
  isProduction: boolean,
) {
  const baseOptions = getCookieOptions(isProduction);

  response.cookie('access_token', session.accessToken, {
    ...baseOptions,
    maxAge: 60 * 60 * 1000,
  });

  response.cookie('refresh_token', session.refreshToken, {
    ...baseOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  response.cookie('expires_at', session.expiresAt, {
    ...baseOptions,
    httpOnly: false,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}
