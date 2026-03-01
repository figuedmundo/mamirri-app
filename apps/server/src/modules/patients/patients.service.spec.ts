import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PatientsService', () => {
  let service: PatientsService;

  const mockPrismaService = {
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
    patient: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
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
      findFirst: jest.fn(),
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
        {
          provide: StorageService,
          useValue: {
            getFileUrl: jest.fn(),
            toStorageKey: jest.fn((value) => value),
          },
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPatient', () => {
    const createDto = {
      name: 'John Doe',
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

      const result = await service.create(createDto as any, mockTherapistId);

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

    it('should throw BadRequestException if birthDate is invalid', async () => {
      const invalidDto = { ...createDto, birthDate: 'invalid-date' };
      await expect(service.create(invalidDto, mockTherapistId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated patients scoped to therapist', async () => {
      const patients = [{ id: 'p1', name: 'John' }];
      const count = 1;
      mockPrismaService.$transaction.mockResolvedValue([count, patients]);

      const result = await service.findAll(mockTherapistId, 1, 20);

      expect(result).toEqual({
        data: patients,
        meta: { total: 1, page: 1, lastPage: 1 },
      });

      expect(mockPrismaService.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ therapistId: mockTherapistId }),
          skip: 0,
          take: 20,
        }),
      );
    });

    it('should filter by search term', async () => {
      const patients = [{ id: 'p1', name: 'John' }];
      mockPrismaService.$transaction.mockResolvedValue([1, patients]);

      await service.findAll(mockTherapistId, 1, 20, 'John');

      expect(mockPrismaService.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            therapistId: mockTherapistId,
            OR: [
              { name: { contains: 'John', mode: 'insensitive' } },
              { phone: { contains: 'John', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a patient by id', async () => {
      const patient = {
        id: 'p1',
        name: 'John Doe',
        therapistId: mockTherapistId,
        clinicalCases: [],
      };
      mockPrismaService.patient.findFirst.mockResolvedValue(patient);

      const result = await service.findOne('p1', mockTherapistId);

      expect(result).toEqual(patient);
      expect(mockPrismaService.patient.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'p1', therapistId: mockTherapistId, deletedAt: null },
          include: expect.objectContaining({
            clinicalCases: expect.objectContaining({
              include: expect.objectContaining({
                treatmentPlan: {
                  include: {
                    protocols: {
                      include: {
                        protocol: true,
                      },
                    },
                  },
                },
              }),
            }),
          }),
        }),
      );
    });

    it('should throw NotFoundException if patient not found', async () => {
      mockPrismaService.patient.findFirst.mockResolvedValue(null);

      await expect(service.findOne('p1', mockTherapistId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = { name: 'Jane Doe' };

    it('should update a patient successfully', async () => {
      const existingPatient = {
        id: 'p1',
        name: 'John Doe',
        therapistId: mockTherapistId,
        clinicalCases: [],
      };
      const updatedPatient = { ...existingPatient, ...updateDto };

      mockPrismaService.patient.findFirst.mockResolvedValue(existingPatient);
      mockPrismaService.patient.update.mockResolvedValue(updatedPatient);

      const result = await service.update(
        'p1',
        updateDto as any,
        mockTherapistId,
      );

      expect(result).toEqual(updatedPatient);
      expect(mockPrismaService.patient.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: updateDto,
      });
    });

    it('should convert birthDate string to Date', async () => {
      const existingPatient = {
        id: 'p1',
        name: 'John Doe',
        therapistId: mockTherapistId,
        clinicalCases: [],
      };
      mockPrismaService.patient.findFirst.mockResolvedValue(existingPatient);
      mockPrismaService.patient.update.mockResolvedValue(existingPatient);

      await service.update('p1', { birthDate: '1995-05-15' }, mockTherapistId);

      expect(mockPrismaService.patient.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { birthDate: new Date('1995-05-15') },
      });
    });

    it('should throw BadRequestException if birthDate is invalid', async () => {
      const existingPatient = {
        id: 'p1',
        name: 'John Doe',
        therapistId: mockTherapistId,
        clinicalCases: [],
      };
      mockPrismaService.patient.findFirst.mockResolvedValue(existingPatient);

      await expect(
        service.update('p1', { birthDate: 'invalid-date' }, mockTherapistId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if patient not found', async () => {
      mockPrismaService.patient.findFirst.mockResolvedValue(null);

      await expect(
        service.update('p1', updateDto, mockTherapistId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a patient', async () => {
      const patient = {
        id: 'p1',
        name: 'John Doe',
        therapistId: mockTherapistId,
        clinicalCases: [],
      };
      mockPrismaService.patient.findFirst.mockResolvedValue(patient);
      mockPrismaService.patient.update.mockResolvedValue({
        ...patient,
        deletedAt: new Date(),
      });

      await service.remove('p1', mockTherapistId);

      expect(mockPrismaService.patient.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw NotFoundException if patient not found', async () => {
      mockPrismaService.patient.findFirst.mockResolvedValue(null);

      await expect(service.remove('p1', mockTherapistId)).rejects.toThrow(
        NotFoundException,
      );
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
          clinicId: null,
        },
      });
    });

    it('should throw BadRequestException if date is invalid', async () => {
      const activeCase = {
        id: caseId,
        patient: { therapistId: mockTherapistId },
      };
      mockPrismaService.clinicalCase.findFirst.mockResolvedValue(activeCase);

      const invalidDto = { ...createSessionDto, date: 'invalid-date' };
      await expect(
        service.addSession(caseId, invalidDto, mockTherapistId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if case not found or access denied', async () => {
      mockPrismaService.clinicalCase.findFirst.mockResolvedValue(null);

      await expect(
        service.addSession(caseId, createSessionDto, mockTherapistId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateEvaluation', () => {
    const evaluationId = 'e1';
    const updateDto = {
      painScale: { rest: 2, activity: 5 },
      diagnosis: { primary: 'Back pain' },
    };

    it('should update an evaluation successfully', async () => {
      const existingEvaluation = {
        id: evaluationId,
        clinicalCase: { patient: { therapistId: mockTherapistId } },
      };
      const updatedEvaluation = { ...existingEvaluation, ...updateDto };

      mockPrismaService.evaluation.findFirst.mockResolvedValue(
        existingEvaluation,
      );
      mockPrismaService.evaluation.update.mockResolvedValue(updatedEvaluation);

      const result = await service.updateEvaluation(
        evaluationId,
        updateDto,
        mockTherapistId,
      );

      expect(result).toEqual(updatedEvaluation);
      expect(mockPrismaService.evaluation.update).toHaveBeenCalledWith({
        where: { id: evaluationId },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if evaluation not found', async () => {
      mockPrismaService.evaluation.findFirst.mockResolvedValue(null);

      await expect(
        service.updateEvaluation(evaluationId, updateDto, mockTherapistId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if evaluation belongs to different therapist', async () => {
      mockPrismaService.evaluation.findFirst.mockResolvedValue(null);

      await expect(
        service.updateEvaluation(evaluationId, updateDto, 'other-therapist'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
