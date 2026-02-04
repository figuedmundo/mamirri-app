import { NestFactory } from '@nestjs/core';
import { KnowledgeBaseModule } from '../src/modules/knowledge-base/knowledge-base.module';
import { KnowledgeBaseService } from '../src/modules/knowledge-base/knowledge-base.service';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '../../../.env'),
    }),
    KnowledgeBaseModule,
  ],
})
class IngestionAppModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(IngestionAppModule);
  const knowledgeBaseService = app.get(KnowledgeBaseService);

  const booksDir = path.resolve(__dirname, '../data/books');
  if (!fs.existsSync(booksDir)) {
    console.log(`Creating books directory at ${booksDir}`);
    fs.mkdirSync(booksDir, { recursive: true });
  }

  const files = fs.readdirSync(booksDir).filter((f) => f.endsWith('.pdf'));
  console.log(`Found ${files.length} PDF files in ${booksDir}`);

  let successCount = 0;
  let failureCount = 0;

  for (const file of files) {
    const filePath = path.join('data/books', file);
    try {
      await knowledgeBaseService.ingestFile(filePath);
      successCount++;
    } catch (error) {
      console.error(`Failed to ingest ${file}:`, error.message);
      failureCount++;
    }
  }

  console.log('--- Ingestion Summary ---');
  console.log(`Total files: ${files.length}`);
  console.log(`Successfully processed: ${successCount}`);
  console.log(`Failed: ${failureCount}`);

  await app.close();
}

bootstrap().catch((err) => {
  console.error('Fatal error during ingestion:', err);
  process.exit(1);
});
