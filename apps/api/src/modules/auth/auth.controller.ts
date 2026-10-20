import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CsrfGuard } from '../../common/guards/csrf.guard';
import { SafeUser } from '@neom/shared';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

class LoginDto {
  @IsString()
  @IsNotEmpty()
  login!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

class ChangeCredentialsDto {
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  newLogin?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  newPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  confirmPassword?: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string; csrfToken: string },
  ) {
    const isProd = process.env.NODE_ENV === 'production';

    // 1. Access Token: httpOnly, NO maxAge (Session Cookie: cleared on browser close!)
    res.cookie('neom_access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
    });

    // 2. Refresh Token: httpOnly, maxAge = 12 hours (Absolute limit)
    res.cookie('neom_refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 12 * 3600 * 1000,
      path: '/',
    });

    // 3. CSRF Token: accessible to client JS for double-submit header
    res.cookie('neom_csrf_token', tokens.csrfToken, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
    });
  }

  private clearAuthCookies(res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('neom_access_token', { path: '/', httpOnly: true, secure: isProd, sameSite: 'strict' });
    res.clearCookie('neom_refresh_token', { path: '/', httpOnly: true, secure: isProd, sameSite: 'strict' });
    res.clearCookie('neom_csrf_token', { path: '/', sameSite: 'strict' });
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tizimga kirish (Login va parol orqali)' })
  @ApiResponse({ status: 200, description: 'Muvaffaqiyatli kirildi' })
  @ApiResponse({ status: 401, description: "Login yoki parol noto'g'ri" })
  @ApiResponse({ status: 429, description: "Juda ko'p urinish" })
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await this.authService.login(body.login, body.password, ip, userAgent);

    this.setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      csrfToken: result.csrfToken,
    });

    // Explicitly return ONLY non-sensitive route & role info
    return {
      role: result.role,
      redirectUrl: result.redirectUrl,
      mustChangePassword: result.mustChangePassword,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tizimdan chiqish (Sessiyani o‘chirish)' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: SafeUser,
  ) {
    const refreshToken = req.cookies?.['neom_refresh_token'];
    const ip = req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';

    await this.authService.logout(refreshToken, user?.id, ip, userAgent);
    this.clearAuthCookies(res);

    return {
      message: 'Tizimdan muvaffaqiyatli chiqildi',
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sessiya tokenni yangilash (Rotation)' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const oldRefreshToken = req.cookies?.['neom_refresh_token'];
    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token topilmadi');
    }

    const ip = req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await this.authService.refresh(oldRefreshToken, ip, userAgent);

    this.setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      csrfToken: result.csrfToken,
    });

    return {
      role: result.role,
      refreshed: true,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Joriy foydalanuvchi ma’lumotlari' })
  async getMe(@CurrentUser() user: SafeUser) {
    // Only return fullName, role, mustChangePassword
    return {
      fullName: user.fullName,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, CsrfGuard)
  @Post('change-credentials')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Parol va loginni o‘zgartirish' })
  async changeCredentials(
    @Body() body: ChangeCredentialsDto,
    @CurrentUser() user: SafeUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await this.authService.changeCredentials(
      user.id,
      body,
      ip,
      userAgent,
    );

    this.setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      csrfToken: result.csrfToken,
    });

    return {
      message: result.message,
      role: result.role,
    };
  }
}
