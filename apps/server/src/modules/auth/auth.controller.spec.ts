import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refreshTokens: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'pass',
        name: 'Test',
        confirmPassword: 'pass',
      };
      (authService.register as jest.Mock).mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt',
      });
      const res = { cookie: jest.fn(), send: jest.fn() } as unknown as Response;

      await controller.register(dto, res);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'rt',
        expect.any(Object),
      );
      expect(res.send).toHaveBeenCalledWith({
        accessToken: 'at',
        refreshToken: 'rt',
      });
    });
  });

  describe('login', () => {
    it('should call authService.login and set cookie', () => {
      const user = { id: '1', email: 'test@example.com' };
      (authService.login as jest.Mock).mockReturnValue({
        accessToken: 'at',
        refreshToken: 'rt',
        user: user,
      });
      const res = { cookie: jest.fn(), send: jest.fn() } as unknown as Response;

      controller.login(user, res);

      expect(authService.login).toHaveBeenCalledWith(user);
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'rt',
        expect.any(Object),
      );
    });
  });

  describe('refresh', () => {
    it('should call authService.refreshTokens', async () => {
      const user = { refreshToken: 'rt' };
      (authService.refreshTokens as jest.Mock).mockResolvedValue({
        accessToken: 'new_at',
        refreshToken: 'new_rt',
      });
      const res = { cookie: jest.fn(), send: jest.fn() } as unknown as Response;

      await controller.refresh(user, res);

      expect(authService.refreshTokens).toHaveBeenCalledWith('rt');
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'new_rt',
        expect.any(Object),
      );
    });
  });

  describe('logout', () => {
    it('should clear cookie', () => {
      const user = { userId: '1' };
      const res = {
        clearCookie: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      controller.logout(user, res);

      expect(authService.logout).toHaveBeenCalledWith('1');
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
    });
  });
});
