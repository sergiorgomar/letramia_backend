import { Response } from 'express';
import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ResponseDto } from '@/common/decorators/response-dto.decorator';
import { Public } from '@/infrastructure/auth/decorators/public.decorator';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { RequestUser } from '@/infrastructure/auth/types/request-user.types';
import { AccountsService } from '../services/accounts.service';
import { RegisterAccountDto } from '../dtos/input/register-account.dto';
import { AccountResponseDto } from '../dtos/output/account-response.dto';
import { LoginAccountDto } from '../dtos/input/login-account.dto';
import { RefreshTokenDto } from '../dtos/input/refresh-token.dto';
import { LoginResponseDto } from '../dtos/output/login-response.dto';
import { MeResponseDto } from '../dtos/output/me-response.dto';

// 🔥🔥 proteger el controller con un middleware contra ataques de fuerza bruta
// 🔥🔥 proteger el controller con un captcha de que no son robots
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
  @HttpCode(HttpStatus.OK)
  @ResponseDto(LoginResponseDto, 'Sesión iniciada con éxito')
  async login(
    @Body() dto: LoginAccountDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    const result = await this.accountsService.login(dto);
    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: false, //process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 1000, // ajusta al tiempo real del access token
    });

    response.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: false, //process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ResponseDto(LoginResponseDto, 'Sesión refrescada con éxito')
  refresh(@Body() dto: RefreshTokenDto): Promise<LoginResponseDto> {
    return this.accountsService.refresh(dto);
  }

  @Get('me')
  @ResponseDto(MeResponseDto, 'Usuario autenticado con éxito')
  me(@CurrentUser() user: RequestUser): MeResponseDto {
    return { id: user.id, name: user.name };
  }
}
