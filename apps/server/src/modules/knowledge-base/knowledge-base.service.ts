import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import { withRetry } from '../transcription/utils/retry';
import { promisify } from 'util';

const sleep = promisify(setTimeout);

import { execSync, spawn } from 'child_process';
import { PDFParse } from 'pdf-parse';
import { randomUUID } from 'crypto';

import { Prisma } from '@prisma/client';
import { CohereClient } from 'cohere-ai';

/**
 * Token bucket for rate limiting with a rolling window.
 * Tracks tokens consumed over the last 60 seconds.
 */
class TokenRateLimiter {
  private readonly windowMs = 60_000; // 60 seconds
  private readonly maxTokens: number;
  private readonly safetyMargin = 0.85; // Use 85% of limit for safety
  private tokenLog: { timestamp: number; tokens: number }[] = [];

  constructor(maxTokensPerMinute: number) {
    this.maxTokens = maxTokensPerMinute * this.safetyMargin;
  }

  /**
   * Estimate tokens for a text using word count * 1.3 factor
   */
  estimateTokens(text: string): number {
    const words = text.split(/\s+/).filter((w) => w.length > 0).length;
    return Math.ceil(words * 1.3);
  }

  /**
   * Get tokens consumed in the current rolling window
   */
  private getTokensInWindow(): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Clean old entries
    this.tokenLog = this.tokenLog.filter((e) => e.timestamp > windowStart);

    return this.tokenLog.reduce((sum, e) => sum + e.tokens, 0);
  }

  /**
   * Record tokens consumed
   */
  recordTokens(tokens: number): void {
    this.tokenLog.push({ timestamp: Date.now(), tokens });
  }

  /**
   * Calculate delay needed before consuming more tokens.
   * Returns 0 if we can proceed immediately.
   */
  getRequiredDelay(tokensNeeded: number): number {
    const currentTokens = this.getTokensInWindow();
    const availableTokens = this.maxTokens - currentTokens;

    if (tokensNeeded <= availableTokens) {
      // We have capacity, add minimal delay to spread requests
      return 500;
    }

    // Need to wait for tokens to expire from window
    // Find oldest entry that would free enough tokens
    const tokensToFree = tokensNeeded - availableTokens;
    let tokensFreed = 0;
    let waitUntil = Date.now();

    for (const entry of this.tokenLog) {
      tokensFreed += entry.tokens;
      waitUntil = entry.timestamp + this.windowMs;
      if (tokensFreed >= tokensToFree) break;
    }

    const delay = Math.max(0, waitUntil - Date.now() + 100); // +100ms buffer
    return delay;
  }
}

export interface BM25Result {
  id: string;
  content: string;
  pageNumber: number;
  documentTitle: string;
  documentAuthor: string;
  documentFilePath: string;
  documentMetadata: Record<string, unknown>;
  bm25Score: number;
}

export interface SearchFilters {
  documentIds?: string[];
  minYear?: number;
  volume?: string;
}

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);
  private readonly genAI: GoogleGenAI;
  private readonly cohere: CohereClient;
  private readonly chunksPerParent = 5;
  private readonly rateLimiter = new TokenRateLimiter(30_000);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'GOOGLE_API_KEY is not set. Using MOCK embeddings for verification.',
      );
    }
    this.genAI = new GoogleGenAI({ apiKey: apiKey || 'mock-key' });

    const cohereKey = this.configService.get<string>('COHERE_API_KEY');
    if (!cohereKey) {
      this.logger.warn('COHERE_API_KEY is not set. Reranking will be skipped.');
    }
    this.cohere = new CohereClient({ token: cohereKey || 'mock-key' });
  }

  /**
   * Extract text from PDF using the specified engine.
   *
   * This method orchestrates external Python scripts to handle PDF processing.
   * It supports two engines:
   * - 'pymupdf': Fast, rule-based extraction (legacy/default).
   * - 'docling': High-fidelity computer vision based extraction (best for complex layouts).
   *
   * @param filePath - Absolute path to the PDF file.
   * @param engine - The extraction engine to use ('pymupdf' | 'docling').
   * @param options - Optional configuration for partial extraction.
   * @param options.startPage - Start page (1-indexed, inclusive).
   * @param options.endPage - End page (1-indexed, inclusive).
   * @returns A promise resolving to the extracted Markdown string.
   */
  async extractPdf(
    filePath: string,
    engine: 'pymupdf' | 'docling' = 'pymupdf',
    options: { startPage?: number; endPage?: number } = {},
  ): Promise<string> {
    const isDocling = engine === 'docling';

    let pythonCommand = 'python3';
    let scriptPath = '';
    let args: string[] = [];

    if (isDocling) {
      const workerDir = path.resolve(__dirname, '../../../../workers/docling');
      pythonCommand = path.join(workerDir, '.venv/bin/python');
      scriptPath = path.join(workerDir, 'main.py');
      args = [filePath];

      if (options.startPage !== undefined && options.endPage !== undefined) {
        args.push(
          '--pages',
          options.startPage.toString(),
          options.endPage.toString(),
        );
      }

      if (!fs.existsSync(pythonCommand)) {
        this.logger.warn(
          `Docling venv not found at ${pythonCommand}. Falling back to system python (might fail if deps missing).`,
        );
        pythonCommand = 'python3';
      }
    } else {
      // Legacy PyMuPDF script
      scriptPath = path.resolve(__dirname, '../../../scripts/extract-pdf.py');
      // Arguments for PyMuPDF script: file --json
      args = [filePath, '--json'];

      if (options.startPage !== undefined && options.endPage !== undefined) {
        // PyMuPDF script is 0-indexed in code but often scripts are 1-indexed for users.
        // Looking at extract-pdf.py, it says "0-indexed, inclusive" in docstring.
        // We will keep it consistent with what convert-books passes (1-indexed based on user input usually).
        // Let's adjust to 0-indexed for the script.
        args.push(
          '--pages',
          (options.startPage - 1).toString(),
          (options.endPage - 1).toString(),
        );
      }
    }

    return new Promise((resolve, reject) => {
      const process = spawn(pythonCommand, [scriptPath, ...args]);

      let stdoutData = '';
      let stderrData = '';

      process.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      process.stderr.on('data', (data) => {
        const str = data.toString();
        stderrData += str;
        if (str.includes('Processing page') || str.includes('DEBUG:')) {
          console.log(str.trim());
        }
      });

      process.on('close', (code) => {
        if (code !== 0) {
          this.logger.error(
            `PDF extraction failed with code ${code}. Error: ${stderrData}`,
          );
          return reject(new Error(`PDF extraction failed: ${stderrData}`));
        }

        try {
          // Robust JSON parsing: Find the first '{' and last '}'
          const jsonStart = stdoutData.indexOf('{');
          const jsonEnd = stdoutData.lastIndexOf('}');

          if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
            this.logger.error(
              `No valid JSON found in extraction output. Raw stdout: ${stdoutData}`,
            );
            return reject(
              new Error(`Failed to parse PDF extraction output: No JSON found`),
            );
          }

          const jsonStr = stdoutData.substring(jsonStart, jsonEnd + 1);
          const result = JSON.parse(jsonStr);

          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result.markdown);
          }
        } catch (e) {
          this.logger.error(
            `Failed to parse extraction output: ${e.message}. Raw stdout: ${stdoutData}`,
          );
          reject(new Error(`Failed to parse PDF extraction output`));
        }
      });
    });
  }

  /**
   * Legacy method wrapper for backward compatibility
   */
  async extractPdfWithPyMuPDF(filePath: string): Promise<string> {
    return this.extractPdf(filePath, 'pymupdf');
  }

  private runPythonScript(scriptPath: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', [scriptPath, ...args]);
      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(
            new Error(`Python script exited with code ${code}: ${stderr}`),
          );
          return;
        }
        const jsonStart = stdout.indexOf('{');
        if (jsonStart > 0) {
          stdout = stdout.substring(jsonStart);
        }
        resolve(stdout.trim());
      });

      pythonProcess.on('error', (err) => {
        reject(new Error(`Failed to start Python process: ${err.message}`));
      });
    });
  }

  /**
   * Extract text from PDF using pdf-parse (fallback method).
   */
  private async extractPdfWithPdfParse(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: dataBuffer });
    const textResult = await parser.getText();
    await parser.destroy();
    return textResult.text;
  }

  async ingestFile(
    filePath: string,
    useSemanticChunking: boolean = false,
  ): Promise<void> {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    const existingDoc = await (this.prisma as any).document.findUnique({
      where: { filePath },
    });

    if (existingDoc) {
      this.logger.log(`File already ingested: ${filePath}`);
      return;
    }

    this.logger.log(`Ingesting file: ${filePath}`);
    const pdfText = await this.extractPdfWithPyMuPDF(absolutePath);

    const firstPageText = pdfText.substring(0, 2000);

    const meta = await this.extractMetadata(
      firstPageText,
      path.basename(filePath, '.pdf'),
    );

    const document = await (this.prisma as any).document.create({
      data: {
        title: meta.title,
        author: meta.author,
        filePath,
        metadata: {
          volume: meta.volume,
          edition: meta.edition,
          year: meta.year,
        },
      },
    });

    try {
      let chunks: string[] = [];
      let parentChunks: string[] = [];

      if (useSemanticChunking) {
        try {
          const result = await this.semanticChunk(pdfText);
          chunks = result.chunks;
          parentChunks = result.parentChunks;
        } catch (error) {
          this.logger.warn(
            `Semantic chunking failed: ${error.message}. Falling back to naive chunking.`,
          );
          chunks = this.chunkText(pdfText);
          for (let i = 0; i < chunks.length; i += this.chunksPerParent) {
            parentChunks.push(
              chunks.slice(i, i + this.chunksPerParent).join(' '),
            );
          }
        }
      } else {
        chunks = this.chunkText(pdfText);
        for (let i = 0; i < chunks.length; i += this.chunksPerParent) {
          parentChunks.push(
            chunks.slice(i, i + this.chunksPerParent).join(' '),
          );
        }
      }

      this.logger.log(
        `Generated ${chunks.length} chunks (and ${parentChunks.length} parents) for ${meta.title}`,
      );

      const parentIds: string[] = [];

      if (parentChunks.length > 0) {
        this.logger.log(
          `Generating embeddings for ${parentChunks.length} parent chunks...`,
        );

        for (let i = 0; i < parentChunks.length; i++) {
          const content = parentChunks[i];
          const vector = await this.generateEmbedding(
            content,
            'RETRIEVAL_DOCUMENT',
          );
          const vectorString = `[${vector.join(',')}]`;
          const parentId = randomUUID();
          parentIds.push(parentId);

          await (this.prisma as any).$executeRaw`
            INSERT INTO embeddings (id, content, "pageNumber", "documentId", vector, "parentContent")
            VALUES (${parentId}::uuid, ${content}, 1, ${document.id}, ${vectorString}::vector, ${content})
          `;

          if ((i + 1) % 10 === 0) {
            this.logger.log(
              `Processed ${i + 1}/${parentChunks.length} parent chunks`,
            );
          }
        }
        this.logger.log(`Inserted ${parentChunks.length} parent chunks`);
      }

      this.logger.log(
        `Generating embeddings for ${chunks.length} child chunks...`,
      );

      for (let i = 0; i < chunks.length; i++) {
        const content = chunks[i];
        const vector = await this.generateEmbedding(
          content,
          'RETRIEVAL_DOCUMENT',
        );
        const vectorString = `[${vector.join(',')}]`;

        let parentId: string | null = null;
        let parentContent: string | null = null;

        if (parentChunks.length > 0) {
          const parentIndex = Math.floor(i / this.chunksPerParent);
          if (parentIndex < parentIds.length) {
            parentId = parentIds[parentIndex];
            parentContent = parentChunks[parentIndex];
          }
        }

        await (this.prisma as any).$executeRaw`
          INSERT INTO embeddings (id, content, "pageNumber", "documentId", vector, "parentId", "parentContent")
          VALUES (gen_random_uuid(), ${content}, 1, ${document.id}, ${vectorString}::vector, ${parentId}::uuid, ${parentContent})
        `;

        if ((i + 1) % 10 === 0) {
          this.logger.log(
            `Processed ${i + 1}/${chunks.length} chunks for ${meta.title}`,
          );
        }
      }
      this.logger.log(`Successfully ingested ${meta.title}`);
    } catch (error) {
      this.logger.error(
        `Failed to ingest chunks for ${meta.title}. Cleaning up partial data...`,
      );
      await (this.prisma as any).document.delete({
        where: { id: document.id },
      });
      throw error;
    }
  }

  async ingestMarkdown(
    markdown: string,
    metadata: {
      title: string;
      author: string;
      volume?: string;
      edition?: string;
      year?: string;
    },
    filePath: string,
    useSemanticChunking: boolean = false,
  ): Promise<void> {
    const existingDoc = await (this.prisma as any).document.findUnique({
      where: { filePath },
    });

    if (existingDoc) {
      this.logger.log(`File already ingested: ${filePath}`);
      return;
    }

    this.logger.log(`Ingesting markdown: ${metadata.title}`);

    const document = await (this.prisma as any).document.create({
      data: {
        title: metadata.title,
        author: metadata.author,
        filePath,
        metadata: {
          volume: metadata.volume,
          edition: metadata.edition,
          year: metadata.year,
        },
      },
    });

    try {
      let chunks: string[] = [];
      let parentChunks: string[] = [];

      if (useSemanticChunking) {
        try {
          const result = await this.semanticChunk(markdown);
          chunks = result.chunks;
          parentChunks = result.parentChunks;
        } catch (error) {
          this.logger.warn(
            `Semantic chunking failed: ${error.message}. Falling back to naive chunking.`,
          );
          chunks = this.chunkText(markdown);
          for (let i = 0; i < chunks.length; i += this.chunksPerParent) {
            parentChunks.push(
              chunks.slice(i, i + this.chunksPerParent).join(' '),
            );
          }
        }
      } else {
        chunks = this.chunkText(markdown);
        for (let i = 0; i < chunks.length; i += this.chunksPerParent) {
          parentChunks.push(
            chunks.slice(i, i + this.chunksPerParent).join(' '),
          );
        }
      }

      this.logger.log(
        `Generated ${chunks.length} chunks (and ${parentChunks.length} parents) for ${metadata.title}`,
      );

      const parentIds: string[] = [];

      if (parentChunks.length > 0) {
        this.logger.log(
          `Generating embeddings for ${parentChunks.length} parent chunks...`,
        );

        for (let i = 0; i < parentChunks.length; i++) {
          const content = parentChunks[i];
          const vector = await this.generateEmbedding(
            content,
            'RETRIEVAL_DOCUMENT',
          );
          const vectorString = `[${vector.join(',')}]`;
          const parentId = randomUUID();
          parentIds.push(parentId);

          await (this.prisma as any).$executeRaw`
            INSERT INTO embeddings (id, content, "pageNumber", "documentId", vector, "parentContent")
            VALUES (${parentId}::uuid, ${content}, 1, ${document.id}, ${vectorString}::vector, ${content})
          `;

          if ((i + 1) % 10 === 0) {
            this.logger.log(
              `Processed ${i + 1}/${parentChunks.length} parent chunks`,
            );
          }
        }
        this.logger.log(`Inserted ${parentChunks.length} parent chunks`);
      }

      this.logger.log(
        `Generating embeddings for ${chunks.length} child chunks...`,
      );

      for (let i = 0; i < chunks.length; i++) {
        const content = chunks[i];
        const vector = await this.generateEmbedding(
          content,
          'RETRIEVAL_DOCUMENT',
        );
        const vectorString = `[${vector.join(',')}]`;

        let parentId: string | null = null;
        let parentContent: string | null = null;

        if (parentChunks.length > 0) {
          const parentIndex = Math.floor(i / this.chunksPerParent);
          if (parentIndex < parentIds.length) {
            parentId = parentIds[parentIndex];
            parentContent = parentChunks[parentIndex];
          }
        }

        await (this.prisma as any).$executeRaw`
          INSERT INTO embeddings (id, content, "pageNumber", "documentId", vector, "parentId", "parentContent")
          VALUES (gen_random_uuid(), ${content}, 1, ${document.id}, ${vectorString}::vector, ${parentId}::uuid, ${parentContent})
        `;

        if ((i + 1) % 10 === 0) {
          this.logger.log(
            `Processed ${i + 1}/${chunks.length} chunks for ${metadata.title}`,
          );
        }
      }
      this.logger.log(`Successfully ingested ${metadata.title}`);
    } catch (error) {
      this.logger.error(
        `Failed to ingest chunks for ${metadata.title}. Cleaning up partial data...`,
      );
      await (this.prisma as any).document.delete({
        where: { id: document.id },
      });
      throw error;
    }
  }

  async removeDocument(idOrPath: string): Promise<void> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrPath,
      );

    const doc = await (this.prisma as any).document.findUnique({
      where: isUuid ? { id: idOrPath } : { filePath: idOrPath },
    });

    if (!doc) {
      this.logger.warn(`No document found with ID or path: ${idOrPath}`);
      return;
    }

    await (this.prisma as any).document.delete({
      where: { id: doc.id },
    });
    this.logger.log(
      `Successfully removed document and all embeddings for: ${doc.title} (${doc.filePath})`,
    );
  }

  async exportDocument(idOrPath: string, outputPath: string): Promise<void> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrPath,
      );

    const doc = await (this.prisma as any).document.findUnique({
      where: isUuid ? { id: idOrPath } : { filePath: idOrPath },
    });

    if (!doc) {
      throw new Error(`Document not found: ${idOrPath}`);
    }

    const tempSchema = `temp_exp_${doc.id.replace(/-/g, '_')}`;

    try {
      const setupCmd = `docker exec -t physio_db psql -U physio_user -d physio_db -c "
        DROP SCHEMA IF EXISTS ${tempSchema} CASCADE;
        CREATE SCHEMA ${tempSchema};
        CREATE TABLE ${tempSchema}.documents AS SELECT * FROM public.documents WHERE id = '${doc.id}';
        CREATE TABLE ${tempSchema}.embeddings AS SELECT * FROM public.embeddings WHERE \\"documentId\\" = '${doc.id}';
      "`;
      execSync(setupCmd);

      const dumpCmd = `docker exec -t physio_db pg_dump -U physio_user -d physio_db \
        --data-only --column-inserts --schema=${tempSchema} \
        | sed 's/${tempSchema}\\.//g' | gzip > "${outputPath}"`;
      execSync(dumpCmd);

      this.logger.log(
        `Atomic backup created for "${doc.title}" at: ${outputPath}`,
      );
    } finally {
      const cleanupCmd = `docker exec -t physio_db psql -U physio_user -d physio_db -c "DROP SCHEMA IF EXISTS ${tempSchema} CASCADE;"`;
      execSync(cleanupCmd);
    }
  }

  async findSimilar(
    query: string,
    limit: number = 5,
    filters?: SearchFilters,
    options?: { hybridSearch?: boolean },
  ): Promise<any[]> {
    const useHybrid = options?.hybridSearch ?? true;

    if (!useHybrid) {
      return this.findSimilarDense(query, limit, filters);
    }

    const retrieveMore = Math.ceil(limit * 5); // Fetch more for reranking

    const [denseResults, bm25Results] = await Promise.all([
      this.findSimilarDense(query, retrieveMore, filters),
      this.findSimilarBM25(query, retrieveMore, filters),
    ]);

    let results: any[];

    if (bm25Results.length === 0) {
      results = denseResults;
    } else {
      results = this.combineWithRRF(denseResults, bm25Results);
    }

    // Apply Cross-Encoder Reranking
    const reranked = await this.rerank(query, results, limit);
    return reranked;
  }

  private async rerank(
    query: string,
    documents: any[],
    topN: number,
  ): Promise<any[]> {
    const apiKey = this.configService.get<string>('COHERE_API_KEY');
    if (!apiKey || documents.length === 0) {
      return documents.slice(0, topN);
    }

    try {
      const response = await this.cohere.v2.rerank({
        documents: documents.map((d) => d.parentContent || d.content),
        query,
        topN,
        model: 'rerank-v4.0-pro',
      });

      // Map rerank results back to original documents
      return response.results.map((r) => {
        const originalDoc = documents[r.index];
        return {
          ...originalDoc,
          rerankScore: r.relevanceScore,
          // Optimization: Return parent content as main content for LLM context
          content: originalDoc.parentContent || originalDoc.content,
        };
      });
    } catch (error) {
      this.logger.warn(`Reranking failed: ${error.message}. Returning top K.`);
      return documents.slice(0, topN);
    }
  }

  private async findSimilarDense(
    query: string,
    limit: number = 5,
    filters?: SearchFilters,
  ): Promise<any[]> {
    const vector = await this.generateEmbedding(query, 'RETRIEVAL_QUERY');
    const vectorString = `[${vector.join(',')}]`;

    // Base query parts
    let whereClause = Prisma.sql``;

    if (filters?.documentIds?.length) {
      whereClause = Prisma.sql`${whereClause} AND e."documentId" = ANY(${filters.documentIds}::text[])`;
    }

    if (filters?.minYear) {
      whereClause = Prisma.sql`${whereClause} AND (d.metadata->>'year')::int >= ${filters.minYear}`;
    }

    if (filters?.volume) {
      whereClause = Prisma.sql`${whereClause} AND d.metadata->>'volume' = ${filters.volume}`;
    }

    const results: any[] = await (this.prisma as any).$queryRaw`
      SELECT 
        e.id,
        e.content,
        e."parentContent",
        e."pageNumber", 
        d.title as "documentTitle",
        d.author as "documentAuthor",
        d."filePath" as "documentFilePath",
        d.metadata as "documentMetadata",
        1 - (e.vector <=> ${vectorString}::vector) as similarity
      FROM embeddings e
      JOIN documents d ON e."documentId" = d.id
      WHERE 1=1 ${whereClause}
      ORDER BY e.vector <=> ${vectorString}::vector
      LIMIT ${limit}
    `;

    return results;
  }

  /**
   * Full-text search using PostgreSQL tsvector/tsquery
   * Uses ts_rank for BM25-style scoring
   */
  async findSimilarBM25(
    query: string,
    limit: number = 10,
    filters?: SearchFilters,
  ): Promise<BM25Result[]> {
    // Base query parts
    let whereClause = Prisma.sql``;

    if (filters?.documentIds?.length) {
      whereClause = Prisma.sql`${whereClause} AND e."documentId" = ANY(${filters.documentIds}::text[])`;
    }

    if (filters?.minYear) {
      whereClause = Prisma.sql`${whereClause} AND (d.metadata->>'year')::int >= ${filters.minYear}`;
    }

    if (filters?.volume) {
      whereClause = Prisma.sql`${whereClause} AND d.metadata->>'volume' = ${filters.volume}`;
    }

    // Using plainto_tsquery for natural language query handling
    const results: any[] = await (this.prisma as any).$queryRaw`
      SELECT 
        e.id,
        e.content,
        e."parentContent",
        e."pageNumber",
        d.title as "documentTitle",
        d.author as "documentAuthor",
        d."filePath" as "documentFilePath",
        d.metadata as "documentMetadata",
        ts_rank(to_tsvector('english', e.content), plainto_tsquery('english', ${query})) as "bm25Score"
      FROM embeddings e
      JOIN documents d ON e."documentId" = d.id
      WHERE to_tsvector('english', e.content) @@ plainto_tsquery('english', ${query})
      ${whereClause}
      ORDER BY "bm25Score" DESC
      LIMIT ${limit}
    `;

    // Map raw results to typed interface
    return results.map((r) => ({
      id: r.id,
      content: r.content,
      pageNumber: r.pageNumber,
      documentTitle: r.documentTitle,
      documentAuthor: r.documentAuthor,
      documentFilePath: r.documentFilePath,
      documentMetadata: r.documentMetadata,
      bm25Score: r.bm25Score,
    }));
  }

  /**
   * Combines dense and sparse search results using RRF
   * Formula: score = sum(1.0 / (k + rank)) where k=60
   *
   * @param denseResults - Results from vector similarity search
   * @param sparseResults - Results from BM25 search
   * @returns Combined results sorted by RRF score
   */
  private combineWithRRF(
    denseResults: Array<{ id: string; similarity: number; [key: string]: any }>,
    sparseResults: Array<{ id: string; bm25Score: number; [key: string]: any }>,
    k: number = 60,
  ): Array<{ id: string; rrfScore: number; [key: string]: any }> {
    const scoreMap = new Map<string, { rrfScore: number; data: any }>();

    // Add dense results
    denseResults.forEach((result, rank) => {
      const rrfContrib = 1.0 / (k + rank + 1);
      const existing = scoreMap.get(result.id);
      if (existing) {
        existing.rrfScore += rrfContrib;
        // Merge data if needed, but dense result usually has similarity
        existing.data = { ...existing.data, ...result };
      } else {
        scoreMap.set(result.id, { rrfScore: rrfContrib, data: result });
      }
    });

    // Add sparse results
    sparseResults.forEach((result, rank) => {
      const rrfContrib = 1.0 / (k + rank + 1);
      const existing = scoreMap.get(result.id);
      if (existing) {
        existing.rrfScore += rrfContrib;
        existing.data = { ...existing.data, ...result };
      } else {
        scoreMap.set(result.id, { rrfScore: rrfContrib, data: result });
      }
    });

    // Sort by RRF score descending
    return Array.from(scoreMap.values())
      .sort((a, b) => b.rrfScore - a.rrfScore)
      .map((item) => ({ ...item.data, rrfScore: item.rrfScore }));
  }

  async updateMetadata(
    idOrPath: string,
    updates: {
      title?: string;
      author?: string;
      volume?: string;
      edition?: string;
      year?: string;
      filePath?: string;
    },
  ): Promise<void> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrPath,
      );

    const doc = await (this.prisma as any).document.findUnique({
      where: isUuid ? { id: idOrPath } : { filePath: idOrPath },
    });

    if (!doc) {
      throw new Error(`Document not found: ${idOrPath}`);
    }

    const currentMetadata = doc.metadata || {};
    const newMetadata = {
      ...currentMetadata,
      volume:
        updates.volume !== undefined ? updates.volume : currentMetadata.volume,
      edition:
        updates.edition !== undefined
          ? updates.edition
          : currentMetadata.edition,
      year: updates.year !== undefined ? updates.year : currentMetadata.year,
    };

    await (this.prisma as any).document.update({
      where: { id: doc.id },
      data: {
        title: updates.title || doc.title,
        author: updates.author || doc.author,
        filePath: updates.filePath || doc.filePath,
        metadata: newMetadata,
      },
    });

    this.logger.log(`Updated metadata for: ${doc.title}`);
  }

  public async extractMetadata(
    text: string,
    fallback: string,
  ): Promise<{
    title: string;
    author: string;
    volume?: string;
    edition?: string;
    year?: string;
  }> {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');

    const beautified = fallback.replace(/_/g, ' ').replace(/-/g, ' ').trim();

    if (!apiKey) {
      return { title: beautified, author: 'Unknown Author' };
    }

    try {
      const prompt = `
        Based on the following text from the beginning of a medical book, identify the official Title, Author(s), Volume (Tomo/Volumen), Edition, and Publication Year.
        
        TEXT:
        ${text}
        
        RULES:
        - Return ONLY a JSON object: {"title": "...", "author": "...", "volume": "...", "edition": "...", "year": "..."}
        - If multiple authors, list them separated by commas.
        - If you cannot find a field, return null for that field.
        - Use "${beautified}" if the title is not clearly found.
      `;

      const result = await this.genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const jsonStr = (result.text || '')
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      const meta = JSON.parse(jsonStr);

      this.logger.log(
        `AI extracted metadata: ${meta.title} ${meta.volume ? `(${meta.volume})` : ''} by ${meta.author}`,
      );
      return {
        title: meta.title || beautified,
        author: meta.author || 'Unknown Author',
        volume: meta.volume || undefined,
        edition: meta.edition || undefined,
        year: meta.year || undefined,
      };
    } catch (error) {
      this.logger.warn(
        `AI metadata extraction failed: ${error.message}. Using fallback.`,
      );
      return { title: beautified, author: 'Unknown Author' };
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private async semanticChunk(
    text: string,
    options: {
      similarityThreshold?: number;
      targetChunkSize?: number;
      maxChunkSize?: number;
    } = {},
  ): Promise<{ chunks: string[]; parentChunks: string[] }> {
    const {
      similarityThreshold = 0.85,
      targetChunkSize = 400,
      maxChunkSize = 512,
    } = options;

    // 1. Split text into paragraphs first to respect boundaries
    const paragraphs = text.split(/\n\n+/);
    const refinedSentences: { text: string; isParagraphStart: boolean }[] = [];

    for (const para of paragraphs) {
      const paraSentences = para.match(/(?<=[.!?])\s+/g)
        ? para.split(/(?<=[.!?])\s+/)
        : [para];

      paraSentences.forEach((s, i) => {
        if (s.trim().length > 0) {
          refinedSentences.push({
            text: s.trim(),
            isParagraphStart: i === 0,
          });
        }
      });
    }

    if (refinedSentences.length === 0) {
      return { chunks: [], parentChunks: [] };
    }

    const sentenceTexts = refinedSentences.map((s) => s.text);
    const embeddings = await this.generateEmbeddingsBatch(
      sentenceTexts,
      'RETRIEVAL_DOCUMENT',
    );

    // 3. Group sentences into chunks
    const chunks: string[] = [];
    let currentChunkSentences: string[] = [];
    let currentChunkTokens = 0;

    for (let i = 0; i < refinedSentences.length; i++) {
      const sentence = refinedSentences[i];
      const sentenceEmbedding = embeddings[i];
      const sentenceTokens = sentence.text.split(/\s+/).length; // Approximation

      if (currentChunkSentences.length === 0) {
        currentChunkSentences.push(sentence.text);
        currentChunkTokens += sentenceTokens;
        continue;
      }

      const prevEmbedding = embeddings[i - 1];
      const similarity = this.cosineSimilarity(
        prevEmbedding,
        sentenceEmbedding,
      );

      const isSimilarityDrop = similarity < similarityThreshold;
      const isMaxChunkSizeExceeded =
        currentChunkTokens + sentenceTokens > maxChunkSize;
      const isParagraphStart = sentence.isParagraphStart;

      // Decision to start new chunk
      if (
        isParagraphStart ||
        (currentChunkTokens >= targetChunkSize && isSimilarityDrop) ||
        isMaxChunkSizeExceeded
      ) {
        chunks.push(currentChunkSentences.join(' '));
        currentChunkSentences = [sentence.text];
        currentChunkTokens = sentenceTokens;
      } else {
        currentChunkSentences.push(sentence.text);
        currentChunkTokens += sentenceTokens;
      }
    }

    if (currentChunkSentences.length > 0) {
      chunks.push(currentChunkSentences.join(' '));
    }

    // 4. Create parent chunks
    // Combine 4-5 regular chunks
    const parentChunks: string[] = [];

    for (let i = 0; i < chunks.length; i += this.chunksPerParent) {
      const parentChunk = chunks.slice(i, i + this.chunksPerParent).join(' ');
      parentChunks.push(parentChunk);
    }

    return { chunks, parentChunks };
  }

  private chunkText(
    text: string,
    wordsPerChunk: number = 500,
    overlap: number = 50,
  ): string[] {
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    const chunks: string[] = [];

    if (words.length === 0) return [];

    for (let i = 0; i < words.length; i += wordsPerChunk - overlap) {
      const chunk = words.slice(i, i + wordsPerChunk).join(' ');
      chunks.push(chunk);
      if (i + wordsPerChunk >= words.length) break;
    }

    return chunks;
  }

  private async generateEmbedding(
    text: string,
    taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY' = 'RETRIEVAL_QUERY',
  ): Promise<number[]> {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      const vector = new Array(768).fill(0);
      vector[0] = text.length / 1000;
      return vector;
    }

    const estimatedTokens = this.rateLimiter.estimateTokens(text);
    const delay = this.rateLimiter.getRequiredDelay(estimatedTokens);

    if (delay > 1000) {
      this.logger.debug(
        `Rate limit: waiting ${Math.round(delay / 1000)}s before embedding (${estimatedTokens} tokens)`,
      );
    }

    await sleep(delay);

    const result = await withRetry(
      async () => {
        const res = await this.genAI.models.embedContent({
          model: 'gemini-embedding-001',
          contents: [{ role: 'user', parts: [{ text }] }],
          config: {
            taskType: taskType,
            outputDimensionality: 768,
          },
        });

        if (
          !res.embeddings ||
          res.embeddings.length === 0 ||
          !res.embeddings[0].values
        ) {
          throw new Error('No embedding returned');
        }
        return res.embeddings[0].values;
      },
      { maxRetries: 5 },
      this.logger,
    );

    this.rateLimiter.recordTokens(estimatedTokens);
    return result;
  }

  /**
   * Generate embeddings for multiple texts in batches.
   * Uses small batches (10 texts) with 1.5s delay to stay under 100 RPM free tier limit.
   *
   * @param texts - Array of texts to embed
   * @param taskType - Type of embedding task
   * @returns Array of embedding vectors in the same order as input texts
   */
  async generateEmbeddingsBatch(
    texts: string[],
    taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY' = 'RETRIEVAL_QUERY',
  ): Promise<number[][]> {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');

    // Return mock embeddings if no API key
    if (!apiKey) {
      return texts.map((text) => {
        const vector = new Array(768).fill(0);
        vector[0] = text.length / 1000;
        return vector;
      });
    }

    if (texts.length === 0) {
      return [];
    }

    // Small batches to stay under 100 RPM free tier limit
    const MAX_BATCH_SIZE = 10;
    const BATCH_DELAY_MS = 1500;
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
      const batch = texts.slice(i, i + MAX_BATCH_SIZE);

      const batchEmbeddings = await withRetry(
        async () => {
          const result = await this.genAI.models.embedContent({
            model: 'gemini-embedding-001',
            contents: batch,
            config: {
              taskType: taskType,
              outputDimensionality: 768,
            },
          });

          if (!result.embeddings || result.embeddings.length !== batch.length) {
            throw new Error(
              `Expected ${batch.length} embeddings, got ${result.embeddings?.length || 0}`,
            );
          }

          return result.embeddings.map((e) => {
            if (!e.values) {
              throw new Error('Embedding missing values');
            }
            return e.values;
          });
        },
        { maxRetries: 5 },
        this.logger,
      );

      allEmbeddings.push(...batchEmbeddings);

      // Log progress every 100 chunks
      if (
        (i + MAX_BATCH_SIZE) % 100 === 0 ||
        i + MAX_BATCH_SIZE >= texts.length
      ) {
        this.logger.log(
          `Embedding progress: ${Math.min(i + MAX_BATCH_SIZE, texts.length)}/${texts.length}`,
        );
      }

      // 1.5s delay between batches to stay under 100 RPM
      if (i + MAX_BATCH_SIZE < texts.length) {
        await sleep(BATCH_DELAY_MS);
      }
    }

    return allEmbeddings;
  }
}
