import { APP_GUARD } from '@nestjs/core';
import { Global, Module } from '@nestjs/common';
import { SupabaseAuthGuard } from './guards/supabase.guard';
import { UserTypesGuard } from './guards/user-types.guard';
// import { UsersModule } from '../../modules/users/users.module';

/**
 * AuthModule agrupa todo lo relacionado a autenticación / autorización:
 * - FirebaseAuthGuard
 * - Decoradores: @Public(), @CurrentUser(), @UserTypes()
 * - Tipos: RequestUser
 */
@Global()
@Module({
  imports: [],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: SupabaseAuthGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: UserTypesGuard,
    // },
  ],
})
export class AuthModule {}
