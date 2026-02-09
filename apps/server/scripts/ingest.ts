import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import matter = require('gray-matter');

// Load environment variables before anything else
const envPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn(`⚠️  .env file not found at ${envPath}`);
}

import { NestFactory } from '@nestjs/core';
import { KnowledgeBaseModule } from '../src/modules/knowledge-base/knowledge-base.module';
import { KnowledgeBaseService } from '../src/modules/knowledge-base/knowledge-base.service';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

const args = process.argv.slice(2);
const useSemanticChunking = args.includes('--semantic-chunking');

if (useSemanticChunking) {
  console.log(
    '🧠 Semantic chunking ENABLED (requires ~28K embeddings per large book)',
  );
  console.log('⚠️  Make sure you have sufficient API quota or paid tier.\n');
} else {
  console.log('📄 Using naive chunking (quota-friendly)\n');
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envPath,
    }),
    KnowledgeBaseModule,
  ],
})
class IngestionAppModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(IngestionAppModule);
  const knowledgeBaseService = app.get(KnowledgeBaseService);

  const serverDir = path.resolve(__dirname, '..');
  const markdownsDir = path.join(serverDir, 'data/markdowns');
  const booksDir = path.join(serverDir, 'data/books');
  const backupsDir = path.join(serverDir, '../../backups/library');

  if (!fs.existsSync(markdownsDir)) {
    console.log(`Creating markdown staging directory at ${markdownsDir}`);
    fs.mkdirSync(markdownsDir, { recursive: true });
  }

  if (!fs.existsSync(booksDir)) {
    console.log(`Creating books library directory at ${booksDir}`);
    fs.mkdirSync(booksDir, { recursive: true });
  }

  if (!fs.existsSync(backupsDir)) {
    console.log(`Creating backups directory at ${backupsDir}`);
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const files = fs.readdirSync(markdownsDir).filter((f) => f.endsWith('.md'));
  console.log(`Found ${files.length} markdown files in ${markdownsDir}`);

  let successCount = 0;
  let failureCount = 0;

  for (const file of files) {
    const filePath = path.join(markdownsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    console.log(`\n📥 Ingesting: ${file}`);

    try {
      const parsed = matter(content);
      const metadata = parsed.data as {
        title: string;
        author: string;
        volume?: string;
        edition?: string;
        year?: string;
      };

      if (!metadata.title || !metadata.author) {
        throw new Error(
          'Missing required metadata (title or author) in frontmatter',
        );
      }

      // Call the service with parsed content and metadata
      await knowledgeBaseService.ingestMarkdown(
        parsed.content,
        metadata,
        `data/markdowns/${file}`, // Use staging path as the "file path" reference
        useSemanticChunking,
      );

      // Create backup
      const safeTitle = metadata.title.replace(/[^a-z0-9]/gi, '_');
      const backupPath = path.join(backupsDir, `${safeTitle}.sql.gz`);

      await knowledgeBaseService
        .exportDocument(metadata.title, backupPath)
        .catch((err) => {
          // If export by title fails (maybe ID needed?), try looking up by filePath
          // But exportDocument takes idOrPath. The service uses "filePath" stored in DB.
          // We passed `data/markdowns/${file}` as filePath.
          return knowledgeBaseService.exportDocument(
            `data/markdowns/${file}`,
            backupPath,
          );
        });

      console.log(
        `   💾 Atomic backup saved to: backups/library/${safeTitle}.sql.gz`,
      );

      // Archive the markdown file
      const newAbsPath = path.join(booksDir, file);
      fs.renameSync(filePath, newAbsPath);
      console.log(`   📦 Archived MD to: data/books/${file}`);

      successCount++;
    } catch (error) {
      console.error(`   ❌ Failed to ingest ${file}:`, error.message);
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
