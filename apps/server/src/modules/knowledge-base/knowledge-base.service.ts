import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import { withRetry } from '../transcription/utils/retry';
import { promisify } from 'util';

const sleep = promisify(setTimeout);

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

    // Extract high-quality metadata using AI from the first ~2000 characters
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
      const chunks = this.chunkText(pdfData.text);
      this.logger.log(`Generated ${chunks.length} chunks for ${meta.title}`);

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
            `Processed ${i + 1}/${chunks.length} chunks for ${meta.title}`,
          );
        }

        await sleep(1500);
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
        d.metadata as "documentMetadata",
        1 - (e.vector <=> ${vectorString}::vector) as similarity
      FROM embeddings e
      JOIN documents d ON e."documentId" = d.id
      ORDER BY e.vector <=> ${vectorString}::vector
      LIMIT ${limit}
    `;

    return results;
  }

  async updateMetadata(
    idOrPath: string,
    updates: {
      title?: string;
      author?: string;
      volume?: string;
      edition?: string;
      year?: string;
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

    const currentMetadata = (doc.metadata as any) || {};
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
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
      });
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonStr = response
        .text()
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
      { maxRetries: 5 },
      this.logger,
    );
  }
}
