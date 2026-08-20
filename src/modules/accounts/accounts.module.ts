import { Module } from '@nestjs/common';
import { AccountsController } from './controllers/accounts.controller';
import { AccountsService } from './services/accounts.service';
import { UsersRepository } from './repositories/users.repository';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { PasswordResetTokensRepository } from './repositories/password-reset-tokens.repository';

@Module({
  controllers: [AccountsController],
  providers: [
    AccountsService,
    UsersRepository,
    PasswordResetTokensRepository,
    RefreshTokenGuard,
  ],
  exports: [UsersRepository],
})
export class AccountsModule {}
