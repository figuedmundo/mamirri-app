import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VoyageAIClient } from 'voyageai';
import { createHash } from 'crypto';
import { withRetry } from '../../transcription/utils/retry';
import FormData from 'form-data';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export interface VoyageBatchInput {
  id: string;
  text: string;
}

export interface VoyageBatchResponse {
  id: string;
  object: 'batch';
  endpoint: string;
  input_file_id: string;
  completion_window: string;
  model: string;
  status:
    | 'validating'
    | 'in_progress'
    | 'finalizing'
    | 'completed'
    | 'failed'
    | 'cancelling'
    | 'cancelled';
  output_file_id?: string;
  error_file_id?: string;
  errors: any[] | null;
  request_counts: {
    total: number;
    completed: number;
    failed: number;
  };
  metadata?: Record<string, any>;
  created_at: string;
  in_progress_at?: string;
  finalizing_at?: string;
  completed_at?: string;
  failed_at?: string;
  cancelling_at?: string;
  cancelled_at?: string;
  expected_completion_at?: string;
}

export interface VoyageFileUploadResponse {
  id: string;
  object: 'file';
  bytes: number;
  created_at: number;
  filename: string;
  purpose: string;
}

export interface VoyageEmbeddingResult {
  id: string;
  embedding: number[];
}

export interface BatchJobResult {
  batchId: string;
  status: VoyageBatchResponse['status'];
  embeddings: Map<string, number[]>;
  errors?: Map<string, string>;
}

export interface VoyageBatchCreateRequest {
  endpoint: string; // "/v1/embeddings"
  input_file_id: string;
  request_params: {
    model: string;
    input_type?: 'document' | 'query';
    output_dimension?: number;
    output_dtype?: 'float' | 'int8' | 'uint8' | 'binary' | 'ubinary';
  };
  completion_window?: string; // e.g., "12h"
  metadata?: Record<string, any>;
}

export interface VoyageBatchResponse {
  id: string; // batch_id
  object: 'batch';
  endpoint: string;
  input_file_id: string;
  completion_window: string;
  model: string;
  status:
    | 'validating'
    | 'in_progress'
    | 'finalizing'
    | 'completed'
    | 'failed'
    | 'cancelling'
    | 'cancelled';
  output_file_id?: string;
  error_file_id?: string;
  errors: any[] | null;
  request_counts: {
    total: number;
    completed: number;
    failed: number;
  };
  metadata?: Record<string, any>;
  created_at: string;
  in_progress_at?: string;
  finalizing_at?: string;
  completed_at?: string;
  failed_at?: string;
  cancelling_at?: string;
  cancelled_at?: string;
  expected_completion_at?: string;
}

export interface VoyageFileUploadResponse {
  id: string; // file_id
  object: 'file';
  bytes: number;
  created_at: number;
  filename: string;
  purpose: string;
}

export interface VoyageEmbeddingResult {
  id: string; // Original UUID from input
  embedding: number[];
}

// ============================================================================
// Batch Job Status
// ============================================================================

export interface BatchJobResult {
  batchId: string;
  status: VoyageBatchResponse['status'];
  embeddings: Map<string, number[]>; // Map from UUID to embedding vector
  errors?: Map<string, string>; // Map from UUID to error message
}

@Injectable()
export class VoyageEmbeddingService {
  private readonly logger = new Logger(VoyageEmbeddingService.name);
  private readonly voyageClient: VoyageAIClient | null = null;
  private readonly documentModel: string;
  private readonly queryModel: string;
  private readonly outputDimension = 1024;
  private readonly apiKey: string;
  private readonly apiUrl: string;

  private readonly realtimeBatchLimit: number;
  private readonly jobFileLimit: number;
  private readonly rateLimitRpm: number;
  private readonly rateLimitTpm: number;
  private lastRequestTime: number = 0;
  private consecutiveErrors: number = 0;
  private readonly maxConsecutiveErrors: number = 3;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('VOYAGE_API_KEY');
    if (apiKey) {
      this.voyageClient = new VoyageAIClient({ apiKey });
      this.apiKey = apiKey;
      this.apiUrl = 'https://api.voyageai.com';
    } else {
      this.logger.warn(
        'VOYAGE_API_KEY not set. VoyageEmbeddingService will use MOCK embeddings.',
      );
      this.apiKey = '';
      this.apiUrl = '';
    }

    this.documentModel =
      this.configService.get<string>('VOYAGE_DOCUMENT_MODEL') ||
      'voyage-4-large';
    this.queryModel =
      this.configService.get<string>('VOYAGE_QUERY_MODEL') || 'voyage-4';

    this.realtimeBatchLimit =
      this.configService.get<number>('voyage.realtimeBatchLimit') || 1000;
    this.jobFileLimit =
      this.configService.get<number>('voyage.jobFileLimit') || 100000;
    this.rateLimitRpm =
      this.configService.get<number>('voyage.rateLimitRpm') || 300;
    this.rateLimitTpm =
      this.configService.get<number>('voyage.rateLimitTpm') || 1000000;

    this.logger.log(
      `VoyageEmbeddingService initialized (real-time: ${this.rateLimitRpm} RPM/${this.rateLimitTpm} TPM | batch: ${this.jobFileLimit.toLocaleString()} inputs max)`,
    );
  }

  /**
   * Rough estimation of token count (Voyage uses ~1 token per 4 chars for English, less for other languages)
   * This is a conservative estimate for rate limiting purposes
   */
  private estimateTokens(text: string): number {
    // VoyageAI uses roughly 1 token per 4 characters on average
    // Adding 20% buffer for safety (more conservative for free tier)
    return Math.ceil((text.length / 4) * 1.2);
  }

  /**
   * Calculates total tokens in a batch of chunks
   */
  private calculateBatchTokens(chunks: string[]): number {
    return chunks.reduce((sum, chunk) => sum + this.estimateTokens(chunk), 0);
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const minDelayMs = Math.ceil(60000 / this.rateLimitRpm);
    const timeSinceLastRequest = now - this.lastRequestTime;

    let waitTime = 0;

    if (this.lastRequestTime > 0 && timeSinceLastRequest < minDelayMs) {
      waitTime = minDelayMs - timeSinceLastRequest;
    }

    if (this.consecutiveErrors > 0) {
      const backoffMs = Math.min(this.consecutiveErrors * 5000, 30000);
      waitTime = Math.max(waitTime, backoffMs);
      this.logger.warn(
        `⚠️  Consecutive errors detected: ${this.consecutiveErrors}. Adding ${backoffMs}ms backoff.`,
      );
    }

    if (waitTime > 0) {
      this.logger.log(
        `⏱️  Rate limiting: waiting ${waitTime}ms before next request (RPM limit: ${this.rateLimitRpm}, min delay: ${minDelayMs}ms)`,
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    } else if (this.lastRequestTime === 0) {
      this.logger.log(
        `🚀 First request - no rate limit delay needed (RPM limit: ${this.rateLimitRpm})`,
      );
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Generates an embedding for a document chunk using voyage-4-large (1024 dims)
   */
  async generateDocumentEmbedding(
    text: string,
    dryRun: boolean = false,
  ): Promise<number[]> {
    if (dryRun || !this.voyageClient) {
      if (dryRun) {
        this.logger.log('🔍 [DRY RUN] Generating mock document embedding');
      }
      return this.generateMockEmbedding(text);
    }

    await this.enforceRateLimit();

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
  async generateQueryEmbedding(
    text: string,
    dryRun: boolean = false,
  ): Promise<number[]> {
    if (dryRun || !this.voyageClient) {
      if (dryRun) {
        this.logger.log('🔍 [DRY RUN] Generating mock query embedding');
      }
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

  private createTpmAwareBatches(chunks: string[]): string[][] {
    const batches: string[][] = [];
    let currentBatch: string[] = [];
    let currentBatchTokens = 0;

    for (const chunk of chunks) {
      const chunkTokens = this.estimateTokens(chunk);

      if (
        currentBatch.length > 0 &&
        currentBatchTokens + chunkTokens > this.rateLimitTpm
      ) {
        batches.push(currentBatch);
        currentBatch = [chunk];
        currentBatchTokens = chunkTokens;
      } else {
        currentBatch.push(chunk);
        currentBatchTokens += chunkTokens;
      }

      if (currentBatch.length >= this.realtimeBatchLimit) {
        batches.push(currentBatch);
        currentBatch = [];
        currentBatchTokens = 0;
      }
    }

    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  private tokenUsageWindow: { timestamp: number; tokens: number }[] = [];

  private trackTokenUsage(tokens: number): void {
    const now = Date.now();
    this.tokenUsageWindow.push({ timestamp: now, tokens });

    const oneMinuteAgo = now - 60000;
    this.tokenUsageWindow = this.tokenUsageWindow.filter(
      (entry) => entry.timestamp > oneMinuteAgo,
    );
  }

  private getTokensInWindow(): number {
    return this.tokenUsageWindow.reduce((sum, entry) => sum + entry.tokens, 0);
  }

  private async sendBatchWithRetry(
    batch: string[],
    batchNum: number,
    totalBatches: number,
    isRetry: boolean = false,
    dryRun: boolean = false,
  ): Promise<number[][]> {
    const estimatedTokens = this.calculateBatchTokens(batch);
    const tokensInWindow = this.getTokensInWindow();

    const dryRunPrefix = dryRun ? '🔍 [DRY RUN] ' : '';

    this.logger.log(
      `${dryRunPrefix}📦 BATCH ${batchNum}/${totalBatches}${isRetry ? ' (RETRY)' : ''}:`,
    );
    this.logger.log(`   📊 Items: ${batch.length} chunks`);
    this.logger.log(
      `   📝 Estimated tokens: ~${estimatedTokens} (limit: ${this.rateLimitTpm})`,
    );
    if (!dryRun) {
      this.logger.log(
        `   📊 Tokens in rolling window: ${tokensInWindow}/${this.rateLimitTpm}`,
      );
    }

    if (batch.length > 0) {
      const sample = batch[0].substring(0, 100).replace(/\n/g, ' ');
      this.logger.log(
        `   📝 Sample chunk[0]: "${sample}${batch[0].length > 100 ? '...' : ''}" (${batch[0].length} chars)`,
      );
    }

    if (dryRun) {
      this.logger.log(
        `${dryRunPrefix}⏭️  SKIPPING API call - returning mock embeddings`,
      );
      return batch.map((text) => this.generateMockEmbedding(text));
    }

    // Check if any single chunk exceeds TPM limit
    if (batch.length === 1 && estimatedTokens > this.rateLimitTpm) {
      this.logger.warn(
        `   ⚠️  Single chunk has ${estimatedTokens} tokens, exceeding TPM limit of ${this.rateLimitTpm}. Truncating to fit...`,
      );

      const maxChars = Math.floor(this.rateLimitTpm * 4 * 0.9);
      const truncatedChunk = batch[0].substring(0, maxChars);
      const originalLength = batch[0].length;

      this.logger.warn(
        `   ✂️  Truncated from ${originalLength} chars to ${maxChars} chars (~${this.rateLimitTpm * 0.9} tokens)`,
      );

      return await this.sendBatchWithRetry(
        [truncatedChunk],
        batchNum,
        totalBatches,
        isRetry,
        dryRun,
      );
    }

    await this.enforceRateLimit();

    this.logger.log(`   🚀 Sending request to Voyage API...`);
    const requestStartTime = Date.now();

    try {
      const res = await this.voyageClient!.embed({
        input: batch,
        model: this.documentModel,
        inputType: 'document',
        outputDimension: this.outputDimension,
      });

      const requestDuration = Date.now() - requestStartTime;
      const actualTokens = (res as any).usage?.total_tokens || estimatedTokens;

      this.logger.log(
        `   ✅ Success! Received ${res.data?.length || 0} embeddings in ${requestDuration}ms`,
      );
      this.logger.log(
        `   📊 Actual tokens: ${actualTokens} | Estimated: ${estimatedTokens} | Ratio: ${(actualTokens / estimatedTokens).toFixed(2)}`,
      );

      this.trackTokenUsage(actualTokens);
      this.consecutiveErrors = 0;

      return (res.data || []).map((d: any) => d.embedding) as number[][];
    } catch (error: any) {
      const requestDuration = Date.now() - requestStartTime;
      const isRateLimit =
        error.status === 429 ||
        error.statusCode === 429 ||
        (error.message && error.message.includes('Status code: 429'));

      if (isRateLimit && batch.length > 1) {
        this.logger.warn(
          `   ⚠️  Rate limit hit with ${batch.length} chunks. Splitting and retrying...`,
        );

        const half = Math.ceil(batch.length / 2);
        const firstHalf = batch.slice(0, half);
        const secondHalf = batch.slice(half);

        this.logger.log(
          `   🔄 Retrying first half (${firstHalf.length} chunks)...`,
        );
        const firstResults = await this.sendBatchWithRetry(
          firstHalf,
          batchNum,
          totalBatches,
          true,
          dryRun,
        );

        this.logger.log(
          `   🔄 Retrying second half (${secondHalf.length} chunks)...`,
        );
        const secondResults = await this.sendBatchWithRetry(
          secondHalf,
          batchNum,
          totalBatches,
          true,
          dryRun,
        );

        return [...firstResults, ...secondResults];
      } else if (isRateLimit && batch.length === 1) {
        this.logger.warn(
          `   ⚠️  Rate limit hit with single chunk. Waiting 90s for TPM window to clear...`,
        );

        await new Promise((resolve) => setTimeout(resolve, 90000));

        this.logger.log(`   🔄 Retrying single chunk after wait...`);
        return await this.sendBatchWithRetry(
          batch,
          batchNum,
          totalBatches,
          true,
          dryRun,
        );
      }

      this.logger.error(
        `   ❌ Failed after ${requestDuration}ms: ${error.message}`,
      );
      this.consecutiveErrors++;

      if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
        this.logger.error(
          `🛑 Max consecutive errors (${this.maxConsecutiveErrors}) reached.`,
        );
        throw new Error(
          `Rate limit exceeded. Please wait 5-10 minutes before retrying, or reduce VOYAGE_RATE_LIMIT_RPM to 1.`,
        );
      }

      throw error;
    }
  }

  async generateDocumentEmbeddingsBatch(
    chunks: string[],
    dryRun: boolean = false,
  ): Promise<number[][]> {
    if (chunks.length === 0) return [];
    if (!this.voyageClient) {
      return chunks.map((c) => this.generateMockEmbedding(c));
    }

    const batches = this.createTpmAwareBatches(chunks);

    const dryRunPrefix = dryRun ? '🔍 [DRY RUN] ' : '';
    this.logger.log(
      `${dryRunPrefix}📦 Split ${chunks.length} chunks into ${batches.length} TPM-aware batches`,
    );

    const results: number[][] = [];

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchResult = await this.sendBatchWithRetry(
        batch,
        batchIndex + 1,
        batches.length,
        false,
        dryRun,
      );
      results.push(...batchResult);
    }

    return results;
  }

  /**
   * Generates embeddings for a batch of queries
   */
  async generateQueryEmbeddingsBatch(
    texts: string[],
    dryRun: boolean = false,
  ): Promise<number[][]> {
    if (texts.length === 0) return [];
    if (dryRun || !this.voyageClient) {
      if (dryRun) {
        this.logger.log('🔍 [DRY RUN] Generating mock query embeddings');
      }
      return texts.map((t) => this.generateMockEmbedding(t));
    }

    const MAX_BATCH_SIZE = this.realtimeBatchLimit;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
      const batch = texts.slice(i, i + MAX_BATCH_SIZE);

      await this.enforceRateLimit();

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
      const hashPart = hash.substring((i * 2) % 32, ((i * 2) % 32) + 2);
      const byte = parseInt(hashPart, 16);
      vector[i] = byte / 128 - 1;
    }

    return vector;
  }

  async createBatchJob(
    inputs: { id: string; text: string }[],
    options: {
      model?: string;
      inputType?: 'document' | 'query';
      completionWindow?: string;
      outputDimension?: number;
      outputDtype?: 'float' | 'int8' | 'uint8' | 'binary' | 'ubinary';
      dryRun?: boolean;
    } = {},
  ): Promise<string> {
    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Creating batch job for ${inputs.length} items.`,
      );
      return 'mock-batch-id';
    }

    if (!this.voyageClient) {
      throw new Error('Voyage API key not configured');
    }

    const tempDir = os.tmpdir();
    const fileName = `batch-input-${Date.now()}.jsonl`;
    const filePath = path.join(tempDir, fileName);

    try {
      const jsonlContent = inputs
        .map((item) =>
          JSON.stringify({
            custom_id: item.id,
            body: {
              input: [item.text],
            },
          }),
        )
        .join('\n');
      fs.writeFileSync(filePath, jsonlContent, 'utf-8');

      const formData = new FormData();
      formData.append('file', fs.readFileSync(filePath), {
        filename: fileName,
        contentType: 'application/jsonl',
      });
      formData.append('purpose', 'batch');

      const uploadResponse = await withRetry(
        async () => {
          const buffer = formData.getBuffer();
          const headers: Record<string, string> = {
            Authorization: `Bearer ${this.apiKey}`,
            ...formData.getHeaders(),
          };

          const response = await fetch(`${this.apiUrl}/v1/files`, {
            method: 'POST',
            headers,
            body: buffer as unknown as BodyInit,
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Failed to upload file: ${response.status} ${response.statusText} - ${errorText}`,
            );
          }

          return (await response.json()) as VoyageFileUploadResponse;
        },
        { maxRetries: 3 },
        this.logger,
      );

      this.logger.log(
        `Uploaded file ${uploadResponse.id} for batch processing`,
      );

      const batchRequest: VoyageBatchCreateRequest = {
        endpoint: '/v1/embeddings',
        input_file_id: uploadResponse.id,
        request_params: {
          model: options.model || this.documentModel,
          input_type: options.inputType || 'document',
          output_dimension: options.outputDimension || this.outputDimension,
          output_dtype: options.outputDtype || 'float',
        },
        completion_window: options.completionWindow || '12h',
      };

      const batchResponse = await withRetry(
        async () => {
          const response = await fetch(`${this.apiUrl}/v1/batches`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(batchRequest),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Failed to create batch: ${response.status} ${response.statusText} - ${errorText}`,
            );
          }

          return (await response.json()) as VoyageBatchResponse;
        },
        { maxRetries: 3 },
        this.logger,
      );

      this.logger.log(
        `Created batch job ${batchResponse.id} for ${inputs.length} texts`,
      );
      return batchResponse.id;
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.debug(`Cleaned up temp file: ${filePath}`);
      }
    }
  }

  async getBatchJob(batchId: string): Promise<VoyageBatchResponse> {
    if (!this.voyageClient) {
      throw new Error('Voyage API key not configured');
    }

    return await withRetry(
      async () => {
        const response = await fetch(`${this.apiUrl}/v1/batches/${batchId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to get batch status: ${response.status} ${response.statusText} - ${errorText}`,
          );
        }

        return (await response.json()) as VoyageBatchResponse;
      },
      { maxRetries: 3 },
      this.logger,
    );
  }

  async getBatchResults(
    batchId: string,
    options: {
      pollInterval?: number;
      maxWaitTime?: number;
    } = {},
  ): Promise<BatchJobResult> {
    const { pollInterval = 10000, maxWaitTime = 12 * 60 * 60 * 1000 } = options;
    const startTime = Date.now();

    this.logger.log(`Waiting for batch ${batchId} to complete...`);

    while (Date.now() - startTime < maxWaitTime) {
      const batch = await this.getBatchJob(batchId);

      this.logger.debug(
        `Batch ${batchId} status: ${batch.status} (${batch.request_counts.completed}/${batch.request_counts.total} completed)`,
      );

      if (batch.status === 'completed') {
        if (!batch.output_file_id) {
          throw new Error('Batch completed but no output file ID provided');
        }

        const results = await this.downloadAndParseResults(
          batch.output_file_id,
        );

        this.logger.log(
          `Batch ${batchId} completed: ${results.embeddings.size} embeddings, ${results.errors?.size || 0} errors`,
        );

        return {
          batchId,
          status: batch.status,
          embeddings: results.embeddings,
          errors: results.errors,
        };
      }

      if (batch.status === 'failed' || batch.status === 'cancelled') {
        this.logger.error(
          `Batch ${batchId} ${batch.status}: ${JSON.stringify(batch.errors)}`,
        );

        const errorResults = batch.error_file_id
          ? await this.downloadAndParseResults(batch.error_file_id)
          : {
              embeddings: new Map<string, number[]>(),
              errors: new Map<string, string>(),
            };

        return {
          batchId,
          status: batch.status,
          embeddings: errorResults.embeddings,
          errors: errorResults.errors,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error(
      `Batch ${batchId} did not complete within ${maxWaitTime}ms`,
    );
  }

  private async downloadAndParseResults(fileId: string): Promise<{
    embeddings: Map<string, number[]>;
    errors?: Map<string, string>;
  }> {
    const response = await fetch(`${this.apiUrl}/v1/files/${fileId}/content`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to download file: ${response.status} ${response.statusText}`,
      );
    }

    const content = await response.text();
    const lines = content.split('\n').filter((line) => line.trim().length > 0);

    const embeddings = new Map<string, number[]>();
    const errors = new Map<string, string>();

    for (const line of lines) {
      try {
        const result = JSON.parse(line);

        if (result.response?.body?.data?.length > 0) {
          const embeddingData = result.response.body.data;
          embeddings.set(result.custom_id, embeddingData[0].embedding);
        } else if (result.error) {
          errors.set(
            result.custom_id,
            result.error.message || JSON.stringify(result.error),
          );
        } else if (result.embedding?.length > 0) {
          embeddings.set(result.id || result.custom_id, result.embedding);
        }
      } catch (error) {
        this.logger.warn(`Failed to parse line: ${line}`, error);
      }
    }

    return { embeddings, errors: errors.size > 0 ? errors : undefined };
  }

  async cancelBatch(batchId: string): Promise<void> {
    if (!this.voyageClient) {
      throw new Error('Voyage API key not configured');
    }

    await withRetry(
      async () => {
        const response = await fetch(
          `${this.apiUrl}/v1/batches/${batchId}/cancel`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
            },
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to cancel batch: ${response.status} ${response.statusText} - ${errorText}`,
          );
        }
      },
      { maxRetries: 3 },
      this.logger,
    );

    this.logger.log(`Batch ${batchId} cancel requested`);
  }

  async listBatches(limit: number = 20): Promise<VoyageBatchResponse[]> {
    if (!this.voyageClient) {
      throw new Error('Voyage API key not configured');
    }

    const response = await withRetry(
      async () => {
        const res = await fetch(`${this.apiUrl}/v1/batches?limit=${limit}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Failed to list batches: ${res.status} ${res.statusText} - ${errorText}`,
          );
        }

        return (await res.json()) as {
          object: string;
          data: VoyageBatchResponse[];
        };
      },
      { maxRetries: 3 },
      this.logger,
    );

    return response.data;
  }
}
