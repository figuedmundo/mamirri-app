import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../src/prisma/prisma.service';

// Load env
const envPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

import voyageConfig from '../src/config/voyage.config';
import { VoyageEmbeddingService } from '../src/modules/knowledge-base/services/voyage-embedding.service';

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

  const batchJobsFile = path.resolve(__dirname, '../data/batch-jobs.json');

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

  for (const job of pendingJobs) {
    logger.log(
      `Checking status for batch ${job.batchId} (${job.bookTitle})...`,
    );

    try {
      // Check status
      const batchStatus = await voyageService.getBatchJob(job.batchId);
      logger.log(`Status: ${batchStatus.status}`);

      if (batchStatus.status === 'completed') {
        logger.log('Batch completed! Downloading results...');

        if (!batchStatus.output_file_id) {
          throw new Error('Batch completed but no output file ID');
        }

        const results = await voyageService['downloadAndParseResults'](
          batchStatus.output_file_id,
        );

        logger.log(
          `Downloaded ${results.embeddings.size} embeddings. Updating database...`,
        );

        let successCount = 0;
        let errorCount = 0;

        const entries = Array.from(results.embeddings.entries());
        const BATCH_SIZE = 50;

        for (let i = 0; i < entries.length; i += BATCH_SIZE) {
          const chunk = entries.slice(i, i + BATCH_SIZE);

          await Promise.all(
            chunk.map(async ([id, embedding]) => {
              try {
                const vectorString = `[${embedding.join(',')}]`;
                await prisma.$executeRaw`
                UPDATE embeddings 
                SET vector = ${vectorString}::vector 
                WHERE id = ${id}::uuid
              `;
                successCount++;
              } catch (err) {
                logger.error(
                  `Failed to update vector for ID ${id}: ${err.message}`,
                );
                errorCount++;
              }
            }),
          );

          if ((i + BATCH_SIZE) % 500 === 0) {
            logger.log(
              `Updated ${i + BATCH_SIZE}/${entries.length} records...`,
            );
          }
        }

        logger.log(
          `Database update complete. Success: ${successCount}, Errors: ${errorCount}`,
        );

        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.stats = {
          success: successCount,
          errors: errorCount + (results.errors?.size || 0),
        };
      } else if (
        batchStatus.status === 'failed' ||
        batchStatus.status === 'cancelled'
      ) {
        logger.error(`Batch failed/cancelled. Check Voyage dashboard.`);
        job.status = batchStatus.status;
        job.failedAt = new Date().toISOString();
      }

      fs.writeFileSync(batchJobsFile, JSON.stringify(batchJobs, null, 2));
    } catch (error) {
      logger.error(`Error processing batch ${job.batchId}: ${error.message}`);
    }
  }

  await app.close();
}

bootstrap().catch(console.error);
