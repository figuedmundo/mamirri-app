import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('PatientsService', () => {
  let service: PatientsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
    patient: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    clinicalCase: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    treatmentSession: {
      create: jest.fn(),
    },
    evaluation: {
      create: jest.fn(),
      update: jest.fn(),
    },
    treatmentPlan: {
      create: jest.fn(),
    },
  };

  const mockTherapistId = 'therapist-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPatient', () => {
    const createDto = {
      name: 'John Doe',
      age: 30,
      occupation: 'Engineer',
      phone: '1234567890',
      birthDate: '1993-01-01',
    };

    it('should create a patient successfully', async () => {
      const createdPatient = {
        id: 'p1',
        ...createDto,
        therapistId: mockTherapistId,
      };
      mockPrismaService.patient.create.mockResolvedValue(createdPatient);

      const result = await service.create(createDto, mockTherapistId);

      expect(result).toEqual(createdPatient);
      expect(mockPrismaService.patient.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ...createDto,
            birthDate: new Date(createDto.birthDate),
            therapistId: mockTherapistId,
            clinicalCases: expect.objectContaining({
              create: expect.objectContaining({
                title: 'Initial Case - General Evaluation',
              }),
            }),
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of patients scoped to therapist', async () => {
      const patients = [{ id: 'p1', name: 'John' }];
      mockPrismaService.patient.findMany.mockResolvedValue(patients);

      const result = await service.findAll(mockTherapistId);

      expect(result).toEqual(patients);
      expect(mockPrismaService.patient.findMany).toHaveBeenCalledWith({
        where: { therapistId: mockTherapistId, deletedAt: null },
        include: {
          clinicalCases: {
            include: { treatmentSessions: true, evaluation: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('addTreatmentSession', () => {
    const sessionId = 's1';
    const caseId = 'c1';
    const createSessionDto = {
      date: '2023-10-10T10:00:00Z',
      phaseNumber: 1,
      procedures: ['Massage'],
      patientResponse: 'Good',
      finalPainLevel: 5,
      observations: 'None',
    };

    it('should add a treatment session to an active case', async () => {
      const activeCase = {
        id: caseId,
        patient: { therapistId: mockTherapistId },
      };
      mockPrismaService.clinicalCase.findFirst.mockResolvedValue(activeCase);
      mockPrismaService.treatmentSession.create.mockResolvedValue({
        id: sessionId,
        ...createSessionDto,
      });

      const result = await service.addSession(
        caseId,
        createSessionDto,
        mockTherapistId,
      );

      expect(result).toBeDefined();
      expect(mockPrismaService.treatmentSession.create).toHaveBeenCalledWith({
        data: {
          ...createSessionDto,
          date: new Date(createSessionDto.date),
          clinicalCaseId: caseId,
          therapistId: mockTherapistId,
        },
      });
    });

    it('should throw error if case not found or access denied', async () => {
      mockPrismaService.clinicalCase.findFirst.mockResolvedValue(null);

      await expect(
        service.addSession(caseId, createSessionDto, mockTherapistId),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
