import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        accessToken: 'ey...',
        refreshToken: 'ey...',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const tokens = await this.authService.register(registerDto);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    res.send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    schema: {
      example: {
        accessToken: 'ey...',
        refreshToken: 'ey...',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@CurrentUser() user: any, @Res() res: Response) {
    const tokens = await this.authService.login(user);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    res.send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: tokens.user,
    });
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Tokens successfully refreshed',
    schema: {
      example: {
        accessToken: 'ey...',
        refreshToken: 'ey...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refresh(@CurrentUser() user: any, @Res() res: Response) {
    const tokens = await this.authService.refreshTokens(user.refreshToken);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    res.send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@CurrentUser() user: any, @Res() res: Response) {
    await this.authService.logout(user.id);
    res.clearCookie('refresh_token');
    res.send({ success: true });
  }

  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
