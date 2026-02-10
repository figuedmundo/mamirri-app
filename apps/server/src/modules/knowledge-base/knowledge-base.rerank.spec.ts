import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeBaseService } from './knowledge-base.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CohereClient } from 'cohere-ai';
import { VoyageEmbeddingService } from './services/voyage-embedding.service';

describe('KnowledgeBaseService - Rerank with Cohere v4.0', () => {
  let service: KnowledgeBaseService;
  let mockCohereClient: jest.Mocked<CohereClient>;

  const mockPrisma = {
    document: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $executeRaw: jest.fn().mockResolvedValue(1),
    $queryRaw: jest.fn().mockResolvedValue([]),
  };

  const mockConfig = {
    get: jest.fn((key: string) => {
      const config = {
        GOOGLE_API_KEY: 'mock-google-key',
        COHERE_API_KEY: 'mock-cohere-key',
      };
      return config[key];
    }),
  };

  const mockVoyageService = {
    generateDocumentEmbedding: jest.fn(),
    generateQueryEmbedding: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock Cohere client
    const mockRerankFn = jest.fn().mockResolvedValue({
      results: [
        { index: 2, relevanceScore: 0.95 },
        { index: 0, relevanceScore: 0.85 },
        { index: 1, relevanceScore: 0.75 },
      ],
    });

    mockCohereClient = {
      v2: {
        rerank: mockRerankFn,
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeBaseService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
        { provide: VoyageEmbeddingService, useValue: mockVoyageService },
      ],
    }).compile();

    service = module.get<KnowledgeBaseService>(KnowledgeBaseService);

    // Override the cohere client with our mock
    (service as any).cohere = mockCohereClient;
    (service as any).generateEmbedding = jest
      .fn()
      .mockResolvedValue(new Array(768).fill(0));
  });

  describe('rerank method with v4.0 model', () => {
    it('should call Cohere v2 rerank with rerank-v4.0-pro model', async () => {
      const query = 'treatment for plantar fasciitis';
      const documents = [
        {
          id: 'doc-1',
          content: 'Plantar fasciitis treatment involves stretching exercises.',
          documentTitle: 'Foot Pain Guide',
        },
        {
          id: 'doc-2',
          content: 'Manual therapy and orthotics are effective for heel pain.',
          documentTitle: 'Physiotherapy Protocols',
        },
        {
          id: 'doc-3',
          content: 'Shockwave therapy for chronic plantar fasciitis cases.',
          documentTitle: 'Advanced Treatments',
        },
      ];

      // Access the private rerank method
      await (service as any).rerank(query, documents, 3);

      // Verify the Cohere API was called with the correct model
      expect(mockCohereClient.v2.rerank).toHaveBeenCalledWith({
        documents: [
          documents[0].content,
          documents[1].content,
          documents[2].content,
        ],
        query,
        topN: 3,
        model: 'rerank-v4.0-pro',
      });
    });

    it('should correctly parse and map relevance scores from Cohere v4.0 response', async () => {
      const query = 'treatment for plantar fasciitis';
      const documents = [
        {
          id: 'doc-1',
          content: 'Plantar fasciitis treatment involves stretching.',
          documentTitle: 'Foot Pain Guide',
          similarity: 0.8,
        },
        {
          id: 'doc-2',
          content: 'Manual therapy and orthotics for heel pain.',
          documentTitle: 'Physiotherapy Protocols',
          similarity: 0.7,
        },
        {
          id: 'doc-3',
          content: 'Shockwave therapy for chronic cases.',
          documentTitle: 'Advanced Treatments',
          similarity: 0.6,
        },
      ];

      // Access the private rerank method
      const rerankedDocuments = await (service as any).rerank(
        query,
        documents,
        3,
      );

      // Verify results are properly mapped
      expect(rerankedDocuments).toHaveLength(3);
      expect(rerankedDocuments[0]).toMatchObject({
        id: 'doc-3', // index 2 from mock response (highest score 0.95)
        rerankScore: 0.95,
      });
      expect(rerankedDocuments[1]).toMatchObject({
        id: 'doc-1', // index 0 from mock response (score 0.85)
        rerankScore: 0.85,
      });
      expect(rerankedDocuments[2]).toMatchObject({
        id: 'doc-2', // index 1 from mock response (score 0.75)
        rerankScore: 0.75,
      });

      expect(rerankedDocuments[0].documentTitle).toBe('Advanced Treatments');
      expect(rerankedDocuments[1].documentTitle).toBe('Foot Pain Guide');
      expect(rerankedDocuments[2].documentTitle).toBe(
        'Physiotherapy Protocols',
      );
    });

    it('should use parentContent when available for reranking', async () => {
      const query = 'treatment for plantar fasciitis';
      const documents = [
        {
          id: 'doc-1',
          content: 'Stretching exercises',
          parentContent:
            'Detailed stretching protocol for plantar fasciitis with progression.',
          documentTitle: 'Foot Pain Guide',
        },
        {
          id: 'doc-2',
          content: 'Manual therapy',
          parentContent:
            'Comprehensive manual therapy techniques for heel pain relief.',
          documentTitle: 'Physiotherapy Protocols',
        },
      ];

      // Access the private rerank method
      await (service as any).rerank(query, documents, 2);

      // Verify parentContent is used for reranking
      expect(mockCohereClient.v2.rerank).toHaveBeenCalledWith({
        documents: [
          'Detailed stretching protocol for plantar fasciitis with progression.',
          'Comprehensive manual therapy techniques for heel pain relief.',
        ],
        query,
        topN: 2,
        model: 'rerank-v4.0-pro',
      });
    });

    it('should fall back to topK results when Cohere API fails', async () => {
      const query = 'treatment for plantar fasciitis';
      const documents = [
        {
          id: 'doc-1',
          content: 'Plantar fasciitis treatment.',
          documentTitle: 'Foot Pain Guide',
        },
        {
          id: 'doc-2',
          content: 'Manual therapy.',
          documentTitle: 'Physiotherapy Protocols',
        },
      ];

      // Mock API error
      (mockCohereClient.v2.rerank as jest.Mock).mockRejectedValue(
        new Error('API rate limit exceeded'),
      );

      // Access the private rerank method
      const rerankedDocuments = await (service as any).rerank(
        query,
        documents,
        1,
      );

      // Verify fallback returns top K results
      expect(rerankedDocuments).toHaveLength(1);
      expect(rerankedDocuments[0].id).toBe('doc-1');
      expect(rerankedDocuments[0].rerankScore).toBeUndefined();
    });

    it('should handle empty document array gracefully', async () => {
      const query = 'treatment for plantar fasciitis';
      const documents: any[] = [];

      // Access the private rerank method
      const rerankedDocuments = await (service as any).rerank(
        query,
        documents,
        5,
      );

      // Verify returns empty array
      expect(rerankedDocuments).toHaveLength(0);
      expect(mockCohereClient.v2.rerank).not.toHaveBeenCalled();
    });

    it('should return parentContent as main content for LLM context', async () => {
      const query = 'treatment for plantar fasciitis';
      const documents = [
        {
          id: 'doc-1',
          content: 'Short chunk',
          parentContent: 'This is the full parent content with more context.',
          documentTitle: 'Test Doc',
        },
        {
          id: 'doc-2',
          content: 'Another short chunk',
          parentContent: 'Another parent content with more context.',
          documentTitle: 'Test Doc 2',
        },
        {
          id: 'doc-3',
          content: 'Third short chunk',
          parentContent: 'Third parent content with more context.',
          documentTitle: 'Test Doc 3',
        },
      ];

      // Access the private rerank method
      const rerankedDocuments = await (service as any).rerank(
        query,
        documents,
        3,
      );

      expect(rerankedDocuments[0].content).toBe(
        'Third parent content with more context.',
      );
      expect(rerankedDocuments[1].content).toBe(
        'This is the full parent content with more context.',
      );
      expect(rerankedDocuments[2].content).toBe(
        'Another parent content with more context.',
      );
    });

    it('should preserve original content when parentContent is not available', async () => {
      const query = 'treatment for plantar fasciitis';
      const documents = [
        {
          id: 'doc-1',
          content: 'This is the original content.',
          documentTitle: 'Test Doc',
        },
      ];

      // Access the private rerank method
      const rerankedDocuments = await (service as any).rerank(
        query,
        documents,
        1,
      );

      // Verify original content is used
      expect(rerankedDocuments[0].content).toBe(
        'This is the original content.',
      );
    });
  });
});
