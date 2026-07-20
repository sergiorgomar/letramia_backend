import { Module } from '@nestjs/common';
import { AccountsController } from './controllers/accounts.controller';
import { AccountsService } from './services/accounts.service';
import { UsersRepository } from './repositories/users.repository';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService, UsersRepository],
})
export class AccountsModule {}
