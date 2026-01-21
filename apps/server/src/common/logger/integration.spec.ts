import { Test, TestingModule } from '@nestjs/testing';
import { SanitizationService } from './sanitization.service';
import { AuditService } from './audit.service';
import { LogsController } from './logs.controller';
import { LoggerService } from './logger.service';
import { LoggerConfig } from '@mamirri/logger';

describe('Backend Integration', () => {
  let sanitizationService: SanitizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SanitizationService,
        AuditService,
        {
          provide: LoggerService,
          useValue: {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
      controllers: [LogsController],
    }).compile();

    sanitizationService = module.get<SanitizationService>(SanitizationService);
  });

  it('should sanitize PII data', () => {
    const data = {
      email: 'test@example.com',
      password: 'secret-password',
      nested: {
        phone: '123-456-7890',
      },
    };

    const sanitized = sanitizationService.sanitize(data);

    expect(sanitized.email).toContain('[REDACTED');
    expect(sanitized.password).toContain('[REDACTED');
    expect(sanitized.nested.phone).toContain('[REDACTED');
  });

  it('should sanitize complex nested objects and arrays', () => {
    const data = {
      users: [
        { email: 'user1@test.com', name: 'User 1' },
        { email: 'user2@test.com', name: 'User 2' },
      ],
      metadata: {
        deeper: {
          ssn: '123-45-6789',
        },
      },
    };

    const sanitized = sanitizationService.sanitize(data);

    expect(sanitized.users[0].email).toContain('[REDACTED');
    expect(sanitized.users[1].email).toContain('[REDACTED');
    expect(sanitized.metadata.deeper.ssn).toContain('[REDACTED');
  });
});
