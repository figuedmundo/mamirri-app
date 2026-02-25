import { Test, TestingModule } from '@nestjs/testing';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';

describe('SessionsController', () => {
  let controller: SessionsController;
  let service: SessionsService;

  const mockSessionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    finalize: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [
        {
          provide: SessionsService,
          useValue: mockSessionsService,
        },
      ],
    }).compile();

    controller = module.get<SessionsController>(SessionsController);
    service = module.get<SessionsService>(SessionsService);
  });

  describe('create', () => {
    it('should create a session', async () => {
      const dto: CreateSessionDto = {
        clinicalCaseId: 'case-1',
        date: new Date(),
        phaseNumber: 1,
        procedures: ['Proc'],
        patientResponse: 'Resp',
        finalPainLevel: 2,
        observations: 'Obs',
      };
      const result = { id: 'sess-1', ...dto, status: 'DRAFT' };

      mockSessionsService.create.mockResolvedValue(result);

      expect(await controller.create(dto, { userId: 'therapist-1' })).toEqual(
        result,
      );
      expect(service.create).toHaveBeenCalledWith(
        dto,
        'therapist-1',
        undefined,
      );
    });
  });

  describe('finalize', () => {
    it('should finalize a session', async () => {
      const result = { id: 'sess-1', status: 'COMPLETED' };
      mockSessionsService.finalize.mockResolvedValue(result);

      expect(
        await controller.finalize('sess-1', { userId: 'therapist-1' }),
      ).toEqual(result);
      expect(service.finalize).toHaveBeenCalledWith(
        'sess-1',
        'therapist-1',
        undefined,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a session', async () => {
      mockSessionsService.remove.mockResolvedValue(undefined);
      await controller.remove('sess-1', { userId: 'therapist-1' });
      expect(service.remove).toHaveBeenCalledWith(
        'sess-1',
        'therapist-1',
        undefined,
      );
    });
  });
});
