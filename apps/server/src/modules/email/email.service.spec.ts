import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { Resend } from 'resend';
import { Logger } from '@nestjs/common';

jest.mock('resend');

describe('EmailService', () => {
  let service: EmailService;

  const mockResendSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (Resend as jest.Mock).mockImplementation(() => ({
      emails: {
        send: mockResendSend,
      },
    }));
  });

  describe('when RESEND_API_KEY is present', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue('test-api-key'),
            },
          },
        ],
      }).compile();

      service = module.get<EmailService>(EmailService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should send invitation email via Resend API with correct parameters', async () => {
      mockResendSend.mockResolvedValue({ id: 'email-id', error: null });

      await service.sendInvitationEmail({
        to: 'test@example.com',
        clinicName: 'Test Clinic',
        inviteUrl: 'https://example.com/invite?token=abc123',
        role: 'THERAPIST',
      });

      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'Mamirri <noreply@resend.dev>',
        to: 'test@example.com',
        subject: 'Invitación a Test Clinic',
        text: 'Has sido invitado a unirte a Test Clinic como Fisioterapeuta. Acepta tu invitación aquí: https://example.com/invite?token=abc123. Este enlace expira en 24 horas.',
      });
    });

    it('should throw error when Resend API fails', async () => {
      const apiError = new Error('API Error');
      mockResendSend.mockRejectedValue(apiError);

      await expect(
        service.sendInvitationEmail({
          to: 'test@example.com',
          clinicName: 'Test Clinic',
          inviteUrl: 'https://example.com/invite?token=abc123',
          role: 'THERAPIST',
        }),
      ).rejects.toThrow('API Error');
    });
  });

  describe('when RESEND_API_KEY is absent (graceful degradation)', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue(undefined),
            },
          },
        ],
      }).compile();

      service = module.get<EmailService>(EmailService);
    });

    it('should log to logger instead of sending email', async () => {
      const loggerLogSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation();

      await service.sendInvitationEmail({
        to: 'test@example.com',
        clinicName: 'Test Clinic',
        inviteUrl: 'https://example.com/invite?token=abc123',
        role: 'THERAPIST',
      });

      expect(mockResendSend).not.toHaveBeenCalled();
      expect(loggerLogSpy).toHaveBeenCalled();
      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Email] Would send invitation'),
      );

      loggerLogSpy.mockRestore();
    });
  });
});
