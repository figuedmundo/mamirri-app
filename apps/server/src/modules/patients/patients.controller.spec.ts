import { Test, TestingModule } from '@nestjs/testing';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

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
        name: 'John Doe',
        age: 30,
        occupation: 'Worker',
        phone: '123',
        birthDate: '1990-01-01',
      };
      const therapistId = 'therapist-1';
      const serviceResult = {
        id: '1',
        ...dto,
        birthDate: new Date(dto.birthDate),
        therapistId,
        createdAt: new Date(),
        email: null,
        previousOccupation: null,
        address: null,
        gender: null,
        deletedAt: null,
        isActive: true,
      };

      (service.create as jest.Mock).mockResolvedValue(serviceResult);

      const result = await controller.create(dto, {
        userId: therapistId,
      } as any);

      expect(service.create).toHaveBeenCalledWith(dto, therapistId);
      expect(result).toEqual(serviceResult);
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
        name: 'John Doe',
        age: 30,
        occupation: 'Engineer',
        therapistId,
        birthDate: new Date('1990-01-01'),
        createdAt: new Date(),
        email: null,
        phone: null,
        deletedAt: null,
      };

      (service.findOne as jest.Mock).mockResolvedValue(serviceResult);

      const result = await controller.findOne(id, {
        userId: therapistId,
      } as any);

      expect(service.findOne).toHaveBeenCalledWith(id, therapistId);
      expect(result).toEqual(serviceResult);
    });
  });

  describe('update', () => {
    it('should update a patient', async () => {
      const id = 'patient-1';
      const therapistId = 'therapist-1';
      const dto: UpdatePatientDto = { name: 'Jane Doe' };

      const serviceResult = {
        id,
        name: 'Jane Doe',
        age: 30,
        occupation: 'Engineer',
        therapistId,
        birthDate: new Date('1990-01-01'),
        createdAt: new Date(),
        email: null,
        phone: null,
        deletedAt: null,
      };

      (service.update as jest.Mock).mockResolvedValue(serviceResult);

      const result = await controller.update(id, dto, {
        userId: therapistId,
      } as any);

      expect(service.update).toHaveBeenCalledWith(id, dto, therapistId);
      expect(result).toEqual(serviceResult);
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
