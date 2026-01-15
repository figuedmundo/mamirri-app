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

    it('should return 404 when updating a patient owned by another therapist', async () => {
      const patientId = 'p1';
      const therapistId = 't1';
      const updateDto = { name: 'Updated Name' };

      mockPatientsService.update.mockRejectedValue(new NotFoundException());

      await expect(
        controller.update(patientId, updateDto, { userId: therapistId }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPatientsService.update).toHaveBeenCalledWith(
        patientId,
        updateDto,
        therapistId,
      );
    });

    it('should return 404 when deleting a patient owned by another therapist', async () => {
      const patientId = 'p1';
      const therapistId = 't1';

      mockPatientsService.remove.mockRejectedValue(new NotFoundException());

      await expect(
        controller.remove(patientId, { userId: therapistId }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPatientsService.remove).toHaveBeenCalledWith(
        patientId,
        therapistId,
      );
    });
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

    it('should fail validation when phone format is invalid', async () => {
      const dto = new CreatePatientDto();
      dto.name = 'John Doe';
      dto.age = 30;
      dto.occupation = 'Tester';
      dto.birthDate = '1990-01-01';
      dto.phone = 'invalid-phone';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'phone')).toBe(true);
    });

    it('should fail validation when email format is invalid', async () => {
      const dto = new CreatePatientDto();
      dto.name = 'John Doe';
      dto.age = 30;
      dto.occupation = 'Tester';
      dto.birthDate = '1990-01-01';
      dto.phone = '1234567890';
      dto.email = 'invalid-email';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });
  });

  describe('Successful Operations', () => {
    it('should create a patient with valid data', async () => {
      const therapistId = 'therapist-1';
      const createDto = {
        name: 'John Doe',
        age: 30,
        occupation: 'Engineer',
        birthDate: '1990-01-01',
        phone: '1234567890',
      };

      const mockPatient = { id: 'p1', ...createDto };
      mockPatientsService.create.mockResolvedValue(mockPatient);

      const result = await controller.create(createDto, {
        userId: therapistId,
      });

      expect(service.create).toHaveBeenCalledWith(createDto, therapistId);
      expect(result).toEqual(mockPatient);
    });

    it('should update a patient with valid data', async () => {
      const therapistId = 'therapist-1';
      const patientId = 'p1';
      const updateDto = { name: 'Updated Name' };

      const mockPatient = { id: patientId, ...updateDto };
      mockPatientsService.update.mockResolvedValue(mockPatient);

      const result = await controller.update(patientId, updateDto, {
        userId: therapistId,
      });

      expect(service.update).toHaveBeenCalledWith(
        patientId,
        updateDto,
        therapistId,
      );
      expect(result).toEqual(mockPatient);
    });

    it('should delete a patient owned by therapist', async () => {
      const therapistId = 'therapist-1';
      const patientId = 'p1';

      mockPatientsService.remove.mockResolvedValue(undefined);

      await controller.remove(patientId, { userId: therapistId });

      expect(service.remove).toHaveBeenCalledWith(patientId, therapistId);
    });
  });

  describe('Pagination and Search', () => {
    it('should return paginated list with search filter', async () => {
      const therapistId = 'therapist-1';
      const mockPaginatedResponse = {
        data: [],
        meta: { total: 0, page: 1, lastPage: 0 },
      };

      mockPatientsService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(
        { userId: therapistId },
        1,
        20,
        'John',
      );

      expect(service.findAll).toHaveBeenCalledWith(therapistId, 1, 20, 'John');
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should return paginated list with correct metadata', async () => {
      const therapistId = 'therapist-1';
      const mockPaginatedResponse = {
        data: [],
        meta: { total: 10, page: 1, lastPage: 1 },
      };

      mockPatientsService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll({ userId: therapistId }, 1, 20);

      expect(service.findAll).toHaveBeenCalledWith(
        therapistId,
        1,
        20,
        undefined,
      );
      expect(result.meta.total).toBe(10);
      expect(result.meta.page).toBe(1);
      expect(result.meta.lastPage).toBe(1);
    });
  });
});
