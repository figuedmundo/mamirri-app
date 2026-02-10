import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VoyageAIClient } from 'voyageai';
import { createHash } from 'crypto';
import { withRetry } from '../../transcription/utils/retry';

@Injectable()
export class VoyageEmbeddingService {
  private readonly logger = new Logger(VoyageEmbeddingService.name);
  private readonly voyageClient: VoyageAIClient | null = null;
  private readonly documentModel: string;
  private readonly queryModel: string;
  private readonly outputDimension = 1024;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('VOYAGE_API_KEY');
    if (apiKey) {
      this.voyageClient = new VoyageAIClient({ apiKey });
    } else {
      this.logger.warn(
        'VOYAGE_API_KEY not set. VoyageEmbeddingService will use MOCK embeddings.',
      );
    }

    this.documentModel =
      this.configService.get<string>('VOYAGE_DOCUMENT_MODEL') ||
      'voyage-4-large';
    this.queryModel =
      this.configService.get<string>('VOYAGE_QUERY_MODEL') || 'voyage-4';
  }

  /**
   * Generates an embedding for a document chunk using voyage-4-large (1024 dims)
   */
  async generateDocumentEmbedding(text: string): Promise<number[]> {
    if (!this.voyageClient) {
      return this.generateMockEmbedding(text);
    }

    return await withRetry(
      async () => {
        const response = await this.voyageClient!.embed({
          input: text,
          model: this.documentModel,
          inputType: 'document',
          outputDimension: this.outputDimension,
        });

        if (!response.data || response.data.length === 0) {
          throw new Error('Voyage API returned no embeddings');
        }

        return response.data[0].embedding as number[];
      },
      { maxRetries: 3 },
      this.logger,
    );
  }

  /**
   * Generates an embedding for a query using voyage-4 (1024 dims, compatible space)
   */
  async generateQueryEmbedding(text: string): Promise<number[]> {
    if (!this.voyageClient) {
      return this.generateMockEmbedding(text);
    }

    return await withRetry(
      async () => {
        const response = await this.voyageClient!.embed({
          input: text,
          model: this.queryModel,
          inputType: 'query',
          outputDimension: this.outputDimension,
        });

        if (!response.data || response.data.length === 0) {
          throw new Error('Voyage API returned no embeddings');
        }

        return response.data[0].embedding as number[];
      },
      { maxRetries: 3 },
      this.logger,
    );
  }

  /**
   * Generates embeddings for a batch of documents
   */
  async generateDocumentEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    if (!this.voyageClient) {
      return Promise.all(texts.map((t) => this.generateMockEmbedding(t)));
    }

    // Voyage supports up to 1000 texts per request
    const MAX_BATCH_SIZE = 1000;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
      const batch = texts.slice(i, i + MAX_BATCH_SIZE);
      this.logger.debug(
        `Processing document embedding batch ${i / MAX_BATCH_SIZE + 1} (${batch.length} texts)`,
      );

      const response = await withRetry(
        async () => {
          const res = await this.voyageClient!.embed({
            input: batch,
            model: this.documentModel,
            inputType: 'document',
            outputDimension: this.outputDimension,
          });
          return (res.data || []).map((d) => d.embedding) as number[][];
        },
        { maxRetries: 3 },
        this.logger,
      );

      results.push(...response);
    }

    return results;
  }

  /**
   * Generates embeddings for a batch of queries
   */
  async generateQueryEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    if (!this.voyageClient) {
      return Promise.all(texts.map((t) => this.generateMockEmbedding(t)));
    }

    const MAX_BATCH_SIZE = 1000;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
      const batch = texts.slice(i, i + MAX_BATCH_SIZE);

      const response = await withRetry(
        async () => {
          const res = await this.voyageClient!.embed({
            input: batch,
            model: this.queryModel,
            inputType: 'query',
            outputDimension: this.outputDimension,
          });
          return (res.data || []).map((d) => d.embedding) as number[][];
        },
        { maxRetries: 3 },
        this.logger,
      );

      results.push(...response);
    }

    return results;
  }

  /**
   * Generates deterministic mock embeddings for development
   */
  private generateMockEmbedding(text: string): number[] {
    const hash = createHash('md5').update(text).digest('hex');
    const vector = new Array(this.outputDimension).fill(0);

    for (let i = 0; i < this.outputDimension; i++) {
      // Use chunks of the hash to populate values
      const hashPart = hash.substring((i * 2) % 32, ((i * 2) % 32) + 2);
      const byte = parseInt(hashPart, 16);
      vector[i] = byte / 128 - 1; // Normalize to [-1, 1]
    }

    return vector;
  }
}
