import { Controller, Post, Body } from '@nestjs/common';
import { ResponseDto } from '@/common/decorators/response-dto.decorator';
import { Public } from '@/infrastructure/auth/decorators/public.decorator';
import { AccountsService } from '../services/accounts.service';
import { RegisterAccountDto } from '../dtos/input/register-account.dto';
import { AccountResponseDto } from '../dtos/output/account-response.dto';
import { LoginAccountDto } from '../dtos/input/login-account.dto';
import { LoginResponseDto } from '../dtos/output/login-response.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Public()
  @Post('create-account')
  @ResponseDto(AccountResponseDto, 'Cuenta creada con éxito')
  register(@Body() dto: RegisterAccountDto): Promise<AccountResponseDto> {
    return this.accountsService.createAccount(dto);
  }

  @Public()
  @Post('login')
  @ResponseDto(LoginResponseDto, 'Sesión iniciada con éxito')
  login(@Body() dto: LoginAccountDto): Promise<LoginResponseDto> {
    return this.accountsService.login(dto);
  }
}
