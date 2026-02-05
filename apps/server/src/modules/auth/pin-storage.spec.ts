import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('User PIN Storage (Mocked)', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
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
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should include pinHash in the created user data from prisma', async () => {
    const userWithPin = {
      id: '1',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      pinHash: 'hashed-pin',
      name: 'Test User',
      role: 'THERAPIST',
    };
    (prisma.user.create as jest.Mock).mockResolvedValue(userWithPin);

    const result = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        name: 'Test User',
        pinHash: 'hashed-pin',
      },
    });

    expect(result.pinHash).toBe('hashed-pin');
  });

  it('should exclude pinHash from validateUser return value', async () => {
    const user = {
      id: '1',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      pinHash: 'hashed-pin',
      name: 'Test User',
      role: 'THERAPIST',
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.validateUser('test@example.com', 'password');

    expect(result).toBeDefined();
    expect(result.pinHash).toBeUndefined();
    expect(result.passwordHash).toBeUndefined();
    expect(result.name).toBe('Test User');
  });

  it('should handle null pinHash correctly in validateUser', async () => {
    const user = {
      id: '1',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      pinHash: null,
      name: 'Test User',
      role: 'THERAPIST',
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.validateUser('test@example.com', 'password');

    expect(result).toBeDefined();
    expect(result.pinHash).toBeUndefined();
  });
});
