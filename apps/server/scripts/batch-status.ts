import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../src/prisma/prisma.service';

// Load env
const envPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

import voyageConfig from '../src/config/voyage.config';
import { VoyageEmbeddingService } from '../src/modules/knowledge-base/services/voyage-embedding.service';

interface StagingData {
  metadata: {
    title: string;
    author: string;
    volume?: string;
    edition?: string;
    year?: string;
  };
  sourceFilePath: string;
  parentChunks: {
    id: string;
    content: string;
    pageNumber: number;
    chunkType?: string;
    sectionType?: string;
  }[];
  childChunks: {
    content: string;
    pageNumber: number;
    parentIndex: number;
    chunkType?: string;
    sectionType?: string;
  }[];
  batchInputs: { id: string; text: string }[];
  chunksPerParent: number;
  timestamp: string;
}

async function downloadErrorFileContent(
  fileId: string,
  apiKey: string,
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.voyageai.com/v1/files/${fileId}/content`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    return await response.text();
  } catch {
    return null;
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envPath,
      load: [voyageConfig],
    }),
  ],
  providers: [VoyageEmbeddingService, PrismaService],
})
class BatchStatusAppModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(BatchStatusAppModule);
  const voyageService = app.get(VoyageEmbeddingService);
  const prisma = app.get(PrismaService);
  const logger = new Logger('BatchStatus');

  const batchJobsFile = path.resolve(__dirname, '../data/batches/jobs.json');

  if (!fs.existsSync(batchJobsFile)) {
    logger.log('No batch jobs file found. No pending jobs.');
    await app.close();
    return;
  }

  const batchJobs = JSON.parse(fs.readFileSync(batchJobsFile, 'utf-8'));
  const pendingJobs = batchJobs.filter((job: any) => job.status === 'pending');

  if (pendingJobs.length === 0) {
    logger.log('No pending batch jobs found.');
    await app.close();
    return;
  }

  logger.log(`Found ${pendingJobs.length} pending batch jobs.`);

  const serverDir = path.resolve(__dirname, '..');
  const booksDir = path.join(serverDir, 'data/library/markdowns');

  if (!fs.existsSync(booksDir)) {
    fs.mkdirSync(booksDir, { recursive: true });
  }

  for (const job of pendingJobs) {
    logger.log(
      `Checking status for batch ${job.batchId} (${job.bookTitle})...`,
    );

    try {
      const batchStatus = await voyageService.getBatchJob(job.batchId);
      logger.log(`Status: ${batchStatus.status}`);

      if (batchStatus.status === 'completed') {
        logger.log('Batch completed! Processing results...');

        const totalRequests = batchStatus.request_counts?.total || 0;
        const completedRequests = batchStatus.request_counts?.completed || 0;
        const failedRequests = batchStatus.request_counts?.failed || 0;

        logger.log(
          `Request counts: ${completedRequests} completed, ${failedRequests} failed (of ${totalRequests} total)`,
        );

        if (completedRequests === 0 && failedRequests > 0) {
          logger.error('All requests in the batch failed.');

          if (batchStatus.error_file_id) {
            logger.log(`Error file ID: ${batchStatus.error_file_id}`);
            logger.log('Downloading error file for details...');

            const configService = app.get(ConfigService);
            const apiKey = configService.get<string>('VOYAGE_API_KEY') || '';
            const rawContent = await downloadErrorFileContent(
              batchStatus.error_file_id,
              apiKey,
            );

            if (rawContent) {
              logger.log('--- Raw error file content (first 2000 chars) ---');
              logger.log(rawContent.substring(0, 2000));
              if (rawContent.length > 2000) {
                logger.log(`... (${rawContent.length - 2000} more characters)`);
              }
              logger.log('--- End of error file content ---');
            }

            try {
              const errorResults = await voyageService[
                'downloadAndParseResults'
              ](batchStatus.error_file_id);

              if (errorResults.errors && errorResults.errors.size > 0) {
                logger.error(
                  `Found ${errorResults.errors.size} errors in error file:`,
                );
                let errorCount = 0;
                errorResults.errors.forEach((msg: string, id: string) => {
                  if (errorCount < 5) {
                    logger.error(`  - Request ${id}: ${msg.substring(0, 200)}`);
                    errorCount++;
                  }
                });
                if (errorResults.errors.size > 5) {
                  logger.error(
                    `  ... and ${errorResults.errors.size - 5} more errors`,
                  );
                }
              } else {
                logger.warn(
                  'Error file downloaded but no errors parsed - file may be empty or in unexpected format',
                );
              }
            } catch (err: any) {
              logger.error(`Failed to download error file: ${err.message}`);
            }
          }

          if (job.stagingFilePath && fs.existsSync(job.stagingFilePath)) {
            fs.unlinkSync(job.stagingFilePath);
            logger.log(`Cleaned up staging file: ${job.stagingFilePath}`);
          }

          logger.log('Book remains in data/library/temporal/ for retry');
          logger.log(
            'The JSON format issue has been fixed - please re-run ingestion',
          );

          job.status = 'failed';
          job.failedAt = new Date().toISOString();
          job.error = `All ${failedRequests} requests failed`;
          fs.writeFileSync(batchJobsFile, JSON.stringify(batchJobs, null, 2));
          continue;
        }

        if (!batchStatus.output_file_id) {
          logger.error('Full batch status response:');
          logger.error(JSON.stringify(batchStatus, null, 2));
          throw new Error('Batch completed but no output file ID');
        }

        const results = await voyageService['downloadAndParseResults'](
          batchStatus.output_file_id,
        );

        logger.log(
          `Downloaded ${results.embeddings.size} embeddings. Committing to database...`,
        );

        let successCount = 0;
        let errorCount = 0;

        if (job.stagingFilePath && fs.existsSync(job.stagingFilePath)) {
          const stagingData: StagingData = JSON.parse(
            fs.readFileSync(job.stagingFilePath, 'utf-8'),
          );

          const { metadata, sourceFilePath, parentChunks, childChunks } =
            stagingData;

          const fileName = path.basename(sourceFilePath);
          const booksFilePath = path.join(booksDir, fileName);

          const markdownsFilePath = path.join(serverDir, sourceFilePath);
          if (!fs.existsSync(markdownsFilePath)) {
            logger.error(
              `Source file not found: ${markdownsFilePath}. Cannot complete ingestion.`,
            );
            job.status = 'failed';
            job.failedAt = new Date().toISOString();
            job.error = 'Source file not found';
            fs.writeFileSync(batchJobsFile, JSON.stringify(batchJobs, null, 2));
            continue;
          }

          const document = await (prisma as any).document.create({
            data: {
              title: metadata.title,
              author: metadata.author,
              filePath: sourceFilePath,
              archetype: (metadata as any).archetype || 'GENERAL',
              metadata: metadata,
            },
          });
          logger.log(`Created document: ${document.id}`);

          for (const parent of parentChunks) {
            const embedding = results.embeddings.get(parent.id);
            if (embedding) {
              const vectorString = '[' + embedding.join(',') + ']';
              try {
                await (prisma as any).$executeRaw`
                  INSERT INTO embeddings (id, content, "pageNumber", "documentId", "parentContent", vector, "chunkType", "sectionType")
                  VALUES (${parent.id}::uuid, ${parent.content}, ${parent.pageNumber}, ${document.id}::uuid, ${parent.content}, ${vectorString}::vector, ${parent.chunkType || 'NARRATIVE'}::"ChunkType", ${parent.sectionType || null})
                `;
                successCount++;
              } catch (err: any) {
                logger.error(
                  'Failed to insert parent ' + parent.id + ': ' + err.message,
                );
                errorCount++;
              }
            } else {
              logger.warn('No embedding found for parent ' + parent.id);
              errorCount++;
            }
          }

          for (let i = 0; i < childChunks.length; i++) {
            const child = childChunks[i];
            const batchInput = stagingData.batchInputs[parentChunks.length + i];
            const embedding = results.embeddings.get(batchInput.id);

            if (embedding) {
              const vectorString = '[' + embedding.join(',') + ']';
              let parentId: string | null = null;
              let parentContent: string | null = null;

              if (
                child.parentIndex >= 0 &&
                child.parentIndex < parentChunks.length
              ) {
                parentId = parentChunks[child.parentIndex].id;
                parentContent = parentChunks[child.parentIndex].content;
              }

              try {
                await (prisma as any).$executeRaw`
                  INSERT INTO embeddings (id, content, "pageNumber", "documentId", vector, "parentId", "parentContent", "chunkType", "sectionType")
                  VALUES (gen_random_uuid(), ${child.content}, ${child.pageNumber}, ${document.id}::uuid, ${vectorString}::vector, ${parentId}::uuid, ${parentContent}, ${child.chunkType || 'NARRATIVE'}::"ChunkType", ${child.sectionType || null})
                `;
                successCount++;
              } catch (err: any) {
                logger.error('Failed to insert child chunk: ' + err.message);
                errorCount++;
              }
            } else {
              logger.warn('No embedding found for child chunk ' + i);
              errorCount++;
            }
          }

          fs.renameSync(markdownsFilePath, booksFilePath);
          logger.log('Moved file to: ' + booksFilePath);

          await (prisma as any).document.update({
            where: { id: document.id },
            data: { filePath: 'data/library/markdowns/' + fileName },
          });
          logger.log('Updated document filePath in database');

          if (errorCount === 0) {
            fs.unlinkSync(job.stagingFilePath);
            logger.log('Cleaned up staging file: ' + job.stagingFilePath);
          } else {
            logger.warn(
              'Keeping staging file due to ' + errorCount + ' errors',
            );
          }

          job.documentId = document.id;
        } else {
          logger.warn('No staging file found. This may be a legacy batch job.');

          for (const [id, embedding] of results.embeddings.entries()) {
            const vectorString = '[' + embedding.join(',') + ']';
            try {
              await (prisma as any).$executeRaw`
                UPDATE embeddings 
                SET vector = ${vectorString}::vector 
                WHERE id = ${id}::uuid
              `;
              successCount++;
            } catch (err: any) {
              logger.error(
                'Failed to update vector for ID ' + id + ': ' + err.message,
              );
              errorCount++;
            }
          }
        }

        logger.log(
          'Database commit complete. Success: ' +
            successCount +
            ', Errors: ' +
            errorCount,
        );

        if (successCount > 0 || (successCount === 0 && errorCount === 0)) {
          job.status = 'completed';
          job.completedAt = new Date().toISOString();
        } else {
          job.status = 'failed';
          job.failedAt = new Date().toISOString();
          job.error = 'Database commit failed - see logs';
        }
        job.stats = {
          success: successCount,
          errors: errorCount + (results.errors?.size || 0),
        };
      } else if (
        batchStatus.status === 'failed' ||
        batchStatus.status === 'cancelled'
      ) {
        logger.error('Batch failed/cancelled.');

        if (batchStatus.errors) {
          logger.error(
            'Batch errors: ' + JSON.stringify(batchStatus.errors, null, 2),
          );
        }

        if (batchStatus.error_file_id) {
          logger.log(
            'Downloading error file ' +
              batchStatus.error_file_id +
              ' for details...',
          );
          try {
            const errorResults = await voyageService['downloadAndParseResults'](
              batchStatus.error_file_id,
            );
            if (errorResults.errors && errorResults.errors.size > 0) {
              logger.error('Detailed errors from file:');
              errorResults.errors.forEach((msg: string, id: string) => {
                logger.error('- ID ' + id + ': ' + msg);
              });
            }
          } catch (err: any) {
            logger.error('Failed to download error file: ' + err.message);
          }
        }

        if (job.stagingFilePath && fs.existsSync(job.stagingFilePath)) {
          fs.unlinkSync(job.stagingFilePath);
          logger.log('Cleaned up staging file: ' + job.stagingFilePath);
        }

        logger.log('Book remains in data/library/temporal/ for retry');

        job.status = batchStatus.status;
        job.failedAt = new Date().toISOString();
      }

      fs.writeFileSync(batchJobsFile, JSON.stringify(batchJobs, null, 2));
    } catch (error: any) {
      logger.error(
        'Error processing batch ' + job.batchId + ': ' + error.message,
      );
    }
  }

  await app.close();
}

bootstrap().catch(console.error);
