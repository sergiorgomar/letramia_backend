import { APP_GUARD } from '@nestjs/core';
import { Global, Module } from '@nestjs/common';
import { SupabaseAuthGuard } from './guards/supabase.guard';
import { UserTypesGuard } from './guards/user-types.guard';
import { AccountsModule } from '@/modules/accounts/accounts.module';

/**
 * AuthModule agrupa todo lo relacionado a autenticación / autorización:
 * - SupabaseAuthGuard
 * - Decoradores: @Public(), @CurrentUser(), @UserTypes()
 * - Tipos: RequestUser
 */
@Global()
@Module({
  imports: [AccountsModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: UserTypesGuard,
    // },
  ],
})
export class AuthModule {}
