import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca un endpoint como público.
 * El `FirebaseAuthGuard` global omitirá la validación del token en estos handlers.
 *
 * @example
 * @Public()
 * @Get('health')
 * health() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
