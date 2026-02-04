import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import { withRetry } from '../transcription/utils/retry';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PDFParse } = require('pdf-parse');

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);
  private readonly genAI: GoogleGenerativeAI;

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
    this.genAI = new GoogleGenerativeAI(apiKey || 'mock-key');
  }

  async ingestFile(filePath: string): Promise<void> {
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

    const title = path.basename(filePath, '.pdf');
    const document = await (this.prisma as any).document.create({
      data: {
        title,
        filePath,
      },
    });

    const chunks = this.chunkText(pdfData.text);
    this.logger.log(`Generated ${chunks.length} chunks for ${title}`);

    for (let i = 0; i < chunks.length; i++) {
      const content = chunks[i];
      const vector = await this.generateEmbedding(
        content,
        'RETRIEVAL_DOCUMENT',
      );
      const vectorString = `[${vector.join(',')}]`;

      await this.prisma.$executeRaw`
        INSERT INTO embeddings (id, content, "pageNumber", "documentId", vector)
        VALUES (gen_random_uuid(), ${content}, 1, ${document.id}, ${vectorString}::vector)
      `;

      if ((i + 1) % 10 === 0) {
        this.logger.log(
          `Processed ${i + 1}/${chunks.length} chunks for ${title}`,
        );
      }
    }

    this.logger.log(`Successfully ingested ${title}`);
  }

  async findSimilar(query: string, limit: number = 5): Promise<any[]> {
    const vector = await this.generateEmbedding(query, 'RETRIEVAL_QUERY');
    const vectorString = `[${vector.join(',')}]`;

    const results: any[] = await this.prisma.$queryRaw`
      SELECT 
        e.content, 
        e."pageNumber", 
        d.title as "documentTitle",
        d.author as "documentAuthor",
        d."filePath" as "documentFilePath",
        1 - (e.vector <=> ${vectorString}::vector) as similarity
      FROM embeddings e
      JOIN documents d ON e."documentId" = d.id
      ORDER BY e.vector <=> ${vectorString}::vector
      LIMIT ${limit}
    `;

    return results;
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
        const result = await this.genAI
          .getGenerativeModel({ model: 'gemini-embedding-001' })
          .embedContent({
            content: { parts: [{ text }], role: 'user' },
            taskType,
            outputDimensionality: 768,
          } as any);
        return result.embedding.values;
      },
      { maxRetries: 3 },
      this.logger,
    );
  }
}
