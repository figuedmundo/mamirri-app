import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { VoyageEmbeddingService } from './voyage-embedding.service';

// Mock voyageai SDK
const mockEmbed = jest.fn();
jest.mock('voyageai', () => ({
  VoyageAIClient: jest.fn().mockImplementation(() => ({
    embed: mockEmbed,
  })),
}));

describe('VoyageEmbeddingService', () => {
  let service: VoyageEmbeddingService;

  const mockConfig = {
    get: jest.fn((key: string) => {
      if (key === 'VOYAGE_API_KEY') return 'test-api-key';
      if (key === 'VOYAGE_DOCUMENT_MODEL') return 'voyage-4-large';
      if (key === 'VOYAGE_QUERY_MODEL') return 'voyage-4';
      return undefined;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoyageEmbeddingService,
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<VoyageEmbeddingService>(VoyageEmbeddingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateDocumentEmbedding', () => {
    it('should generate document embedding with voyage-4-large', async () => {
      const mockVector = new Array(1024).fill(0.1);
      mockEmbed.mockResolvedValue({
        data: [{ embedding: mockVector }],
        usage: { total_tokens: 10 },
      });

      const result = await service.generateDocumentEmbedding('test document');

      expect(result).toEqual(mockVector);
      expect(mockEmbed).toHaveBeenCalledWith(
        expect.objectContaining({
          input: 'test document',
          model: 'voyage-4-large',
          inputType: 'document',
        }),
      );
    });
  });

  describe('generateQueryEmbedding', () => {
    it('should generate query embedding with voyage-4', async () => {
      const mockVector = new Array(1024).fill(0.2);
      mockEmbed.mockResolvedValue({
        data: [{ embedding: mockVector }],
        usage: { total_tokens: 5 },
      });

      const result = await service.generateQueryEmbedding('test query');

      expect(result).toEqual(mockVector);
      expect(mockEmbed).toHaveBeenCalledWith(
        expect.objectContaining({
          input: 'test query',
          model: 'voyage-4',
          inputType: 'query',
        }),
      );
    });
  });

  describe('generateDocumentEmbeddingsBatch', () => {
    it('should handle batch processing for documents', async () => {
      const texts = ['doc1', 'doc2'];
      const mockVectors = [
        new Array(1024).fill(0.1),
        new Array(1024).fill(0.2),
      ];
      mockEmbed.mockResolvedValue({
        data: mockVectors.map((v) => ({ embedding: v })),
        usage: { total_tokens: 20 },
      });

      const result = await service.generateDocumentEmbeddingsBatch(texts);

      expect(result).toEqual(mockVectors);
      expect(mockEmbed).toHaveBeenCalledWith(
        expect.objectContaining({
          input: texts,
          model: 'voyage-4-large',
          inputType: 'document',
        }),
      );
    });

    it('should return empty array for empty input', async () => {
      const result = await service.generateDocumentEmbeddingsBatch([]);
      expect(result).toEqual([]);
      expect(mockEmbed).not.toHaveBeenCalled();
    });
  });

  describe('Mock Fallback', () => {
    it('should return mock embeddings when API key unavailable', async () => {
      const mockConfigNoKey = {
        get: jest.fn((key: string) => {
          if (key === 'VOYAGE_API_KEY') return null;
          return 'mock-value';
        }),
      };

      const moduleNoKey: TestingModule = await Test.createTestingModule({
        providers: [
          VoyageEmbeddingService,
          { provide: ConfigService, useValue: mockConfigNoKey },
        ],
      }).compile();

      const serviceNoKey = moduleNoKey.get<VoyageEmbeddingService>(
        VoyageEmbeddingService,
      );

      const result =
        await serviceNoKey.generateDocumentEmbedding('test content');

      expect(result).toHaveLength(1024);
      expect(mockEmbed).not.toHaveBeenCalled();
      expect(result.some((v) => v !== 0)).toBe(true);
    });

    it('should produce consistent mock embeddings for same text', async () => {
      const mockConfigNoKey = { get: jest.fn().mockReturnValue(null) };
      const moduleNoKey: TestingModule = await Test.createTestingModule({
        providers: [
          VoyageEmbeddingService,
          { provide: ConfigService, useValue: mockConfigNoKey },
        ],
      }).compile();
      const serviceNoKey = moduleNoKey.get<VoyageEmbeddingService>(
        VoyageEmbeddingService,
      );

      const text = 'consistent text';
      const result1 = await serviceNoKey.generateDocumentEmbedding(text);
      const result2 = await serviceNoKey.generateDocumentEmbedding(text);

      expect(result1).toEqual(result2);
    });
  });
});
