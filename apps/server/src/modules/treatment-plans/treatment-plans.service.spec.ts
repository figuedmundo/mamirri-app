import { Test, TestingModule } from '@nestjs/testing';
import { TreatmentPlansService } from './treatment-plans.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TreatmentPlansService', () => {
  let service: TreatmentPlansService;

  const mockPrismaService = {
    treatmentPlan: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockTherapistId = 'therapist-123';
  const mockPlanId = 'plan-456';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TreatmentPlansService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TreatmentPlansService>(TreatmentPlansService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateObjectives', () => {
    it('should update objectives successfully with valid data', async () => {
      const existingPlan = {
        id: mockPlanId,
        objectives: {
          therapeutic: 'old value',
          prophylactic: '',
          educational: '',
        },
        clinicalCase: {
          patient: { therapistId: mockTherapistId },
        },
      };
      const updateDto = { therapeutic: 'Reducir dolor de 9/10 a 3/10' };
      const updatedPlan = {
        ...existingPlan,
        objectives: { ...existingPlan.objectives, ...updateDto },
      };

      mockPrismaService.treatmentPlan.findFirst.mockResolvedValue(existingPlan);
      mockPrismaService.treatmentPlan.update.mockResolvedValue(updatedPlan);

      const result = await service.updateObjectives(
        mockPlanId,
        updateDto,
        mockTherapistId,
      );

      expect(result.objectives).toEqual(updatedPlan.objectives);
      expect(mockPrismaService.treatmentPlan.update).toHaveBeenCalledWith({
        where: { id: mockPlanId },
        data: {
          objectives: expect.objectContaining({
            therapeutic: updateDto.therapeutic,
          }),
        },
      });
    });

    it('should throw NotFoundException when treatment plan not found', async () => {
      mockPrismaService.treatmentPlan.findFirst.mockResolvedValue(null);

      await expect(
        service.updateObjectives(
          mockPlanId,
          { therapeutic: 'test' },
          mockTherapistId,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when accessing another therapist plan', async () => {
      mockPrismaService.treatmentPlan.findFirst.mockResolvedValue(null);

      await expect(
        service.updateObjectives(
          mockPlanId,
          { therapeutic: 'test' },
          'other-therapist',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should support partial update of single objective field', async () => {
      const existingPlan = {
        id: mockPlanId,
        objectives: {
          therapeutic: 'existing therapeutic',
          prophylactic: 'existing prophylactic',
          educational: 'existing educational',
        },
      };
      const updateDto = { educational: 'Updated educational goal' };

      mockPrismaService.treatmentPlan.findFirst.mockResolvedValue(existingPlan);
      mockPrismaService.treatmentPlan.update.mockResolvedValue({
        ...existingPlan,
        objectives: { ...existingPlan.objectives, ...updateDto },
      });

      await service.updateObjectives(mockPlanId, updateDto, mockTherapistId);

      expect(mockPrismaService.treatmentPlan.update).toHaveBeenCalledWith({
        where: { id: mockPlanId },
        data: {
          objectives: expect.objectContaining({
            therapeutic: 'existing therapeutic',
            prophylactic: 'existing prophylactic',
            educational: 'Updated educational goal',
          }),
        },
      });
    });
  });
});
