import { Response } from 'express';
import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ResponseDto } from '@/common/decorators/response-dto.decorator';
import { Public } from '@/infrastructure/auth/decorators/public.decorator';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { RequestUser } from '@/infrastructure/auth/types/request-user.types';
import { AccountsService } from '../services/accounts.service';
import { RegisterAccountDto } from '../dtos/input/register-account.dto';
import { AccountResponseDto } from '../dtos/output/account-response.dto';
import { LoginAccountDto } from '../dtos/input/login-account.dto';
import { MeResponseDto } from '../dtos/output/me-response.dto';
import {
  RefreshRequest,
  RefreshTokenGuard,
} from '../guards/refresh-token.guard';
import { RecoverAccountResponseDto } from '../dtos/output/recover-account-response.dto';
import { RecoverAccountDto } from '../dtos/input/recover-account.dto';
import { ResetPasswordDto } from '../dtos/input/reset-password.dto';
import { ResetPasswordResponseDto } from '../dtos/output/reset-password-response.dto';
import { ConfigService } from '@nestjs/config';
import { setAuthCookies } from '../utils/set-auth-cookies';

// 🔥🔥 proteger el controller con un middleware contra ataques de fuerza bruta
// 🔥🔥 proteger el controller con un captcha de que no son robots
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('create-account')
  @ResponseDto(AccountResponseDto, 'Cuenta creada con éxito')
  register(@Body() dto: RegisterAccountDto): Promise<AccountResponseDto> {
    return this.accountsService.createAccount(
      dto.email,
      dto.password,
      dto.name,
      dto.userTypes,
    );
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginAccountDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.accountsService.login(dto.email, dto.password);
    const isProduction =
      this.configService.get<string>('OWN_ENVIROMENT') === 'production';
    setAuthCookies(response, result, isProduction);
  }

  @Public()
  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @Req() request: RefreshRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = request.refreshedSession!;
    const isProduction =
      this.configService.get<string>('OWN_ENVIROMENT') === 'production';
    setAuthCookies(response, result, isProduction);
  }

  @Get('me')
  @ResponseDto(MeResponseDto, 'Usuario autenticado con éxito')
  me(@CurrentUser() user: RequestUser): MeResponseDto {
    return { id: user.id, name: user.name };
  }

  @Public()
  @Post('recover-account')
  @ResponseDto(RecoverAccountResponseDto, 'Usuario recuperado con éxito')
  async recoverAccount(
    @Body() dto: RecoverAccountDto,
  ): Promise<RecoverAccountResponseDto> {
    await this.accountsService.recoverAccount(dto.email);
    return { ok: true };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ResponseDto(ResetPasswordResponseDto, 'Contraseña actualizada con éxito')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<ResetPasswordResponseDto> {
    await this.accountsService.resetPassword(dto.hash, dto.password);
    return { ok: true };
  }
}
