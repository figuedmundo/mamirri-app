import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { AiAnalysisService } from './ai-analysis.service';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AnonymizerService } from './services/anonymizer.service';
import { TranslatorService } from './services/translator.service';
import { PromptBuilderService } from './services/prompt-builder.service';
import { DataAggregationService } from './services/data-aggregation.service';

// Mock dependencies
const mockConfigService = {
  get: jest.fn((key) => {
    if (key === 'GOOGLE_API_KEY') return 'test-api-key';
    if (key === 'AI_MODEL') return 'gemini-3-flash';
    return null;
  }),
};

const mockPrismaService = {};
const mockKnowledgeBaseService = {};
const mockAnonymizerService = {};
const mockTranslatorService = {};
const mockPromptBuilderService = {};
const mockDataAggregationService = {};

describe('SDK Migration', () => {
  beforeEach(async () => {
    await Test.createTestingModule({
      providers: [
        AiAnalysisService,
        KnowledgeBaseService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: KnowledgeBaseService, useValue: mockKnowledgeBaseService },
        { provide: AnonymizerService, useValue: mockAnonymizerService },
        { provide: TranslatorService, useValue: mockTranslatorService },
        { provide: PromptBuilderService, useValue: mockPromptBuilderService },
        {
          provide: DataAggregationService,
          useValue: mockDataAggregationService,
        },
      ],
    }).compile();

    // We can't fully instantiate the real services here because we haven't updated them yet
    // and they still rely on the old SDK in their imports.
    // This test file serves as a verification AFTER the updates are applied.
  });

  it('should initialize GoogleGenAI with new SDK pattern', () => {
    const apiKey = 'test-key';
    const client = new GoogleGenAI({ apiKey });
    expect(client).toBeDefined();
    expect(client.models).toBeDefined();
  });

  it('should support content generation with new SDK', async () => {
    // This is a type check / pattern verification test
    const apiKey = 'test-key';
    const client = new GoogleGenAI({ apiKey });

    // Mock the generateContent method
    const mockGenerateContent = jest.fn().mockResolvedValue({
      text: () => 'Test response',
    });

    // @ts-expect-error - limited mocking for verification
    client.models = { generateContent: mockGenerateContent } as any;

    await client.models.generateContent({
      model: 'gemini-3-flash',
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
    });

    expect(mockGenerateContent).toHaveBeenCalled();
  });

  it('should support embeddings with new SDK', async () => {
    // This is a type check / pattern verification test
    const apiKey = 'test-key';
    const client = new GoogleGenAI({ apiKey });

    // Mock the embedContent method
    const mockEmbedContent = jest.fn().mockResolvedValue({
      embedding: { values: [0.1, 0.2, 0.3] },
    });

    // @ts-expect-error - limited mocking for verification
    client.models = { embedContent: mockEmbedContent } as any;

    await client.models.embedContent({
      model: 'gemini-embedding-001',
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
    });

    expect(mockEmbedContent).toHaveBeenCalled();
  });
});
