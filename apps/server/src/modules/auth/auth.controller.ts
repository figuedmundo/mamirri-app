import {
  Controller,
  Post,
  Get,
  Body,
  Param,
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
import { SetupPinDto } from './dto/setup-pin.dto';
import { PinLoginDto } from './dto/pin-login.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
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
      user: tokens.user,
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
          role: 'THERAPIST',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  login(@CurrentUser() user: any, @Res() res: Response) {
    const tokens = this.authService.login(user);
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
  logout(@CurrentUser() user: any, @Res() res: Response) {
    this.authService.logout(user.userId);
    res.clearCookie('refresh_token');
    res.send({ success: true });
  }

  @Public()
  @Get('invite/:token')
  @ApiOperation({ summary: 'Get invitation details by token' })
  @ApiResponse({ status: 200, description: 'Invitation metadata' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  getInvitation(@Param('token') token: string) {
    return this.authService.getInvitation(token);
  }

  @Public()
  @Post('invite/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept clinic invitation and create account' })
  @ApiBody({ type: AcceptInviteDto })
  @ApiResponse({ status: 200, description: 'Invitation accepted' })
  @ApiResponse({ status: 403, description: 'Invitation invalid or expired' })
  async acceptInvitation(
    @Body() acceptInviteDto: AcceptInviteDto,
    @Res() res: Response,
  ) {
    const tokens = await this.authService.acceptInvitation(acceptInviteDto);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    res.send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: tokens.user,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('pin/setup')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup 4-digit PIN for current user' })
  @ApiBody({ type: SetupPinDto })
  @ApiResponse({ status: 200, description: 'PIN successfully set' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setupPin(@CurrentUser() user: any, @Body() setupPinDto: SetupPinDto) {
    return this.authService.setupPin(user.userId, setupPinDto);
  }

  @Public()
  @Post('pin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and PIN' })
  @ApiBody({ type: PinLoginDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in with PIN',
    schema: {
      example: {
        accessToken: 'ey...',
        refreshToken: 'ey...',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'THERAPIST',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async pinLogin(@Body() pinLoginDto: PinLoginDto, @Res() res: Response) {
    const tokens = await this.authService.validatePin(
      pinLoginDto.email,
      pinLoginDto.pin,
    );
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    res.send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: tokens.user,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('pin/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if current user has a PIN set' })
  @ApiResponse({
    status: 200,
    description: 'PIN status returned',
    schema: { example: { hasPinSet: true } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPinStatus(@CurrentUser() user: any) {
    return this.authService.getPinStatus(user.userId);
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
