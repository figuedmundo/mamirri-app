import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { EmailService } from '../email/email.service';

describe('ClinicsService', () => {
  let service: ClinicsService;
  let prisma: {
    clinic: {
      findFirst: jest.Mock;
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
    };
    clinicInvitation: {
      create: jest.Mock;
      findMany: jest.Mock;
    };
    patient: {
      updateMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  let txClinicCreate: jest.Mock;

  beforeEach(async () => {
    txClinicCreate = jest.fn().mockResolvedValue({
      id: 'clinic-1',
      name: 'Mamirri Clinic',
      email: 'clinic@example.com',
      isActive: true,
    });

    prisma = {
      clinic: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      clinicInvitation: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      patient: {
        updateMany: jest.fn(),
      },
      $transaction: jest.fn((cb: any) =>
        cb({
          clinic: {
            create: txClinicCreate,
          },
          user: {
            findUnique: jest
              .fn()
              .mockResolvedValue({ id: 'user-1', clinicId: null }),
            update: jest.fn().mockResolvedValue({ id: 'user-1' }),
            findMany: jest.fn().mockResolvedValue([]),
          },
          clinicInvitation: {
            create: jest.fn().mockResolvedValue({ id: 'inv-1' }),
          },
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClinicsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockReturnValue({
              accessToken: 'token',
              refreshToken: 'refresh',
              user: { id: 'user-1' },
            }),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendInvitationEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<ClinicsService>(ClinicsService);
  });

  it('returns availability true when name does not exist', async () => {
    prisma.clinic.findFirst.mockResolvedValue(null);

    const result = await service.checkNameAvailability('Clinic A');

    expect(result).toEqual({ available: true });
  });

  it('validates clinic name uniqueness with case-insensitive lookup', async () => {
    prisma.clinic.findFirst.mockResolvedValue({ id: 'clinic-1' });

    await expect(
      service.createClinic(
        {
          name: '  Mamirri Clinic  ',
          email: 'clinic@example.com',
        },
        {
          userId: 'user-1',
          role: 'THERAPIST',
          token: 'test-token',
          clinicId: null,
        },
      ),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prisma.clinic.findFirst).toHaveBeenCalledWith({
      where: {
        name: {
          equals: 'Mamirri Clinic',
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });
  });

  it('validates required fields for clinic creation (name and email)', async () => {
    await expect(
      service.createClinic(
        {
          name: 'A',
          email: 'clinic@example.com',
        },
        {
          userId: 'user-1',
          role: 'THERAPIST',
          token: 'test-token',
          clinicId: null,
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.createClinic(
        {
          name: 'Valid Clinic',
          email: '   ',
        },
        {
          userId: 'user-1',
          role: 'THERAPIST',
          token: 'test-token',
          clinicId: null,
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('handles optional fields (phone, address, logoUrl) when omitted', async () => {
    prisma.clinic.findFirst.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', clinicId: null });

    const result = await service.createClinic(
      {
        name: 'Mamirri Clinic',
        email: 'clinic@example.com',
      },
      { userId: 'user-1', role: 'ADMIN', token: 'test-token', clinicId: null },
    );

    expect(result.clinic.id).toBe('clinic-1');
    expect(txClinicCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Mamirri Clinic',
        email: 'clinic@example.com',
        phone: undefined,
        address: undefined,
        logoUrl: undefined,
      }),
    });
  });

  it('stores businessHours JSON structure in clinic creation', async () => {
    prisma.clinic.findFirst.mockResolvedValue(null);

    const businessHours = {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '10:00', close: '18:00', closed: false },
    };

    await service.createClinic(
      {
        name: 'Mamirri Clinic',
        email: 'clinic@example.com',
        businessHours,
      },
      { userId: 'user-1', role: 'ADMIN', token: 'test-token', clinicId: null },
    );

    expect(txClinicCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        businessHours,
      }),
    });
  });

  it('migrates solo patients for clinic owner', async () => {
    prisma.patient.updateMany.mockResolvedValue({ count: 3 });

    const result = await service.migrateSoloPatients('clinic-1', {
      userId: 'owner-1',
      role: 'CLINIC_OWNER',
      clinicId: 'clinic-1',
      token: 'test-token',
    });

    expect(result).toEqual({ clinicId: 'clinic-1', migratedCount: 3 });
  });

  it('updates onboarding-related clinic fields from admin settings', async () => {
    const updated = {
      id: 'clinic-1',
      name: 'Mamirri Clinic Updated',
      logoUrl: '/uploads/new-logo.png',
      subdomain: 'mamirri-updated',
      businessHours: {
        monday: { open: '08:00', close: '16:00', closed: false },
      },
    };

    prisma.clinic.findUnique.mockResolvedValue({
      id: 'clinic-1',
      name: 'Mamirri Clinic',
    });
    prisma.clinic.findFirst.mockResolvedValue(null);
    prisma.clinic.update.mockResolvedValue(updated);

    const result = await service.updateClinic(
      'clinic-1',
      {
        name: '  Mamirri Clinic Updated  ',
        logoUrl: '/uploads/new-logo.png',
        subdomain: '  mamirri-updated  ',
        businessHours: {
          monday: { open: '08:00', close: '16:00', closed: false },
        },
      },
      {
        userId: 'owner-1',
        role: 'CLINIC_OWNER',
        token: 'test-token',
        clinicId: 'clinic-1',
      },
    );

    expect(prisma.clinic.update).toHaveBeenCalledWith({
      where: { id: 'clinic-1' },
      data: expect.objectContaining({
        name: 'Mamirri Clinic Updated',
        logoUrl: '/uploads/new-logo.png',
        subdomain: 'mamirri-updated',
        businessHours: {
          monday: { open: '08:00', close: '16:00', closed: false },
        },
      }),
    });
    expect(result).toEqual(updated);
  });
});
