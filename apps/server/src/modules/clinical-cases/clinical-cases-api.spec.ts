import { Test, TestingModule } from '@nestjs/testing';
import { ClinicalCasesController } from './clinical-cases.controller';
import { ClinicalCasesService } from './clinical-cases.service';
import { CreateClinicalCaseDto } from './dto/create-clinical-case.dto';
import { UpdateClinicalCaseDto } from './dto/update-clinical-case.dto';
import { NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';
import { ClinicalCase } from '@prisma/client';

describe('ClinicalCases API', () => {
  let controller: ClinicalCasesController;
  let service: ClinicalCasesService;

  const mockClinicalCasesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClinicalCasesController],
      providers: [
        {
          provide: ClinicalCasesService,
          useValue: mockClinicalCasesService,
        },
      ],
    }).compile();

    controller = module.get<ClinicalCasesController>(ClinicalCasesController);
    service = module.get<ClinicalCasesService>(ClinicalCasesService);
  });

  describe('Create Clinical Case', () => {
    it('should create a case for a patient owned by therapist', async () => {
      const therapistId = 'therapist-1';
      const patientId = 'patient-1';
      const createDto: CreateClinicalCaseDto = {
        patientId,
        title: 'Knee Rehabilitation',
        consultationReason: 'Chronic knee pain',
      };

      const expectedCase: ClinicalCase = {
        id: 'case-1',
        ...createDto,
        startDate: new Date(),
        status: 'active',
        consultationReason: createDto.consultationReason || '',
        patientId,
        createdAt: new Date(),
        updatedAt: new Date(),
        endDate: null,
        pathologicalHistory: null,
        pharmacologicalHistory: null,
        initialMedicalDiagnosis: null,
      };

      mockClinicalCasesService.create.mockResolvedValue(expectedCase);

      const result = await controller.create(createDto, {
        userId: therapistId,
      });

      expect(service.create).toHaveBeenCalledWith(createDto, therapistId);
      expect(result).toEqual(expectedCase);
    });

    it('should return 404 when creating a case for a patient NOT owned by therapist', async () => {
      const therapistId = 'therapist-1';
      const patientId = 'patient-2';
      const createDto: CreateClinicalCaseDto = {
        patientId,
        title: 'Knee Rehabilitation',
      };

      mockClinicalCasesService.create.mockRejectedValue(
        new NotFoundException(`Patient with ID ${patientId} not found`),
      );

      await expect(
        controller.create(createDto, { userId: therapistId }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('List Clinical Cases', () => {
    it('should list cases with status and patientId filters', async () => {
      const therapistId = 'therapist-1';
      const patientId = 'patient-1';
      const status = 'active';

      const mockPaginatedResponse = {
        data: [],
        meta: { total: 0, page: 1, lastPage: 0 },
      };

      mockClinicalCasesService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(
        { userId: therapistId },
        1,
        20,
        patientId,
        status,
      );

      expect(service.findAll).toHaveBeenCalledWith(
        therapistId,
        1,
        20,
        patientId,
        status,
        undefined,
      );
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('Get Single Clinical Case', () => {
    it('should return case detail with evaluations included', async () => {
      const therapistId = 'therapist-1';
      const caseId = 'case-1';

      const expectedCase = {
        id: caseId,
        title: 'Knee Rehabilitation',
        status: 'active',
        startDate: new Date(),
        patientId: 'patient-1',
        patient: { id: 'patient-1', name: 'John Doe' },
        evaluations: [],
        treatmentSessions: [],
        treatmentPlan: null,
        consultationReason: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        endDate: null,
        pathologicalHistory: null,
        pharmacologicalHistory: null,
        initialMedicalDiagnosis: null,
      };

      mockClinicalCasesService.findOne.mockResolvedValue(expectedCase as any);

      const result = await controller.findOne(caseId, { userId: therapistId });

      expect(service.findOne).toHaveBeenCalledWith(caseId, therapistId);
      expect(result).toEqual(expectedCase);
      expect((result as any).evaluations).toBeDefined();
      expect((result as any).treatmentSessions).toBeDefined();
    });

    it('should return 404 when accessing a case owned by another therapist', async () => {
      const therapistId = 'therapist-1';
      const caseId = 'case-2';

      mockClinicalCasesService.findOne.mockRejectedValue(
        new NotFoundException(`Clinical case with ID ${caseId} not found`),
      );

      await expect(
        controller.findOne(caseId, { userId: therapistId }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Update Clinical Case', () => {
    it('should update case status', async () => {
      const therapistId = 'therapist-1';
      const caseId = 'case-1';
      const updateDto: UpdateClinicalCaseDto = {
        status: 'completed',
      };

      const updatedCase = {
        id: caseId,
        title: 'Knee Rehabilitation',
        status: 'completed',
        startDate: new Date(),
        patientId: 'patient-1',
        patient: { id: 'patient-1', name: 'John Doe' },
        evaluations: [],
        treatmentSessions: [],
        treatmentPlan: null,
        consultationReason: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        endDate: null,
        pathologicalHistory: null,
        pharmacologicalHistory: null,
        initialMedicalDiagnosis: null,
      };

      mockClinicalCasesService.update.mockResolvedValue(updatedCase as any);

      const result = await controller.update(caseId, updateDto, {
        userId: therapistId,
      });

      expect(service.update).toHaveBeenCalledWith(
        caseId,
        updateDto,
        therapistId,
      );
      expect((result as any).status).toBe('completed');
    });

    it('should update multiple fields at once', async () => {
      const therapistId = 'therapist-1';
      const caseId = 'case-1';
      const updateDto: UpdateClinicalCaseDto = {
        status: 'inactive',
        title: 'Updated Title',
        consultationReason: 'Updated reason',
      };

      const updatedCase = {
        id: caseId,
        title: 'Updated Title',
        status: 'inactive',
        startDate: new Date(),
        patientId: 'patient-1',
        patient: { id: 'patient-1', name: 'John Doe' },
        evaluations: [],
        treatmentSessions: [],
        treatmentPlan: null,
        consultationReason: 'Updated reason',
        createdAt: new Date(),
        updatedAt: new Date(),
        endDate: null,
        pathologicalHistory: null,
        pharmacologicalHistory: null,
        initialMedicalDiagnosis: null,
      };

      mockClinicalCasesService.update.mockResolvedValue(updatedCase as any);

      const result = await controller.update(caseId, updateDto, {
        userId: therapistId,
      });

      expect(service.update).toHaveBeenCalledWith(
        caseId,
        updateDto,
        therapistId,
      );
      expect((result as any).status).toBe('inactive');
      expect((result as any).title).toBe('Updated Title');
      expect((result as any).consultationReason).toBe('Updated reason');
    });

    it('should return 404 when updating a case owned by another therapist', async () => {
      const therapistId = 'therapist-1';
      const caseId = 'case-2';
      const updateDto: UpdateClinicalCaseDto = {
        status: 'completed',
      };

      mockClinicalCasesService.update.mockRejectedValue(
        new NotFoundException(`Clinical case with ID ${caseId} not found`),
      );

      await expect(
        controller.update(caseId, updateDto, { userId: therapistId }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Delete Clinical Case', () => {
    it('should delete a case owned by therapist', async () => {
      const therapistId = 'therapist-1';
      const caseId = 'case-1';

      mockClinicalCasesService.remove.mockResolvedValue(undefined);

      await controller.remove(caseId, { userId: therapistId });

      expect(service.remove).toHaveBeenCalledWith(caseId, therapistId);
    });

    it('should return 404 when deleting a case owned by another therapist', async () => {
      const therapistId = 'therapist-1';
      const caseId = 'case-2';

      mockClinicalCasesService.remove.mockRejectedValue(
        new NotFoundException(`Clinical case with ID ${caseId} not found`),
      );

      await expect(
        controller.remove(caseId, { userId: therapistId }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
