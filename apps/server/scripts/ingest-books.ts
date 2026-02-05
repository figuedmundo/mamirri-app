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

  const serverDir = path.resolve(__dirname, '..');
  const booksDir = path.join(serverDir, 'data/books');
  const archiveDir = path.join(serverDir, 'data/archive');

  if (!fs.existsSync(booksDir)) {
    console.log(`Creating books directory at ${booksDir}`);
    fs.mkdirSync(booksDir, { recursive: true });
  }

  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  const files = fs.readdirSync(booksDir).filter((f) => f.endsWith('.pdf'));
  console.log(`Found ${files.length} new PDF files in ${booksDir}`);

  let successCount = 0;
  let failureCount = 0;

  for (const file of files) {
    const relFilePath = `data/books/${file}`;
    const absFilePath = path.join(serverDir, relFilePath);

    try {
      await knowledgeBaseService.ingestFile(relFilePath);

      const safeTitle = file.replace(/\.pdf$/i, '').replace(/[^a-z0-9]/gi, '_');
      const backupPath = path.resolve(
        serverDir,
        `../../backups/library/${safeTitle}.sql.gz`,
      );

      const libDir = path.dirname(backupPath);
      if (!fs.existsSync(libDir)) fs.mkdirSync(libDir, { recursive: true });

      await knowledgeBaseService.exportDocument(relFilePath, backupPath);
      console.log(
        `💾 Atomic backup saved to: backups/library/${safeTitle}.sql.gz`,
      );

      const newAbsPath = path.join(archiveDir, file);
      fs.renameSync(absFilePath, newAbsPath);
      console.log(`📦 Archived: ${file} -> data/archive/`);

      successCount++;
    } catch (error) {
      console.error(`❌ Failed to ingest ${file}:`, error.message);
      failureCount++;
    }
  }

  console.log('\n--- Ingestion Summary ---');
  console.log(`Total files found: ${files.length}`);
  console.log(`Successfully processed: ${successCount}`);
  console.log(`Failed: ${failureCount}`);

  await app.close();
}

bootstrap().catch((err) => {
  console.error('Fatal error during ingestion:', err);
  process.exit(1);
});
