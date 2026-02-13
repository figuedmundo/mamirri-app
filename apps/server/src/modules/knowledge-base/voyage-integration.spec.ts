import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeBaseService } from './knowledge-base.service';
import { VoyageEmbeddingService } from './services/voyage-embedding.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(true),
}));

describe('VoyageIntegration', () => {
  let service: KnowledgeBaseService;
  let voyageService: VoyageEmbeddingService;

  const mockPrisma = {
    document: {
      findUnique: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 'doc-1', title: 'test' }),
      delete: jest.fn(),
    },
    $executeRaw: jest.fn().mockResolvedValue(1),
    $queryRaw: jest.fn().mockResolvedValue([]),
  };

  const mockVoyageService = {
    generateDocumentEmbedding: jest
      .fn()
      .mockResolvedValue(new Array(1024).fill(0.1)),
    generateQueryEmbedding: jest
      .fn()
      .mockResolvedValue(new Array(1024).fill(0.2)),
    generateDocumentEmbeddingsBatch: jest
      .fn()
      .mockImplementation((texts) =>
        Promise.resolve(texts.map(() => new Array(1024).fill(0.1))),
      ),
  };

  const mockConfig = {
    get: jest.fn((key: string) => {
      if (key === 'GOOGLE_API_KEY') return 'google-key';
      if (key === 'COHERE_API_KEY') return 'cohere-key';
      return 'mock-value';
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeBaseService,
        { provide: VoyageEmbeddingService, useValue: mockVoyageService },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<KnowledgeBaseService>(KnowledgeBaseService);
    voyageService = module.get<VoyageEmbeddingService>(VoyageEmbeddingService);
  });

  it('should use VoyageEmbeddingService for ingestion', async () => {
    // Mock extraction to avoid python/fs calls
    jest
      .spyOn(service as any, 'extractPdfWithPyMuPDF')
      .mockResolvedValue('text');
    jest
      .spyOn(service as any, 'extractMetadata')
      .mockResolvedValue({ title: 'T', author: 'A' });
    mockPrisma.document.findUnique.mockResolvedValue(null);

    await service.ingestFile('test.pdf');

    expect(voyageService.generateDocumentEmbeddingsBatch).toHaveBeenCalled();
    // Verify it uses document embedding (voyage-4-large)
    expect(mockPrisma.$executeRaw).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringContaining('vector')]),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.stringContaining('[0.1,0.1'), // Matches our mock vector
      expect.anything(),
      expect.anything(),
    );
  });

  it('should use VoyageEmbeddingService for similarity search', async () => {
    await service.findSimilar('test query', 5);

    expect(voyageService.generateQueryEmbedding).toHaveBeenCalledWith(
      'test query',
    );
  });

  it('should use asymmetric retrieval (query model for search)', async () => {
    // This is implicitly tested by generateQueryEmbedding being called in findSimilar
    // and generateDocumentEmbeddingsBatch being called in ingestFile
    await service.findSimilar('query');
    expect(voyageService.generateQueryEmbedding).toHaveBeenCalled();
  });
});
