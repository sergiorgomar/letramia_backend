import { Module } from '@nestjs/common';
import { AccountsController } from './controllers/accounts.controller';
import { AccountsService } from './services/accounts.service';
import { UsersRepository } from './repositories/users.repository';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService, UsersRepository, RefreshTokenGuard],
  exports: [UsersRepository],
})
export class AccountsModule {}
