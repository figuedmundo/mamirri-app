import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { VoyageEmbeddingService } from './services/voyage-embedding.service';
import * as fs from 'fs';
import * as path from 'path';
import { execSync, spawn } from 'child_process';
import { PDFParse } from 'pdf-parse';
import { randomUUID } from 'crypto';

import { Prisma } from '@prisma/client';

import matter from 'gray-matter';

export enum ChunkType {
  NARRATIVE = 'NARRATIVE',
  INDEX = 'INDEX',
  TOC = 'TOC',
  REFERENCES = 'REFERENCES',
}

import { CohereClient } from 'cohere-ai';
import { GoogleGenAI } from '@google/genai';

export interface BM25Result {
  id: string;
  content: string;
  pageNumber: number;
  documentTitle: string;
  documentAuthor: string;
  documentFilePath: string;
  documentMetadata: any;
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

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly voyageEmbeddingService: VoyageEmbeddingService,
  ) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    this.genAI = new GoogleGenAI({ apiKey: apiKey || 'mock-key' });

    const cohereApiKey = this.configService.get<string>('COHERE_API_KEY');
    this.cohere = new CohereClient({ token: cohereApiKey || 'mock-key' });
  }

  /**
   * Extract text from Document (PDF, EPUB) using the specified engine.
   *
   * This method orchestrates external Python scripts to handle document processing.
   * It supports two engines:
   * - 'pymupdf': Fast, rule-based extraction (legacy/default). Supports PDF and EPUB.
   * - 'docling': High-fidelity computer vision based extraction (best for complex PDF layouts).
   *
   * @param filePath - Absolute path to the document file.
   * @param engine - The extraction engine to use ('pymupdf' | 'docling').
   * @param options - Optional configuration for partial extraction.
   * @param options.startPage - Start page (1-indexed, inclusive).
   * @param options.endPage - End page (1-indexed, inclusive).
   * @returns A promise resolving to the extracted Markdown string.
   */
  async extractDocument(
    filePath: string,
    engine: 'pymupdf' | 'docling' = 'pymupdf',
    options: { startPage?: number; endPage?: number } = {},
  ): Promise<string> {
    const isEpub = filePath.toLowerCase().endsWith('.epub');
    // Force pymupdf for EPUBs as Docling (via our worker) is PDF-specific
    const isDocling = engine === 'docling' && !isEpub;

    if (isEpub && engine === 'docling') {
      this.logger.warn(
        'Docling engine does not support EPUB in the current worker setup. Falling back to PyMuPDF.',
      );
    }

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
      // PyMuPDF script (handles PDF and EPUB)
      scriptPath = path.resolve(__dirname, '../../../scripts/extract-doc.py');
      // Arguments: file --json
      args = [filePath, '--json'];

      if (options.startPage !== undefined && options.endPage !== undefined) {
        // PyMuPDF script is 0-indexed in code but often scripts are 1-indexed for users.
        // Looking at extract-doc.py, it says "0-indexed, inclusive" in docstring.
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
            `Document extraction failed with code ${code}. Error: ${stderrData}`,
          );
          return reject(new Error(`Document extraction failed: ${stderrData}`));
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
              new Error(
                `Failed to parse document extraction output: No JSON found`,
              ),
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
          reject(new Error(`Failed to parse document extraction output`));
        }
      });
    });
  }

  /**
   * Extract text from EPUB using ebooklib + pandoc for high-quality conversion.
   *
   * This method uses the dedicated EPUB worker which:
   * - Respects EPUB spine reading order (not arbitrary item order)
   * - Extracts full Dublin Core metadata
   * - Uses pandoc for best-in-class HTML→Markdown conversion
   * - Handles tables, lists, and formatting better than PyMuPDF
   *
   * @param filePath - Absolute path to the EPUB file.
   * @param options - Optional configuration for partial extraction.
   * @param options.startPage - Start chapter (1-indexed, inclusive).
   * @param options.endPage - End chapter (1-indexed, inclusive).
   * @returns A promise resolving to the extracted Markdown string.
   */
  async extractEpub(
    filePath: string,
    options: { startPage?: number; endPage?: number } = {},
  ): Promise<string> {
    const workerDir = path.resolve(__dirname, '../../../../workers/epub');
    const pythonCommand = path.join(workerDir, '.venv/bin/python');
    const scriptPath = path.join(workerDir, 'main.py');

    // Fallback to system python if venv doesn't exist
    const pythonCmd = fs.existsSync(pythonCommand) ? pythonCommand : 'python3';

    const args: string[] = [filePath];

    if (options.startPage !== undefined && options.endPage !== undefined) {
      args.push(
        '--pages',
        options.startPage.toString(),
        options.endPage.toString(),
      );
    }

    this.logger.log(
      `Using EPUB worker (ebooklib + pandoc) for: ${path.basename(filePath)}`,
    );

    return new Promise((resolve, reject) => {
      const process = spawn(pythonCmd, [scriptPath, ...args]);

      let stdoutData = '';
      let stderrData = '';

      process.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      process.stderr.on('data', (data) => {
        const str = data.toString();
        stderrData += str;
        if (str.includes('Processing chapter') || str.includes('pandoc')) {
          this.logger.log(str.trim());
        }
      });

      process.on('close', (code) => {
        if (code !== 0) {
          this.logger.error(
            `EPUB extraction failed with code ${code}. Error: ${stderrData}`,
          );
          return reject(new Error(`EPUB extraction failed: ${stderrData}`));
        }

        try {
          const jsonStart = stdoutData.indexOf('{');
          const jsonEnd = stdoutData.lastIndexOf('}');

          if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
            this.logger.error(
              `No valid JSON found in EPUB extraction output. Raw stdout: ${stdoutData}`,
            );
            return reject(
              new Error(
                `Failed to parse EPUB extraction output: No JSON found`,
              ),
            );
          }

          const jsonStr = stdoutData.substring(jsonStart, jsonEnd + 1);
          const result = JSON.parse(jsonStr);

          if (result.error) {
            reject(new Error(result.error));
          } else {
            this.logger.log(
              `EPUB extraction complete: ${result.pages_processed}/${result.total_pages} chapters processed`,
            );
            if (result.metadata?.title) {
              this.logger.log(`  Title: ${result.metadata.title}`);
            }
            resolve(result.markdown);
          }
        } catch (e) {
          this.logger.error(
            `Failed to parse EPUB extraction output: ${e.message}. Raw stdout: ${stdoutData}`,
          );
          reject(new Error(`Failed to parse EPUB extraction output`));
        }
      });
    });
  }

  /**
   * Legacy method wrapper for backward compatibility
   */
  async extractDocumentWithPyMuPDF(filePath: string): Promise<string> {
    return this.extractDocument(filePath, 'pymupdf');
  }

  // Backwards compatibility alias
  async extractPdf(
    filePath: string,
    engine: 'pymupdf' | 'docling' = 'pymupdf',
    options: { startPage?: number; endPage?: number } = {},
  ): Promise<string> {
    return this.extractDocument(filePath, engine, options);
  }

  // Backwards compatibility alias
  async extractPdfWithPyMuPDF(filePath: string): Promise<string> {
    return this.extractDocumentWithPyMuPDF(filePath);
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
      let chunks: { content: string; pageNumber: number }[] = [];
      let parentChunks: { content: string; pageNumber: number }[] = [];

      if (useSemanticChunking) {
        try {
          const pages = this.splitByPages(pdfText);
          const result = await this.semanticChunk(pages);
          chunks = result.chunks;
          parentChunks = result.parentChunks;
        } catch (error) {
          this.logger.warn(
            `Semantic chunking failed: ${error.message}. Falling back to naive chunking.`,
          );
          const pages = this.splitByPages(pdfText);
          chunks = this.chunkText(pages);
          for (let i = 0; i < chunks.length; i += this.chunksPerParent) {
            const batch = chunks.slice(i, i + this.chunksPerParent);
            parentChunks.push({
              content: batch.map((c) => c.content).join(' '),
              pageNumber: batch[0].pageNumber, // Use start page of the parent chunk
            });
          }
        }
      } else {
        const pages = this.splitByPages(pdfText);
        chunks = this.chunkText(pages);
        for (let i = 0; i < chunks.length; i += this.chunksPerParent) {
          const batch = chunks.slice(i, i + this.chunksPerParent);
          parentChunks.push({
            content: batch.map((c) => c.content).join(' '),
            pageNumber: batch[0].pageNumber,
          });
        }
      }
      this.logger.log(
        `Generated ${chunks.length} chunks (and ${parentChunks.length} parents) for ${meta.title}`,
      );

      const counts = { NARRATIVE: 0, INDEX: 0, TOC: 0, REFERENCES: 0 };
      for (const chunk of chunks) {
        const type = this.detectChunkType(chunk.content);
        counts[type]++;
      }
      this.logger.log(
        `Classification: ${counts.NARRATIVE} Narrative, ${counts.INDEX} Index, ${counts.TOC} TOC, ${counts.REFERENCES} Refs`,
      );

      const parentIds: string[] = [];

      if (parentChunks.length > 0) {
        this.logger.log(
          `Generating embeddings for ${parentChunks.length} parent chunks in batches...`,
        );

        const parentTexts = parentChunks.map((p) => p.content);
        const parentEmbeddings =
          await this.voyageEmbeddingService.generateDocumentEmbeddingsBatch(
            parentTexts,
          );

        this.logger.log(
          `Inserting ${parentChunks.length} parent chunks into database...`,
        );

        for (let i = 0; i < parentChunks.length; i++) {
          const content = parentChunks[i];
          const vector = parentEmbeddings[i];
          const vectorString = `[${vector.join(',')}]`;
          const parentId = randomUUID();
          parentIds.push(parentId);

          const chunkType = this.detectChunkType(content.content);

          await (this.prisma as any).$executeRaw`
            INSERT INTO embeddings (id, content, "pageNumber", "documentId", vector, "parentContent", "chunkType")
            VALUES (${parentId}::uuid, ${content.content}, ${content.pageNumber}, ${document.id}::uuid, ${vectorString}::vector, ${content.content}, ${chunkType}::"ChunkType")
          `;

          if ((i + 1) % 10 === 0 || i === parentChunks.length - 1) {
            this.logger.log(
              `Inserted ${i + 1}/${parentChunks.length} parent chunks`,
            );
          }
        }
        this.logger.log(`Inserted ${parentChunks.length} parent chunks`);
      }

      this.logger.log(
        `Generating embeddings for ${chunks.length} child chunks in batches...`,
      );

      const chunkTexts = chunks.map((c) => c.content);
      const chunkEmbeddings =
        await this.voyageEmbeddingService.generateDocumentEmbeddingsBatch(
          chunkTexts,
        );

      this.logger.log(
        `Inserting ${chunks.length} child chunks into database...`,
      );

      for (let i = 0; i < chunks.length; i++) {
        const content = chunks[i];
        const vector = chunkEmbeddings[i];
        const vectorString = `[${vector.join(',')}]`;

        let parentId: string | null = null;
        let parentContent: string | null = null;

        if (parentChunks.length > 0) {
          const parentIndex = Math.floor(i / this.chunksPerParent);
          if (parentIndex < parentIds.length) {
            parentId = parentIds[parentIndex];
            parentContent = parentChunks[parentIndex].content;
          }
        }

        const chunkType = this.detectChunkType(content.content);

        await (this.prisma as any).$executeRaw`
            INSERT INTO embeddings (id, content, "pageNumber", "documentId", vector, "parentId", "parentContent", "chunkType")
            VALUES (gen_random_uuid(), ${content.content}, ${content.pageNumber}, ${document.id}::uuid, ${vectorString}::vector, ${parentId}::uuid, ${parentContent}, ${chunkType}::"ChunkType")
          `;

        if ((i + 1) % 50 === 0 || i === chunks.length - 1) {
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

  async ingestMarkdown(
    markdown: string,
    metadata: {
      title: string;
      author: string;
      volume?: string;
      edition?: string;
      year?: string;
      archetype?: any;
    },
    filePath: string,
    useSemanticChunking: boolean = false,
    useBatchApi: boolean = false,
    dryRun: boolean = false,
  ): Promise<{ id: string; staged?: boolean; stagingFilePath?: string }> {
    // 1. Parse Frontmatter and Manual Tags
    const { data: frontmatter, content: rawBody } = matter(markdown);

    // Merge provided metadata with frontmatter (frontmatter wins)
    const mergedMetadata = {
      ...metadata,
      ...frontmatter,
    };

    const finalArchetype = (mergedMetadata as any).archetype || 'GENERAL';

    let body = rawBody.replace(
      /<!-- chunk: exclude -->[\s\S]*?<!-- chunk: end -->/g,
      () => '',
    );

    const manualChunks: {
      content: string;
      pageNumber: number;
      sectionType?: string;
    }[] = [];

    // Process section tags first (we keep content but want to label chunks)
    const sectionMatches: { type: string; content: string }[] = [];
    body = body.replace(
      /<!-- section: ([a-z-]+) -->([\s\S]*?)<!-- section: end -->/g,
      (match, type, content) => {
        sectionMatches.push({ type, content: content.trim() });
        return content;
      },
    );

    body = body.replace(
      /<!-- chunk: merge -->([\s\S]*?)<!-- chunk: end -->/g,
      (match, p1, offset) => {
        const pageMatch = body
          .slice(0, offset)
          .match(/<!-- PAGE_NUMBER: (\d+) -->/g);
        let pageNum = 1;
        if (pageMatch && pageMatch.length > 0) {
          const lastMatch = pageMatch[pageMatch.length - 1];
          const numMatch = lastMatch.match(/\d+/);
          if (numMatch) pageNum = parseInt(numMatch[0]);
        }

        manualChunks.push({
          content: p1.trim(),
          pageNumber: pageNum,
        });
        return '';
      },
    );

    const existingDoc = await (this.prisma as any).document.findFirst({
      where: { title: mergedMetadata.title },
    });

    if (existingDoc) {
      if (dryRun) {
        this.logger.warn(
          `[DRY RUN] Document "${metadata.title}" exists in DB. Proceeding with simulation...`,
        );
      } else {
        this.logger.warn(
          `Document "${metadata.title}" already exists. Skipping.`,
        );
        return { id: existingDoc.id };
      }
    }

    let documentId = existingDoc?.id || randomUUID();

    if (!dryRun && !useBatchApi) {
      if (!existingDoc) {
        const document = await (this.prisma as any).document.create({
          data: {
            title: mergedMetadata.title,
            author: mergedMetadata.author,
            filePath: filePath,
            archetype: finalArchetype,
            metadata: mergedMetadata,
          },
        });
        documentId = document.id;
      }
    } else if (dryRun) {
      this.logger.log(
        `[DRY RUN] Simulating document creation (ID: ${documentId})`,
      );
    } else if (useBatchApi) {
      this.logger.log(
        `[BATCH MODE] Document will be created after batch succeeds (ID: ${documentId})`,
      );
    }

    this.logger.log(`Ingesting markdown: ${mergedMetadata.title}`);

    try {
      let chunks: { content: string; pageNumber: number }[] = [];
      let parentChunks: { content: string; pageNumber: number }[] = [];

      if (useSemanticChunking) {
        try {
          const pages = this.splitByPages(body);
          const result = await this.semanticChunk(pages, { dryRun });
          chunks = result.chunks;
          parentChunks = result.parentChunks;
        } catch (error) {
          this.logger.warn(
            `Semantic chunking failed: ${error.message}. Falling back to naive chunking.`,
          );
          const pages = this.splitByPages(body);
          chunks = this.chunkText(pages);
          for (let i = 0; i < chunks.length; i += this.chunksPerParent) {
            const batch = chunks.slice(i, i + this.chunksPerParent);
            parentChunks.push({
              content: batch.map((c) => c.content).join(' '),
              pageNumber: batch[0].pageNumber,
            });
          }
        }
      } else {
        const pages = this.splitByPages(body);
        chunks = this.chunkText(pages);
        for (let i = 0; i < chunks.length; i += this.chunksPerParent) {
          const batch = chunks.slice(i, i + this.chunksPerParent);
          parentChunks.push({
            content: batch.map((c) => c.content).join(' '),
            pageNumber: batch[0].pageNumber,
          });
        }
      }

      if (manualChunks.length > 0) {
        this.logger.log(`Adding ${manualChunks.length} manual chunks`);
        chunks = [...chunks, ...manualChunks];
        manualChunks.forEach((mc) => {
          parentChunks.push({
            content: mc.content,
            pageNumber: mc.pageNumber,
          });
        });
      }

      this.logger.log(
        `Generated ${chunks.length} chunks (and ${parentChunks.length} parents) for ${mergedMetadata.title}`,
      );

      const counts = { NARRATIVE: 0, INDEX: 0, TOC: 0, REFERENCES: 0 };
      for (const chunk of chunks) {
        const type = this.detectChunkType(chunk.content);
        counts[type]++;
      }
      this.logger.log(
        `Classification: ${counts.NARRATIVE} Narrative, ${counts.INDEX} Index, ${counts.TOC} TOC, ${counts.REFERENCES} Refs`,
      );

      // DEBUG: Log sample chunks to verify quality
      if (chunks.length > 0) {
        this.logger.log('--- SAMPLE CHUNKS (Top 5) ---');
        chunks.slice(0, 5).forEach((c, i) => {
          this.logger.log(
            `Chunk ${i + 1} (Page ${c.pageNumber}, ~${c.content.split(/\s+/).length} words):\n"${c.content.substring(0, 150).replace(/\n/g, ' ')}..."`,
          );
        });
      }

      if (parentChunks.length > 0) {
        this.logger.log('--- SAMPLE PARENTS (Top 5) ---');
        parentChunks.slice(0, 5).forEach((p, i) => {
          this.logger.log(
            `Parent ${i + 1} (Page ${p.pageNumber}, ~${p.content.split(/\s+/).length} words):\n"${p.content.substring(0, 150).replace(/\n/g, ' ')}..."`,
          );
        });
      }
      this.logger.log('-----------------------------');

      if (useBatchApi) {
        this.logger.log(
          `Preparing ${chunks.length + parentChunks.length} total chunks for Voyage Batch API...`,
        );

        const batchInputs: { id: string; text: string }[] = [];
        const parentChunkData: {
          id: string;
          content: string;
          pageNumber: number;
          chunkType: ChunkType;
          sectionType?: string;
        }[] = [];
        const childChunkData: {
          content: string;
          pageNumber: number;
          parentIndex: number;
          chunkType: ChunkType;
          sectionType?: string;
        }[] = [];

        // Prepare parent chunks with IDs
        for (const chunk of parentChunks) {
          const id = randomUUID();
          const chunkType = this.detectChunkType(chunk.content);
          const sectionType = this.getSectionType(
            chunk.content,
            sectionMatches,
          );
          parentChunkData.push({
            id,
            content: chunk.content,
            pageNumber: chunk.pageNumber,
            chunkType,
            sectionType: sectionType || undefined,
          });
          batchInputs.push({ id, text: chunk.content });
        }

        // Prepare child chunks with parent references
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const id = randomUUID();

          let parentIndex: number | null = null;
          if (parentChunks.length > 0) {
            parentIndex = Math.floor(i / this.chunksPerParent);
            if (parentIndex >= parentChunkData.length) {
              parentIndex = null;
            }
          }

          const chunkType = this.detectChunkType(chunk.content);
          const sectionType = this.getSectionType(
            chunk.content,
            sectionMatches,
          );

          childChunkData.push({
            content: chunk.content,
            pageNumber: chunk.pageNumber,
            parentIndex: parentIndex !== null ? parentIndex : -1,
            chunkType,
            sectionType: sectionType || undefined,
          });
          batchInputs.push({ id, text: chunk.content });
        }

        if (dryRun) {
          this.logger.log(
            `[DRY RUN] Simulating batch job submission for ${batchInputs.length} inputs...`,
          );

          // LOGGING LOGIC START
          const logData = {
            document: metadata.title,
            timestamp: new Date().toISOString(),
            mode: 'batch',
            config: { useSemanticChunking, useBatchApi },
            stats: {
              totalChunks: chunks.length,
              parentChunks: parentChunks.length,
              totalBatchInputs: batchInputs.length,
            },
            chunks: chunks.map((c) => ({
              ...c,
              length: c.content.length,
              preview: c.content.substring(0, 50),
            })),
            parentChunks: parentChunks.map((p) => ({
              ...p,
              length: p.content.length,
              preview: p.content.substring(0, 50),
            })),
            voyagePayload: batchInputs,
          };

          const logDir = path.resolve(process.cwd(), 'data/logs/ingestion');
          if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
          }

          const sanitizedTitle = metadata.title
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase();
          const logFile = path.join(
            logDir,
            `${sanitizedTitle}_batch_dry_run_${Date.now()}.json`,
          );

          fs.writeFileSync(logFile, JSON.stringify(logData, null, 2));
          this.logger.log(
            `[DRY RUN] Detailed ingestion log written to: ${logFile}`,
          );
          // LOGGING LOGIC END

          // Also generate the JSONL file that would be uploaded
          const jsonlDir = path.resolve(process.cwd(), 'data/batches/payloads');
          if (!fs.existsSync(jsonlDir)) {
            fs.mkdirSync(jsonlDir, { recursive: true });
          }
          const jsonlFile = path.join(
            jsonlDir,
            `${sanitizedTitle}_batch_payload_${Date.now()}.jsonl`,
          );
          const jsonlContent = batchInputs
            .map((item) => JSON.stringify(item))
            .join('\n');
          fs.writeFileSync(jsonlFile, jsonlContent, 'utf-8');
          this.logger.log(
            `[DRY RUN] Batch payload (JSONL) written to: ${jsonlFile}`,
          );

          this.logger.log(`[DRY RUN] Would submit batch job to Voyage API`);
          this.logger.log(`[DRY RUN] Would track job in batches/jobs.json`);
          return { id: documentId, staged: true };
        }

        // Create staging file with all data needed for later commit
        const stagingDir = path.resolve(process.cwd(), 'data/batches/staging');
        if (!fs.existsSync(stagingDir)) {
          fs.mkdirSync(stagingDir, { recursive: true });
        }

        const sanitizedTitle = metadata.title
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase();
        const stagingFileName = `${sanitizedTitle}_${Date.now()}.json`;
        const stagingFilePath = path.join(stagingDir, stagingFileName);

        const stagingData = {
          metadata,
          sourceFilePath: filePath,
          parentChunks: parentChunkData,
          childChunks: childChunkData,
          batchInputs,
          chunksPerParent: this.chunksPerParent,
          timestamp: new Date().toISOString(),
        };

        fs.writeFileSync(stagingFilePath, JSON.stringify(stagingData, null, 2));
        this.logger.log(`Staging data written to: ${stagingFilePath}`);

        const batchId = await this.voyageEmbeddingService.createBatchJob(
          batchInputs,
          {
            inputType: 'document',
          },
        );

        this.logger.log(
          `Batch job submitted successfully. Batch ID: ${batchId}`,
        );

        const batchJobData = {
          batchId,
          bookTitle: metadata.title,
          status: 'pending',
          chunkCount: batchInputs.length,
          timestamp: new Date().toISOString(),
          stagingFilePath,
        };

        const batchJobsFile = path.resolve(
          process.cwd(),
          'data/batches/jobs.json',
        );
        let batchJobs: any[] = [];

        const batchJobsFileDir = path.dirname(batchJobsFile);
        if (!fs.existsSync(batchJobsFileDir)) {
          fs.mkdirSync(batchJobsFileDir, { recursive: true });
        }

        if (fs.existsSync(batchJobsFile)) {
          try {
            batchJobs = JSON.parse(fs.readFileSync(batchJobsFile, 'utf-8'));
          } catch {
            this.logger.warn(
              'Failed to parse existing batches/jobs.json, creating new one',
            );
          }
        }

        batchJobs.push(batchJobData);
        fs.writeFileSync(batchJobsFile, JSON.stringify(batchJobs, null, 2));

        this.logger.log(`Batch job tracked in ${batchJobsFile}`);
        this.logger.log(
          `⚠️  Book will be committed to DB only after batch succeeds`,
        );
        return { id: documentId, staged: true, stagingFilePath };
      }

      if (dryRun) {
        const logData = {
          document: metadata.title,
          timestamp: new Date().toISOString(),
          mode: 'real-time',
          config: { useSemanticChunking, useBatchApi },
          stats: {
            totalChunks: chunks.length,
            parentChunks: parentChunks.length,
          },
          chunks: chunks.map((c) => ({
            ...c,
            length: c.content.length,
            preview: c.content.substring(0, 50),
          })),
          parentChunks: parentChunks.map((p) => ({
            ...p,
            length: p.content.length,
            preview: p.content.substring(0, 50),
          })),
          voyagePayload: {
            parentTexts: parentChunks.map((p) => p.content),
            chunkTexts: chunks.map((c) => c.content),
          },
        };

        const logDir = path.resolve(process.cwd(), 'data/logs/ingestion');
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }

        const sanitizedTitle = metadata.title
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase();
        const logFile = path.join(
          logDir,
          `${sanitizedTitle}_realtime_dry_run_${Date.now()}.json`,
        );

        fs.writeFileSync(logFile, JSON.stringify(logData, null, 2));
        this.logger.log(
          `[DRY RUN] Detailed ingestion log written to: ${logFile}`,
        );
      }

      const parentIds: string[] = [];

      if (parentChunks.length > 0) {
        this.logger.log(
          `Generating embeddings for ${parentChunks.length} parent chunks in batches...`,
        );

        const parentTexts = parentChunks.map((p) => p.content);
        const parentEmbeddings =
          await this.voyageEmbeddingService.generateDocumentEmbeddingsBatch(
            parentTexts,
            dryRun,
          );

        this.logger.log(
          `Inserting ${parentChunks.length} parent chunks into database...`,
        );

        for (let i = 0; i < parentChunks.length; i++) {
          const content = parentChunks[i];
          const vector = parentEmbeddings[i];
          const vectorString = `[${vector.join(',')}]`;
          const parentId = randomUUID();
          parentIds.push(parentId);

          const chunkType = this.detectChunkType(content.content);
          const sectionType = this.getSectionType(
            content.content,
            sectionMatches,
          );

          if (!dryRun) {
            await (this.prisma as any).$executeRaw`
            INSERT INTO embeddings (id, content, "pageNumber", "documentId", vector, "parentContent", "chunkType", "sectionType")
            VALUES (${parentId}::uuid, ${content.content}, ${content.pageNumber}, ${documentId}::uuid, ${vectorString}::vector, ${content.content}, ${chunkType}::"ChunkType", ${sectionType})
          `;
          }

          if ((i + 1) % 10 === 0 || i === parentChunks.length - 1) {
            this.logger.log(
              `Inserted ${i + 1}/${parentChunks.length} parent chunks`,
            );
          }
        }
        this.logger.log(`Inserted ${parentChunks.length} parent chunks`);
      }

      this.logger.log(
        `Generating embeddings for ${chunks.length} child chunks in batches...`,
      );

      const chunkTexts = chunks.map((c) => c.content);
      const chunkEmbeddings =
        await this.voyageEmbeddingService.generateDocumentEmbeddingsBatch(
          chunkTexts,
          dryRun,
        );

      this.logger.log(
        `Inserting ${chunks.length} child chunks into database...`,
      );

      for (let i = 0; i < chunks.length; i++) {
        const content = chunks[i];
        const vector = chunkEmbeddings[i];
        const vectorString = `[${vector.join(',')}]`;

        let parentId: string | null = null;
        let parentContent: string | null = null;

        if (parentChunks.length > 0) {
          const parentIndex = Math.floor(i / this.chunksPerParent);
          if (parentIndex < parentIds.length) {
            parentId = parentIds[parentIndex];
            parentContent = parentChunks[parentIndex].content;
          }
        }

        const chunkType = this.detectChunkType(content.content);
        const sectionType = this.getSectionType(
          content.content,
          sectionMatches,
        );

        if (!dryRun) {
          await (this.prisma as any).$executeRaw`
              INSERT INTO embeddings (id, content, "pageNumber", "documentId", vector, "parentId", "parentContent", "chunkType", "sectionType")
              VALUES (gen_random_uuid(), ${content.content}, ${content.pageNumber}, ${documentId}::uuid, ${vectorString}::vector, ${parentId}::uuid, ${parentContent}, ${chunkType}::"ChunkType", ${sectionType})
            `;
        }

        if ((i + 1) % 50 === 0 || i === chunks.length - 1) {
          this.logger.log(
            `Inserted ${i + 1}/${chunks.length} chunks for ${metadata.title}`,
          );
        }
      }
      this.logger.log(`Successfully ingested ${metadata.title}`);
      return { id: documentId };
    } catch (error) {
      this.logger.error(
        `Failed to ingest chunks for ${metadata.title}. Cleaning up partial data...`,
      );
      if (!dryRun && existingDoc === null) {
        // Only delete if we created it
        await (this.prisma as any).document.delete({
          where: { id: documentId },
        });
      }
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

    // Deduplicate by parentId to avoid redundant nearby chunks
    const seenParents = new Set<string>();
    results = results.filter((r) => {
      const pId = r.parentId || r.id;
      if (seenParents.has(pId)) return false;
      seenParents.add(pId);
      return true;
    });

    // If no reranking, still add fullContext for consistency
    const finalizedResults = results.slice(0, limit).map((r) => ({
      ...r,
      fullContext: r.parentContent || r.content,
    }));

    // Apply Cross-Encoder Reranking
    const reranked = await this.rerank(query, finalizedResults, limit);
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
        const parentContent = originalDoc.parentContent || originalDoc.content;
        return {
          ...originalDoc,
          rerankScore: r.relevanceScore,
          // Store parent content separately so the UI can show the specific match
          // but the AI can still use the full context.
          content: parentContent,
          fullContext: parentContent,
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
    const vector =
      await this.voyageEmbeddingService.generateQueryEmbedding(query);
    const vectorString = `[${vector.join(',')}]`;

    // Base query parts
    let whereClause = Prisma.sql``;

    if (filters?.documentIds?.length) {
      whereClause = Prisma.sql`${whereClause} AND e."documentId" = ANY(${filters.documentIds}::uuid[])`;
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
        e."parentId",
        e."parentContent",
        e."pageNumber", 
        e."sectionType",
        d.title as "documentTitle",
        d.author as "documentAuthor",
        d."filePath" as "documentFilePath",
        d.metadata as "documentMetadata",
        d.archetype as "documentArchetype",
        (1 - (e.vector <=> ${vectorString}::vector)) * (
          CASE 
            WHEN d.archetype = 'PRACTICAL'::"Archetype" THEN 1.2
            WHEN d.archetype = 'CASE_STUDY'::"Archetype" THEN 1.1
            ELSE 1.0
          END
        ) as similarity
      FROM embeddings e
      JOIN documents d ON e."documentId" = d.id
      WHERE e."parentId" IS NOT NULL 
      AND e."chunkType" = 'NARRATIVE'::"ChunkType"
      ${whereClause}
      ORDER BY similarity DESC
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
      whereClause = Prisma.sql`${whereClause} AND e."documentId" = ANY(${filters.documentIds}::uuid[])`;
    }

    if (filters?.minYear) {
      whereClause = Prisma.sql`${whereClause} AND (d.metadata->>'year')::int >= ${filters.minYear}`;
    }

    if (filters?.volume) {
      whereClause = Prisma.sql`${whereClause} AND d.metadata->>'volume' = ${filters.volume}`;
    }

    // Using simple config for BM25 to avoid language-specific stemming issues in medical terms
    // and better support cross-lingual exact matches where possible.
    const results: any[] = await (this.prisma as any).$queryRaw`
      SELECT 
        e.id,
        e.content,
        e."parentId",
        e."parentContent",
        e."pageNumber",
        e."sectionType",
        d.title as "documentTitle",
        d.author as "documentAuthor",
        d."filePath" as "documentFilePath",
        d.metadata as "documentMetadata",
        d.archetype as "documentArchetype",
        ts_rank(to_tsvector('simple', e.content), plainto_tsquery('simple', ${query})) * (
          CASE 
            WHEN d.archetype = 'PRACTICAL'::"Archetype" THEN 1.2
            WHEN d.archetype = 'CASE_STUDY'::"Archetype" THEN 1.1
            ELSE 1.0
          END
        ) as "bm25Score"
      FROM embeddings e
      JOIN documents d ON e."documentId" = d.id
      WHERE e."parentId" IS NOT NULL 
      AND e."chunkType" = 'NARRATIVE'::"ChunkType"
      AND to_tsvector('simple', e.content) @@ plainto_tsquery('simple', ${query})
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

  private getSectionType(
    content: string,
    sections: { type: string; content: string }[],
  ): string | null {
    for (const section of sections) {
      if (section.content.includes(content)) {
        return section.type;
      }
    }
    return null;
  }

  private detectChunkType(content: string): ChunkType {
    if (!content) return ChunkType.NARRATIVE;
    const lines = content.split('\n').map((l) => l.trim());
    const firstLines = lines.slice(0, 5).join(' ').toLowerCase();

    // 1. Header/Title based detection
    if (
      firstLines.includes('contents') ||
      firstLines.includes('contenido') ||
      firstLines.includes('table of contents') ||
      /##\s+(índice|indice)(\s+de)?/i.test(firstLines)
    ) {
      return ChunkType.TOC;
    }

    if (
      firstLines.includes('index') ||
      firstLines.includes('índice alfabético') ||
      firstLines.includes('indice alfabetico') ||
      firstLines.includes('index of subjects')
    ) {
      return ChunkType.INDEX;
    }

    if (
      firstLines.includes('references') ||
      firstLines.includes('bibliography') ||
      firstLines.includes('bibliografía') ||
      firstLines.includes('bibliografia') ||
      firstLines.includes('literatura citada')
    ) {
      return ChunkType.REFERENCES;
    }

    // 2. Metrics calculation
    const textOnly = content.replace(/[#*|]/g, '');
    const words = textOnly.toLowerCase().match(/\b\w+\b/g) || [];

    const anatomyKeywords = [
      'action:',
      'origin:',
      'insertion:',
      'nerve:',
      'innervation:',
      'reflex:',
      'testing:',
    ];
    let anatomyScore = 0;
    for (const kw of anatomyKeywords) {
      if (content.toLowerCase().includes(kw)) anatomyScore++;
    }
    if (anatomyScore >= 2) return ChunkType.NARRATIVE;

    if (words.length < 15 && !content.includes('|')) return ChunkType.NARRATIVE;

    const enStopwords = new Set([
      'the',
      'and',
      'for',
      'with',
      'was',
      'were',
      'from',
      'that',
      'this',
      'these',
      'those',
      'but',
      'not',
      'are',
      'is',
      'of',
      'in',
      'on',
      'at',
      'by',
      'an',
      'as',
      'be',
      'to',
    ]);
    const esStopwords = new Set([
      'el',
      'la',
      'los',
      'las',
      'un',
      'una',
      'y',
      'en',
      'de',
      'con',
      'para',
      'por',
      'que',
      'este',
      'esta',
      'estos',
      'estas',
      'pero',
      'no',
      'son',
      'es',
      'al',
      'del',
      'su',
      'o',
    ]);

    let stopwordCount = 0;
    for (const w of words) {
      if (enStopwords.has(w) || esStopwords.has(w)) stopwordCount++;
    }
    const stopwordDensity = words.length > 0 ? stopwordCount / words.length : 0;

    const digitCount = content.replace(/\D/g, '').length;
    const digitDensity = digitCount / content.length;

    const pipeCount = (content.match(/\|/g) || []).length;
    const pipeDensity = pipeCount / content.length;

    const seeAlsoCount = (
      content.match(/see also|véase también|vid\.|cfr\./gi) || []
    ).length;

    const indexPattern = /\b[a-z]{3,},\s*\d+[a-z]?\b/gi;
    const indexMatches = (content.match(indexPattern) || []).length;
    const indexDensity = words.length > 0 ? indexMatches / words.length : 0;

    const isHighPipeDensity = pipeDensity > 0.02;
    const isNumberList = digitDensity > 0.08 && stopwordDensity < 0.2;
    const isNonNarrativeList = stopwordDensity < 0.15 && words.length > 20;
    const isSeeAlsoIndex = seeAlsoCount >= 1 && stopwordDensity < 0.25;
    const isIndexPattern = indexDensity > 0.1;

    if (
      isHighPipeDensity ||
      isNumberList ||
      isNonNarrativeList ||
      isSeeAlsoIndex ||
      isIndexPattern
    ) {
      return ChunkType.INDEX;
    }

    // References
    const referenceKeywords = [
      'pp.',
      'vol.',
      'ed.',
      'journal',
      'university',
      'press',
      'inc.',
      'wilkins',
      'saunders',
      'elsevier',
      'springer',
      'medicina',
      'clinical',
      'et al',
      'doi:',
    ];
    let refMatchCount = 0;
    for (const kw of referenceKeywords) {
      if (content.toLowerCase().includes(kw)) refMatchCount++;
    }

    // Increased stopword density limit from 0.12 to 0.25 (titles have stopwords).
    const isReferenceStyle =
      stopwordDensity < 0.25 &&
      (refMatchCount >= 2 || /19\d{2}|20\d{2}/.test(content));

    if (isReferenceStyle) {
      return ChunkType.REFERENCES;
    }

    return ChunkType.NARRATIVE;
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
    textOrPages: string | { pageNumber: number; content: string }[],
    options: {
      similarityThreshold?: number;
      targetChunkSize?: number;
      maxChunkSize?: number;
      dryRun?: boolean;
    } = {},
  ): Promise<{
    chunks: { content: string; pageNumber: number }[];
    parentChunks: { content: string; pageNumber: number }[];
  }> {
    const {
      similarityThreshold = 0.85,
      targetChunkSize = 400,
      maxChunkSize = 512,
      dryRun = false,
    } = options;

    // Normalize input to Page[]
    const pages =
      typeof textOrPages === 'string'
        ? [{ pageNumber: 1, content: textOrPages }]
        : textOrPages;

    const refinedSentences: {
      text: string;
      isParagraphStart: boolean;
      pageNumber: number;
    }[] = [];

    // 1. Split text into paragraphs respecting page boundaries
    for (const page of pages) {
      const paragraphs = page.content.split(/\n\n+/);

      for (const para of paragraphs) {
        const paraSentences = para.match(/(?<=[.!?])\s+/g)
          ? para.split(/(?<=[.!?])\s+/)
          : [para];

        paraSentences.forEach((s, i) => {
          if (s.trim().length > 0) {
            refinedSentences.push({
              text: s.trim(),
              isParagraphStart: i === 0,
              pageNumber: page.pageNumber,
            });
          }
        });
      }
    }

    if (refinedSentences.length === 0) {
      return { chunks: [], parentChunks: [] };
    }

    const sentenceTexts = refinedSentences.map((s) => s.text);
    const embeddings =
      await this.voyageEmbeddingService.generateDocumentEmbeddingsBatch(
        sentenceTexts,
        dryRun,
      );

    // 3. Group sentences into chunks
    const chunks: { content: string; pageNumber: number }[] = [];
    let currentChunkSentences: string[] = [];
    let currentChunkTokens = 0;
    let currentChunkStartPage = refinedSentences[0].pageNumber;

    for (let i = 0; i < refinedSentences.length; i++) {
      const sentence = refinedSentences[i];
      const sentenceEmbedding = embeddings[i];
      const sentenceTokens = sentence.text.split(/\s+/).length; // Approximation

      if (currentChunkSentences.length === 0) {
        currentChunkSentences.push(sentence.text);
        currentChunkTokens += sentenceTokens;
        currentChunkStartPage = sentence.pageNumber;
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

      // Page boundary check: If sentence is on a new page, consider breaking
      // But we allow semantic chunks to cross pages if meaning is continuous
      // We will assign page number based on the START of the chunk

      // Decision to start new chunk
      if (
        isParagraphStart ||
        (currentChunkTokens >= targetChunkSize && isSimilarityDrop) ||
        isMaxChunkSizeExceeded
      ) {
        chunks.push({
          content: currentChunkSentences.join(' '),
          pageNumber: currentChunkStartPage,
        });
        currentChunkSentences = [sentence.text];
        currentChunkTokens = sentenceTokens;
        currentChunkStartPage = sentence.pageNumber;
      } else {
        currentChunkSentences.push(sentence.text);
        currentChunkTokens += sentenceTokens;
      }
    }

    if (currentChunkSentences.length > 0) {
      chunks.push({
        content: currentChunkSentences.join(' '),
        pageNumber: currentChunkStartPage,
      });
    }

    // 4. Create parent chunks
    // Combine 4-5 regular chunks
    const parentChunks: { content: string; pageNumber: number }[] = [];

    for (let i = 0; i < chunks.length; i += this.chunksPerParent) {
      const batch = chunks.slice(i, i + this.chunksPerParent);
      const parentChunk = batch.map((c) => c.content).join(' ');
      parentChunks.push({
        content: parentChunk,
        pageNumber: batch[0].pageNumber,
      });
    }

    return { chunks, parentChunks };
  }

  private splitByPages(
    text: string,
  ): { pageNumber: number; content: string }[] {
    const pages: { pageNumber: number; content: string }[] = [];
    const pageRegex = /<!-- PAGE_NUMBER: (\d+) -->/g;
    let match;

    // Handle content before the first page marker (if any)
    // Usually metadata or frontmatter, treat as page 0 or 1
    match = pageRegex.exec(text);
    if (match && match.index > 0) {
      const preContent = text.substring(0, match.index).trim();
      if (preContent) {
        pages.push({ pageNumber: 1, content: preContent });
      }
    }

    // Reset regex to start
    pageRegex.lastIndex = 0;

    while ((match = pageRegex.exec(text)) !== null) {
      const pageNumber = parseInt(match[1], 10);
      const startIndex = match.index + match[0].length;

      // Look ahead for next page marker
      const nextMatch = /<!-- PAGE_NUMBER: (\d+) -->/g.exec(
        text.slice(startIndex),
      );
      const endIndex = nextMatch ? startIndex + nextMatch.index : text.length;

      const content = text.substring(startIndex, endIndex).trim();
      if (content) {
        pages.push({ pageNumber, content });
      }

      // Adjust lastIndex to avoid infinite loop if regex is sticky/global
      if (match.index === pageRegex.lastIndex) {
        pageRegex.lastIndex++;
      }
    }

    // If no page markers found, return whole text as page 1
    if (pages.length === 0) {
      pages.push({ pageNumber: 1, content: text });
    }

    return pages;
  }

  private chunkText(
    textOrPages: string | { pageNumber: number; content: string }[],
    wordsPerChunk: number = 500,
    overlap: number = 50,
  ): { content: string; pageNumber: number }[] {
    const chunks: { content: string; pageNumber: number }[] = [];

    // Normalize input to Page[]
    const pages =
      typeof textOrPages === 'string'
        ? [{ pageNumber: 1, content: textOrPages }]
        : textOrPages;

    for (const page of pages) {
      const words = page.content.split(/\s+/).filter((w) => w.length > 0);
      if (words.length === 0) continue;

      for (let i = 0; i < words.length; i += wordsPerChunk - overlap) {
        const chunkContent = words.slice(i, i + wordsPerChunk).join(' ');
        chunks.push({
          content: chunkContent,
          pageNumber: page.pageNumber,
        });

        if (i + wordsPerChunk >= words.length) break;
      }
    }

    return chunks;
  }
}
