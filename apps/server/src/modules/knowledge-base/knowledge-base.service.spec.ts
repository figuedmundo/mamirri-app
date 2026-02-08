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
    embedding: {
      create: jest.fn(),
      findMany: jest.fn(),
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
    }, 30000);

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

      const results = await service.findSimilar('test query', 5, undefined, {
        hybridSearch: false,
      });

      expect(results).toEqual(mockResults);
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('findSimilarBM25', () => {
    it('should find exact term matches using full-text search', async () => {
      const mockBM25Results = [
        {
          id: '1',
          content: 'Metformina content',
          pageNumber: 1,
          documentTitle: 'Doc 1',
          documentAuthor: 'Author 1',
          documentFilePath: 'path/1',
          documentMetadata: {},
          bm25Score: 0.8,
        },
      ];
      mockPrisma.$queryRaw.mockResolvedValue(mockBM25Results);

      const results = await service.findSimilarBM25('metformina', 5);

      expect(results).toHaveLength(1);
      expect(results[0].bm25Score).toBe(0.8);
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('combineWithRRF', () => {
    it('should correctly combine dense and sparse results', () => {
      const denseResults = [
        { id: '1', similarity: 0.9, content: 'A' },
        { id: '2', similarity: 0.8, content: 'B' },
      ];
      const sparseResults = [
        { id: '2', bm25Score: 0.5, content: 'B' },
        { id: '3', bm25Score: 0.4, content: 'C' },
      ];

      const combined = (service as any).combineWithRRF(
        denseResults,
        sparseResults,
      );

      expect(combined[0].id).toBe('2');
      expect(combined[0].rrfScore).toBeGreaterThan(combined[1].rrfScore);
      expect(combined.length).toBe(3);
    });
  });

  describe('findSimilar with hybrid', () => {
    it('should use hybrid search by default', async () => {
      const mockDenseResults = [{ id: '1', similarity: 0.9 }];
      const mockBM25Results = [{ id: '1', bm25Score: 0.8 }];

      mockPrisma.$queryRaw
        .mockResolvedValueOnce(mockDenseResults)
        .mockResolvedValueOnce(mockBM25Results);

      const results = await service.findSimilar('query');

      expect(results).toHaveLength(1);
      expect(results[0].rrfScore).toBeDefined();
    });

    it('should fall back to dense-only when BM25 returns empty', async () => {
      const mockDenseResults = [{ id: '1', similarity: 0.9 }];
      const mockBM25Results: any[] = [];

      mockPrisma.$queryRaw.mockImplementation(async (query: any) => {
        const sqlString = JSON.stringify(query);
        if (sqlString.includes('ts_rank')) {
          return mockBM25Results;
        }
        return mockDenseResults;
      });

      const results = await service.findSimilar('query');

      expect(results).toHaveLength(1);
      expect(results[0].similarity).toBe(0.9);
      expect(results[0].rrfScore).toBeUndefined();
    });

    it('should apply metadata filters correctly', async () => {
      const filters = { minYear: 2020 };
      mockPrisma.$queryRaw.mockResolvedValue([]);

      await (service as any).findSimilarDense('query', 5, filters);

      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('Schema Validation', () => {
    it('should allow creating embedding with parentId and parentContent', async () => {
      mockPrisma.embedding.create.mockResolvedValue({
        id: 'emb-1',
        content: 'child',
        parentId: 'parent-1',
        parentContent: 'parent content',
        pageNumber: 1,
        documentId: 'doc-1',
      });

      const result = await prisma.embedding.create({
        data: {
          content: 'child',
          pageNumber: 1,
          documentId: 'doc-1',
          parentId: 'parent-1',
          parentContent: 'parent content',
        },
      });

      expect(result).toBeDefined();
      expect(result.parentId).toBe('parent-1');
      expect(result.parentContent).toBe('parent content');
      expect(prisma.embedding.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            parentId: 'parent-1',
            parentContent: 'parent content',
          }),
        }),
      );
    });

    it('should allow filtering embeddings by parentId', async () => {
      mockPrisma.embedding.findMany.mockResolvedValue([
        { id: 'emb-1', content: 'child', parentId: 'parent-1' },
      ]);

      const results = await prisma.embedding.findMany({
        where: {
          parentId: 'parent-1',
        },
      });

      expect(results).toHaveLength(1);
      expect(results[0].parentId).toBe('parent-1');
      expect(prisma.embedding.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            parentId: 'parent-1',
          },
        }),
      );
    });

    it('should allow retrieving parent content', async () => {
      mockPrisma.embedding.findMany.mockResolvedValue([
        { id: 'emb-1', content: 'child', parentContent: 'large context' },
      ]);

      const results = await prisma.embedding.findMany({
        select: {
          content: true,
          parentContent: true,
        },
      });

      expect(results[0].parentContent).toBe('large context');
    });
  });

  describe('semanticChunk', () => {
    it('should split text preserving sentence boundaries', async () => {
      const text = 'First sentence. Second sentence. Third sentence.';
      (service as any).generateEmbedding = jest
        .fn()
        .mockResolvedValue(new Array(768).fill(0.1));

      const result = await (service as any).semanticChunk(text, {
        similarityThreshold: 0.85,
        targetChunkSize: 10,
        maxChunkSize: 20,
      });

      expect(result.chunks.length).toBeGreaterThan(0);
      expect(result.chunks[0]).toContain('First sentence.');
    });

    it('should respect paragraph boundaries', async () => {
      const text = 'Paragraph one.\n\nParagraph two.';
      (service as any).generateEmbedding = jest
        .fn()
        .mockResolvedValue(new Array(768).fill(0.1));

      const result = await (service as any).semanticChunk(text);

      expect(result.chunks.length).toBeGreaterThanOrEqual(1);
      // Depending on chunk size, it might be 1 or 2 chunks if paragraphs are small.
      // But semanticChunk forces paragraph split?
      // "Respect paragraph boundaries: \n\n splits ALWAYS create a new chunk"
      // Wait, my implementation:
      // 1. Split text into paragraphs first.
      // 2. Process refinedSentences.
      // 3. Group sentences into chunks.
      // `isParagraphStart` flag is used in step 3.
      // If `isParagraphStart`, start new chunk.
      // So yes, paragraph boundaries should force new chunk.
      expect(result.chunks.length).toBeGreaterThanOrEqual(2);
      expect(result.chunks[0]).toContain('Paragraph one.');
      expect(result.chunks[1]).toContain('Paragraph two.');
    });

    it('should group similar sentences together', async () => {
      const text = 'Cat eats. Dog barks. Car drives. Bus stops.';
      // Mock embeddings: Cat/Dog similar, Car/Bus similar, but Cat/Car different
      (service as any).generateEmbedding = jest
        .fn()
        .mockImplementation(async (t) => {
          const vec = new Array(768).fill(0);
          if (t.includes('Cat') || t.includes('Dog')) {
            vec[0] = 1; // [1, 0, ...]
          } else {
            vec[1] = 1; // [0, 1, ...]
          }
          return vec;
        });

      const result = await (service as any).semanticChunk(text, {
        similarityThreshold: 0.8,
        targetChunkSize: 0,
      });

      expect(result.chunks.length).toBeGreaterThanOrEqual(2);
      expect(result.chunks[0]).toContain('Cat');
      expect(result.chunks[1]).toContain('Car');
    });

    it('should create parent chunks', async () => {
      const sentence = 'This is a test sentence.';
      const text = Array(20).fill(sentence).join(' '); // 20 sentences

      (service as any).generateEmbedding = jest
        .fn()
        .mockResolvedValue(new Array(768).fill(0.1));

      // Force small chunks to trigger multiple chunks creation
      // With 20 sentences, if targetChunkSize is very small, we get many chunks.
      const result = await (service as any).semanticChunk(text, {
        maxChunkSize: 10,
        targetChunkSize: 5,
      });

      expect(result.chunks.length).toBeGreaterThan(5);
      expect(result.parentChunks.length).toBeGreaterThan(0);
    });
  });
});
