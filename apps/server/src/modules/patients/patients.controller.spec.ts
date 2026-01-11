import { Test, TestingModule } from '@nestjs/testing';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';

describe('PatientsController', () => {
  let controller: PatientsController;
  let service: PatientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [
        {
          provide: PatientsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PatientsController>(PatientsController);
    service = module.get<PatientsService>(PatientsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a patient with therapistId', async () => {
      const dto: CreatePatientDto = {
        firstName: 'John',
        lastName: 'Doe',
        dob: '1990-01-01',
      };
      const therapistId = 'therapist-1';
      const serviceResult = {
        id: '1',
        ...dto,
        dob: new Date(dto.dob),
        therapistId,
        createdAt: new Date(),
        email: null,
        phone: null,
        deletedAt: null,
      };

      const expectedResult: PatientResponseDto = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        dob: new Date(dto.dob),
        email: null,
        phone: null,
        createdAt: serviceResult.createdAt,
      };

      (service.create as jest.Mock).mockResolvedValue(serviceResult);

      const result = await controller.create(dto, {
        userId: therapistId,
      } as any);

      expect(service.create).toHaveBeenCalledWith(dto, therapistId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should list patients for the current therapist', async () => {
      const therapistId = 'therapist-1';
      const query = { page: 1, limit: 20, search: 'John' };
      const serviceResult = {
        data: [],
        meta: { total: 0, page: 1, lastPage: 0 },
      };

      (service.findAll as jest.Mock).mockResolvedValue(serviceResult);

      const result = await controller.findAll(
        { userId: therapistId } as any,
        query.page,
        query.limit,
        query.search,
      );

      expect(service.findAll).toHaveBeenCalledWith(
        therapistId,
        query.page,
        query.limit,
        query.search,
      );
      expect(result).toEqual(serviceResult);
    });
  });

  describe('findOne', () => {
    it('should return a single patient', async () => {
      const id = 'patient-1';
      const therapistId = 'therapist-1';
      const serviceResult = {
        id,
        firstName: 'John',
        lastName: 'Doe',
        therapistId,
        dob: new Date('1990-01-01'),
        createdAt: new Date(),
        email: null,
        phone: null,
        deletedAt: null,
      };

      const expectedResult: PatientResponseDto = {
        id,
        firstName: 'John',
        lastName: 'Doe',
        dob: serviceResult.dob,
        createdAt: serviceResult.createdAt,
        email: null,
        phone: null,
      };

      (service.findOne as jest.Mock).mockResolvedValue(serviceResult);

      const result = await controller.findOne(id, {
        userId: therapistId,
      } as any);

      expect(service.findOne).toHaveBeenCalledWith(id, therapistId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a patient', async () => {
      const id = 'patient-1';
      const therapistId = 'therapist-1';
      const dto: UpdatePatientDto = { firstName: 'Jane' };

      const serviceResult = {
        id,
        firstName: 'Jane',
        lastName: 'Doe',
        therapistId,
        dob: new Date('1990-01-01'),
        createdAt: new Date(),
        email: null,
        phone: null,
        deletedAt: null,
      };

      const expectedResult: PatientResponseDto = {
        id,
        firstName: 'Jane',
        lastName: 'Doe',
        dob: serviceResult.dob,
        createdAt: serviceResult.createdAt,
        email: null,
        phone: null,
      };

      (service.update as jest.Mock).mockResolvedValue(serviceResult);

      const result = await controller.update(id, dto, {
        userId: therapistId,
      } as any);

      expect(service.update).toHaveBeenCalledWith(id, therapistId, dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should soft delete a patient', async () => {
      const id = 'patient-1';
      const therapistId = 'therapist-1';

      (service.remove as jest.Mock).mockResolvedValue(undefined);

      await controller.remove(id, { userId: therapistId } as any);

      expect(service.remove).toHaveBeenCalledWith(id, therapistId);
    });
  });
});
