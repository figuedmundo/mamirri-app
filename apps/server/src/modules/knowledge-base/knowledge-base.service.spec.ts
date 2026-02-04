import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeBaseService } from './knowledge-base.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

jest.mock('pdf-parse', () => {
  return {
    PDFParse: jest.fn().mockImplementation(() => ({
      getText: jest.fn().mockResolvedValue({ text: 'Mocked PDF content' }),
      destroy: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue(Buffer.from('mock pdf data')),
}));

describe('KnowledgeBaseService', () => {
  let service: KnowledgeBaseService;
  let prisma: PrismaService;

  const mockPrisma = {
    document: {
      findUnique: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 'doc-1', title: 'test' }),
    },
    $executeRaw: jest.fn().mockResolvedValue(1),
    $queryRaw: jest.fn().mockResolvedValue([]),
  };

  const mockConfig = {
    get: jest.fn().mockReturnValue('mock-api-key'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeBaseService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<KnowledgeBaseService>(KnowledgeBaseService);
    prisma = module.get<PrismaService>(PrismaService);

    (service as any).generateEmbedding = jest
      .fn()
      .mockResolvedValue(new Array(768).fill(0));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('chunkText', () => {
    it('should split text into chunks with overlap', () => {
      const text = 'word '.repeat(100);
      const chunks = (service as any).chunkText(text, 50, 10);

      expect(chunks.length).toBeGreaterThan(1);
      expect(chunks[0].split(' ').length).toBe(50);
    });
  });

  describe('ingestFile', () => {
    it('should ingest a file and create document and embeddings', async () => {
      mockPrisma.document.findUnique.mockResolvedValue(null);

      await service.ingestFile('data/books/test.pdf');

      expect((prisma as any).document.create).toHaveBeenCalled();
      expect(prisma.$executeRaw).toHaveBeenCalled();
    });

    it('should skip already ingested files', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({ id: 'existing' });

      await service.ingestFile('data/books/test.pdf');

      expect((prisma as any).document.create).not.toHaveBeenCalled();
    });
  });

  describe('findSimilar', () => {
    it('should perform similarity search', async () => {
      const mockResults = [{ content: 'test result', similarity: 0.9 }];
      mockPrisma.$queryRaw.mockResolvedValue(mockResults);

      const results = await service.findSimilar('test query', 5);

      expect(results).toEqual(mockResults);
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });
});
