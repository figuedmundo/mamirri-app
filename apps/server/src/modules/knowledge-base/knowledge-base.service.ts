import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import { withRetry } from '../transcription/utils/retry';
import { promisify } from 'util';

const sleep = promisify(setTimeout);

import { PDFParse } from 'pdf-parse';
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';

import { Prisma } from '@prisma/client';

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
  private readonly chunksPerParent = 5;

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
    const dataBuffer = fs.readFileSync(absolutePath);
    const parser = new PDFParse({ data: dataBuffer });
    const pdfData = await parser.getText();
    await parser.destroy();

    const firstPageText = pdfData.text.substring(0, 2000);

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
          const result = await this.semanticChunk(pdfData.text);
          chunks = result.chunks;
          parentChunks = result.parentChunks;
        } catch (error) {
          this.logger.warn(
            `Semantic chunking failed: ${error.message}. Falling back to naive chunking.`,
          );
          chunks = this.chunkText(pdfData.text);
        }
      } else {
        chunks = this.chunkText(pdfData.text);
      }

      this.logger.log(
        `Generated ${chunks.length} chunks (and ${parentChunks.length} parents) for ${meta.title}`,
      );

      const parentIds: string[] = [];

      if (parentChunks.length > 0) {
        this.logger.log(
          `Generating embeddings for ${parentChunks.length} parent chunks...`,
        );
        const parentEmbeddings = await this.generateEmbeddingsBatch(
          parentChunks,
          'RETRIEVAL_DOCUMENT',
        );

        for (let i = 0; i < parentChunks.length; i++) {
          const content = parentChunks[i];
          const vector = parentEmbeddings[i];
          const vectorString = `[${vector.join(',')}]`;
          const parentId = randomUUID();
          parentIds.push(parentId);

          await this.prisma.$executeRaw`
            INSERT INTO embeddings (id, content, "pageNumber", "documentId", vector, "parentContent")
            VALUES (${parentId}::uuid, ${content}, 1, ${document.id}, ${vectorString}::vector, ${content})
          `;
        }
        this.logger.log(`Inserted ${parentChunks.length} parent chunks`);
      }

      this.logger.log(
        `Generating embeddings for ${chunks.length} child chunks...`,
      );
      const childEmbeddings = await this.generateEmbeddingsBatch(
        chunks,
        'RETRIEVAL_DOCUMENT',
      );

      for (let i = 0; i < chunks.length; i++) {
        const content = chunks[i];
        const vector = childEmbeddings[i];
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

        await this.prisma.$executeRaw`
          INSERT INTO embeddings (id, content, "pageNumber", "documentId", vector, "parentId", "parentContent")
          VALUES (gen_random_uuid(), ${content}, 1, ${document.id}, ${vectorString}::vector, ${parentId}::uuid, ${parentContent})
        `;

        if ((i + 1) % 100 === 0) {
          this.logger.log(
            `Inserted ${i + 1}/${chunks.length} chunks for ${meta.title}`,
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

    const retrieveMore = Math.ceil(limit * 3);

    const [denseResults, bm25Results] = await Promise.all([
      this.findSimilarDense(query, retrieveMore, filters),
      this.findSimilarBM25(query, retrieveMore, filters),
    ]);

    if (bm25Results.length === 0) {
      return denseResults.slice(0, limit);
    }

    const combined = this.combineWithRRF(denseResults, bm25Results);
    return combined.slice(0, limit);
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

    const results: any[] = await this.prisma.$queryRaw`
      SELECT 
        e.id,
        e.content, 
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
    const results: any[] = await this.prisma.$queryRaw`
      SELECT 
        e.id,
        e.content,
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

  private async extractMetadata(
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

    return await withRetry(
      async () => {
        const result = await this.genAI.models.embedContent({
          model: 'gemini-embedding-001',
          contents: [{ role: 'user', parts: [{ text }] }],
          config: {
            taskType: taskType,
            outputDimensionality: 768,
          },
        });

        if (
          !result.embeddings ||
          result.embeddings.length === 0 ||
          !result.embeddings[0].values
        ) {
          throw new Error('No embedding returned');
        }
        return result.embeddings[0].values;
      },
      { maxRetries: 5 },
      this.logger,
    );
  }

  /**
   * Generate embeddings for multiple texts in a single API call.
   * Gemini API supports batching up to 100 texts per request.
   * This dramatically reduces API call count (e.g., 2800 calls -> ~30 calls).
   *
   * @param texts - Array of texts to embed (max 100 per batch)
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

    // Gemini supports up to 100 texts per batch
    const MAX_BATCH_SIZE = 100;
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
      const batch = texts.slice(i, i + MAX_BATCH_SIZE);

      const batchEmbeddings = await withRetry(
        async () => {
          // Pass array of strings directly to contents
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

      // Log progress for large batches
      if (texts.length > MAX_BATCH_SIZE) {
        this.logger.log(
          `Batch embedding progress: ${Math.min(i + MAX_BATCH_SIZE, texts.length)}/${texts.length}`,
        );
      }

      // Small delay between batches to avoid rate limits
      if (i + MAX_BATCH_SIZE < texts.length) {
        await sleep(500);
      }
    }

    return allEmbeddings;
  }
}
