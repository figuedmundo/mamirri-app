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
const useBatchApi = args.includes('--batch');
const dryRun = args.includes('--dry-run');

if (dryRun) {
  console.log('🔍 DRY RUN MODE ENABLED');
  console.log('   - No API calls will be made');
  console.log('   - Mock embeddings will be generated');
  console.log('   - Batching logic and token estimation will be tested\n');
}

if (useSemanticChunking) {
  console.log(
    '🧠 Semantic chunking ENABLED (requires ~28K embeddings per large book)',
  );
  console.log('⚠️  Make sure you have sufficient API quota or paid tier.\n');
} else {
  console.log('📄 Using naive chunking (quota-friendly)\n');
}

if (useBatchApi) {
  console.log(
    '📦 Batch API Mode ENABLED (Async ingestion with 12h turnaround)',
  );
  console.log('   - Bypasses per-minute rate limits');
  console.log('   - 33% cost discount');
  console.log('   - Requires subsequent status check\n');
} else {
  console.log('⚡ Real-time Ingestion Mode (Default)');
  console.log('   - Subject to 3 RPM / 10k TPM limits on Free Tier\n');
}

import voyageConfig from '../src/config/voyage.config';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envPath,
      load: [voyageConfig],
    }),
    KnowledgeBaseModule,
    PrismaModule,
  ],
})
class IngestionAppModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(IngestionAppModule);
  const knowledgeBaseService = app.get(KnowledgeBaseService);
  const prisma = app.get(PrismaService);

  const serverDir = path.resolve(__dirname, '..');
  const markdownsDir = path.join(serverDir, 'data/markdowns');
  const booksDir = path.join(serverDir, 'data/books');

  if (!fs.existsSync(markdownsDir)) {
    console.log(`Creating markdown staging directory at ${markdownsDir}`);
    fs.mkdirSync(markdownsDir, { recursive: true });
  }

  if (!fs.existsSync(booksDir)) {
    console.log(`Creating books library directory at ${booksDir}`);
    fs.mkdirSync(booksDir, { recursive: true });
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
      const { id: docId } = await knowledgeBaseService.ingestMarkdown(
        parsed.content,
        metadata,
        `data/markdowns/${file}`, // Use staging path as the "file path" reference
        useSemanticChunking,
        useBatchApi,
        dryRun,
      );

      if (useBatchApi) {
        console.log(
          `   ⏳ Batch job submitted. File stays in data/markdowns/ until batch completes.`,
        );
        console.log(
          `   Run 'pnpm knowledge:batch-status' to check progress and commit when ready.`,
        );
      } else if (dryRun) {
        console.log(`   [DRY RUN] Skipping atomic backup creation`);
      } else {
        // Archive the markdown file (only for real-time ingestion)
        const newAbsPath = path.join(booksDir, file);
        fs.renameSync(filePath, newAbsPath);
        console.log(`   📦 Archived MD to: data/books/${file}`);

        await prisma.document.update({
          where: { id: docId },
          data: { filePath: `data/books/${file}` },
        });
        console.log(`   🗂️ Updated Document path in database`);
      }

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
