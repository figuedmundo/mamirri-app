import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { Response } from 'express';

describe('Auth PIN Endpoints', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockResponse = {
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            setupPin: jest.fn(),
            validatePin: jest.fn(),
            getPinStatus: jest.fn(),
            login: jest.fn(),
            register: jest.fn(),
            refreshTokens: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(LocalAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RefreshTokenGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  describe('POST /auth/pin/setup', () => {
    it('should call authService.setupPin', async () => {
      const user = { userId: '1' };
      const dto = { pin: '1234' };
      (service.setupPin as jest.Mock).mockResolvedValue({ success: true });

      const result = await controller.setupPin(user, dto);
      expect(result).toEqual({ success: true });
      expect(service.setupPin).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('POST /auth/pin/login', () => {
    it('should call authService.validatePin and return tokens', async () => {
      const dto = { email: 'test@example.com', pin: '1234' };
      const tokens = {
        accessToken: 'at',
        refreshToken: 'rt',
        user: { id: '1', email: 'test@example.com' },
      };
      (service.validatePin as jest.Mock).mockResolvedValue(tokens);

      await controller.pinLogin(dto, mockResponse);

      expect(service.validatePin).toHaveBeenCalledWith(dto.email, dto.pin);
      expect(mockResponse.send).toHaveBeenCalledWith(tokens);
    });
  });

  describe('GET /auth/pin/status', () => {
    it('should return true if user has PIN set', async () => {
      const user = { userId: '1' };
      (service.getPinStatus as jest.Mock).mockResolvedValue({
        hasPinSet: true,
      });

      const result = await controller.getPinStatus(user);
      expect(result).toEqual({ hasPinSet: true });
      expect(service.getPinStatus).toHaveBeenCalledWith('1');
    });

    it('should return false if user does not have PIN set', async () => {
      const user = { userId: '1' };
      (service.getPinStatus as jest.Mock).mockResolvedValue({
        hasPinSet: false,
      });

      const result = await controller.getPinStatus(user);
      expect(result).toEqual({ hasPinSet: false });
    });
  });
});
