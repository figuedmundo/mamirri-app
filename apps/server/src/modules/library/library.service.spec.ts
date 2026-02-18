import { Test, TestingModule } from '@nestjs/testing';
import { LibraryService } from './library.service';
import { PrismaService } from '../../prisma/prisma.service';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

describe('LibraryService', () => {
  let service: LibraryService;

  const mockPrismaService = {
    clinicalCategory: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    protocol: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    bibliographicReference: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    protocolReference: {
      deleteMany: jest.fn(),
    },
    treatmentPlan: {
      findFirst: jest.fn(),
    },
    treatmentPlanProtocol: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockKnowledgeBaseService = {
    findSimilar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LibraryService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: KnowledgeBaseService, useValue: mockKnowledgeBaseService },
      ],
    }).compile();

    service = module.get<LibraryService>(LibraryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllCategories', () => {
    it('should return all categories ordered by name', async () => {
      const categories = [
        {
          id: 'cat-001',
          name: 'Miología',
          description: 'Músculos',
          icon: 'muscle',
        },
        {
          id: 'cat-002',
          name: 'Osteología',
          description: 'Huesos',
          icon: 'bone',
        },
      ];
      mockPrismaService.clinicalCategory.findMany.mockResolvedValue(categories);

      const result = await service.findAllCategories();

      expect(result).toEqual(categories);
      expect(mockPrismaService.clinicalCategory.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findAllProtocols', () => {
    it('should return all protocols when no categoryId provided', async () => {
      const protocols = [{ id: 'prot-001', title: 'Test Protocol' }];
      mockPrismaService.protocol.findMany.mockResolvedValue(protocols);

      const result = await service.findAllProtocols();

      expect(result).toEqual(protocols);
      expect(mockPrismaService.protocol.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        include: {
          category: true,
          references: { include: { reference: true } },
        },
        orderBy: { title: 'asc' },
      });
    });

    it('should filter by categoryId and deletedAt when provided', async () => {
      mockPrismaService.protocol.findMany.mockResolvedValue([]);

      await service.findAllProtocols('cat-005');

      expect(mockPrismaService.protocol.findMany).toHaveBeenCalledWith({
        where: { categoryId: 'cat-005', deletedAt: null },
        include: {
          category: true,
          references: { include: { reference: true } },
        },
        orderBy: { title: 'asc' },
      });
    });

    it('should include archived protocols when includeDeleted is true', async () => {
      mockPrismaService.protocol.findMany.mockResolvedValue([]);

      await service.findAllProtocols(undefined, true);

      expect(mockPrismaService.protocol.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          category: true,
          references: { include: { reference: true } },
        },
        orderBy: { title: 'asc' },
      });
    });
  });

  describe('findOneProtocol', () => {
    it('should return protocol with relations', async () => {
      const protocol = {
        id: 'prot-001',
        title: 'Posición de la Esfinge',
        category: { id: 'cat-005', name: 'Protocolos' },
        references: [],
      };
      mockPrismaService.protocol.findFirst.mockResolvedValue(protocol);

      const result = await service.findOneProtocol('prot-001');

      expect(result).toEqual(protocol);
      expect(mockPrismaService.protocol.findFirst).toHaveBeenCalledWith({
        where: { id: 'prot-001', deletedAt: null },
        include: {
          category: true,
          references: { include: { reference: true } },
        },
      });
    });

    it('should throw NotFoundException when protocol not found', async () => {
      mockPrismaService.protocol.findFirst.mockResolvedValue(null);

      await expect(service.findOneProtocol('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createProtocol', () => {
    it('should create protocol with normalized tags and references', async () => {
      const dto = {
        title: '  Esfinge  ',
        categoryId: 'cat-1',
        definition: ' Definicion ',
        rationale: ' Razon ',
        procedure: [' Paso 1 ', 'Paso 2'],
        tags: ['Lumbar', 'lumbar', '  Dolor  '],
        referenceIds: ['ref-1'],
      };

      mockPrismaService.clinicalCategory.findUnique = jest
        .fn()
        .mockResolvedValue({ id: 'cat-1' });
      mockPrismaService.protocol.findFirst.mockResolvedValue(null);
      mockPrismaService.bibliographicReference.findMany.mockResolvedValue([
        { id: 'ref-1' },
      ]);
      mockPrismaService.protocol.create.mockResolvedValue({ id: 'prot-1' });

      await service.createProtocol(dto);

      expect(mockPrismaService.protocol.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Esfinge',
            tags: ['lumbar', 'dolor'],
          }),
        }),
      );
    });
  });

  describe('archiveProtocol', () => {
    it('should mark protocol as archived', async () => {
      mockPrismaService.protocol.findFirst.mockResolvedValue({
        id: 'prot-1',
        deletedAt: null,
      });
      mockPrismaService.protocol.update.mockResolvedValue({ id: 'prot-1' });

      await service.archiveProtocol('prot-1');

      expect(mockPrismaService.protocol.update).toHaveBeenCalledWith({
        where: { id: 'prot-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });

  describe('restoreProtocol', () => {
    it('should restore protocol by clearing deletedAt', async () => {
      mockPrismaService.protocol.findFirst.mockResolvedValue({
        id: 'prot-1',
        title: 'Esfinge',
        categoryId: 'cat-1',
        deletedAt: new Date('2026-01-01T00:00:00.000Z'),
      });
      mockPrismaService.protocol.findUnique.mockResolvedValue({
        id: 'prot-1',
        title: 'Esfinge',
        categoryId: 'cat-1',
        deletedAt: new Date('2026-01-01T00:00:00.000Z'),
      });
      mockPrismaService.protocol.findFirst
        .mockResolvedValueOnce({
          id: 'prot-1',
          title: 'Esfinge',
          categoryId: 'cat-1',
          deletedAt: new Date('2026-01-01T00:00:00.000Z'),
        })
        .mockResolvedValueOnce(null);
      mockPrismaService.protocol.update.mockResolvedValue({ id: 'prot-1' });

      await service.restoreProtocol('prot-1');

      expect(mockPrismaService.protocol.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prot-1' },
          data: { deletedAt: null },
        }),
      );
    });
  });

  describe('findAllReferences', () => {
    it('should return all references ordered by author', async () => {
      const refs = [{ id: 'ref-001', author: 'Anderson, B.' }];
      mockPrismaService.bibliographicReference.findMany.mockResolvedValue(refs);

      const result = await service.findAllReferences();

      expect(result).toEqual(refs);
      expect(
        mockPrismaService.bibliographicReference.findMany,
      ).toHaveBeenCalledWith({
        orderBy: { author: 'asc' },
      });
    });
  });

  describe('search', () => {
    it('should return structured + RAG results', async () => {
      const protocols = [{ id: 'prot-001', title: 'Esfinge' }];
      const ragResults = [{ id: 'emb-001', content: 'Relevant passage' }];

      mockPrismaService.protocol.findMany.mockResolvedValue(protocols);
      mockKnowledgeBaseService.findSimilar.mockResolvedValue(ragResults);

      const result = await service.search('hipercifosis');

      expect(result).toEqual({ protocols, ragResults });
      expect(mockPrismaService.protocol.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          OR: [
            { title: { contains: 'hipercifosis', mode: 'insensitive' } },
            { definition: { contains: 'hipercifosis', mode: 'insensitive' } },
            { tags: { has: 'hipercifosis' } },
          ],
        },
        include: {
          category: true,
          references: { include: { reference: true } },
        },
      });
      expect(mockKnowledgeBaseService.findSimilar).toHaveBeenCalledWith(
        'hipercifosis',
        5,
      );
    });

    it('should gracefully handle RAG failure', async () => {
      mockPrismaService.protocol.findMany.mockResolvedValue([]);
      mockKnowledgeBaseService.findSimilar.mockRejectedValue(
        new Error('API down'),
      );

      const result = await service.search('test query');

      expect(result).toEqual({ protocols: [], ragResults: [] });
    });
  });

  describe('addProtocolToPlan', () => {
    const mockTherapistId = 'therapist-123';
    const mockPlanId = 'plan-456';
    const mockProtocolId = 'prot-001';

    it('should add protocol to plan successfully', async () => {
      const plan = { id: mockPlanId };
      const protocol = { id: mockProtocolId, title: 'Esfinge' };
      const created = {
        treatmentPlanId: mockPlanId,
        protocolId: mockProtocolId,
        notes: 'For lumbar pain',
        protocol,
      };

      mockPrismaService.treatmentPlan.findFirst.mockResolvedValue(plan);
      mockPrismaService.protocol.findFirst.mockResolvedValue(protocol);
      mockPrismaService.treatmentPlanProtocol.findUnique.mockResolvedValue(
        null,
      );
      mockPrismaService.treatmentPlanProtocol.create.mockResolvedValue(created);

      const result = await service.addProtocolToPlan(
        mockPlanId,
        mockProtocolId,
        mockTherapistId,
        'For lumbar pain',
      );

      expect(result).toEqual(created);
    });

    it('should throw NotFoundException when plan not found', async () => {
      mockPrismaService.treatmentPlan.findFirst.mockResolvedValue(null);

      await expect(
        service.addProtocolToPlan(mockPlanId, mockProtocolId, mockTherapistId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when protocol not found', async () => {
      mockPrismaService.treatmentPlan.findFirst.mockResolvedValue({
        id: mockPlanId,
      });
      mockPrismaService.protocol.findFirst.mockResolvedValue(null);

      await expect(
        service.addProtocolToPlan(mockPlanId, mockProtocolId, mockTherapistId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when protocol is archived', async () => {
      mockPrismaService.treatmentPlan.findFirst.mockResolvedValue({
        id: mockPlanId,
      });
      mockPrismaService.protocol.findFirst.mockResolvedValue(null);

      await expect(
        service.addProtocolToPlan(mockPlanId, mockProtocolId, mockTherapistId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when protocol already added', async () => {
      mockPrismaService.treatmentPlan.findFirst.mockResolvedValue({
        id: mockPlanId,
      });
      mockPrismaService.protocol.findFirst.mockResolvedValue({
        id: mockProtocolId,
      });
      mockPrismaService.treatmentPlanProtocol.findUnique.mockResolvedValue({
        treatmentPlanId: mockPlanId,
        protocolId: mockProtocolId,
      });

      await expect(
        service.addProtocolToPlan(mockPlanId, mockProtocolId, mockTherapistId),
      ).rejects.toThrow(ConflictException);
    });
  });
});
