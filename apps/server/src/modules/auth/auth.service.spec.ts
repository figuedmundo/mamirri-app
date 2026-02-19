import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
            signAsync: jest.fn().mockResolvedValue('token'),
            verify: jest
              .fn()
              .mockReturnValue({ sub: '1', role: 'THERAPIST', clinicId: null }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('secret'),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if password matches', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hash',
        role: 'THERAPIST',
        clinicId: 'clinic-1',
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        role: 'THERAPIST',
        clinicId: 'clinic-1',
      });
    });

    it('should return null if password does not match', async () => {
      const user = { id: '1', email: 'test@example.com', passwordHash: 'hash' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrong');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        role: 'THERAPIST',
        clinicId: 'clinic-1',
      };
      const result = service.login(user);
      expect(result).toEqual({
        accessToken: 'token',
        refreshToken: 'token',
        user,
      });
    });

    it('should include clinicId in jwt payload', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        role: 'THERAPIST',
        clinicId: 'clinic-abc',
      };

      service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: '1',
        role: 'THERAPIST',
        clinicId: 'clinic-abc',
      });
    });
  });

  describe('register', () => {
    it('should create user and return tokens', async () => {
      const dto = {
        email: 'new@example.com',
        password: 'pass',
        name: 'New User',
        confirmPassword: 'pass',
      };
      const createdUser = {
        id: '2',
        ...dto,
        passwordHash: 'hash',
        role: 'THERAPIST',
        clinicId: null,
        createdAt: new Date(),
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash');

      const result = await service.register(dto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });
});
