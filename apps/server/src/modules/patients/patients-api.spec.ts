import { Test, TestingModule } from '@nestjs/testing';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';

describe('Patients API Refactoring', () => {
  let controller: PatientsController;
  let service: PatientsService;

  const mockPatientsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [
        {
          provide: PatientsService,
          useValue: mockPatientsService,
        },
      ],
    }).compile();

    controller = module.get<PatientsController>(PatientsController);
    service = module.get<PatientsService>(PatientsService);
  });

  describe('DTO Validation', () => {
    it('should fail validation when age is negative', async () => {
      const dto = new CreatePatientDto();
      dto.name = 'John Doe';
      dto.age = -5;
      dto.occupation = 'Tester';
      dto.birthDate = '1990-01-01';
      dto.phone = '1234567890';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('age');
    });

    it('should fail validation when name is too short', async () => {
      const dto = new CreatePatientDto();
      dto.name = 'J';
      dto.age = 30;
      dto.occupation = 'Tester';
      dto.birthDate = '1990-01-01';
      dto.phone = '1234567890';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });
  });

  describe('Therapist Isolation', () => {
    it('should return 404 when accessing a patient owned by another therapist', async () => {
      const patientId = 'p1';
      const therapistId = 't1';

      mockPatientsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(
        controller.findOne(patientId, { userId: therapistId }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPatientsService.findOne).toHaveBeenCalledWith(
        patientId,
        therapistId,
      );
    });
  });
});
