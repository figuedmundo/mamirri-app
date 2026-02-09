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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envPath,
    }),
    KnowledgeBaseModule,
  ],
})
class ConversionAppModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ConversionAppModule);
  const knowledgeBaseService = app.get(KnowledgeBaseService);

  const serverDir = path.resolve(__dirname, '..');
  const pdfsDir = path.join(serverDir, 'data/pdfs');
  const markdownsDir = path.join(serverDir, 'data/markdowns');
  const archiveDir = path.join(serverDir, 'data/archive');
  const booksDir = path.join(serverDir, 'data/books');

  if (!fs.existsSync(pdfsDir)) {
    console.log(`Creating PDF input directory at ${pdfsDir}`);
    fs.mkdirSync(pdfsDir, { recursive: true });
  }

  if (!fs.existsSync(markdownsDir)) {
    console.log(`Creating markdown staging directory at ${markdownsDir}`);
    fs.mkdirSync(markdownsDir, { recursive: true });
  }

  if (!fs.existsSync(archiveDir)) {
    console.log(`Creating PDF archive directory at ${archiveDir}`);
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  if (!fs.existsSync(booksDir)) {
    console.log(`Creating books library directory at ${booksDir}`);
    fs.mkdirSync(booksDir, { recursive: true });
  }

  const files = fs.readdirSync(pdfsDir).filter((f) => f.endsWith('.pdf'));
  console.log(`Found ${files.length} new PDF files in ${pdfsDir}`);

  // Parse args for engine and pages
  const args = process.argv.slice(2);
  let engine: 'pymupdf' | 'docling' = 'docling'; // Docling is now the default
  let pageRange: { start: number; end: number } | undefined;

  const engineArgIndex = args.findIndex((a) => a.startsWith('--engine='));
  if (engineArgIndex !== -1) {
    const engineValue = args[engineArgIndex].split('=')[1];
    if (engineValue === 'pymupdf') {
      engine = 'pymupdf';
    }
  }

  const pagesArgIndex = args.findIndex((a) => a.startsWith('--pages='));
  if (pagesArgIndex !== -1) {
    const pagesValue = args[pagesArgIndex].split('=')[1]; // e.g., "1,10"
    const [start, end] = pagesValue.split(',').map(Number);
    if (!isNaN(start) && !isNaN(end)) {
      pageRange = { start, end };
    }
  }

  console.log(`🚀 Using extraction engine: ${engine.toUpperCase()}`);
  if (pageRange) {
    console.log(`   📄 Page range: ${pageRange.start} to ${pageRange.end}`);
  }
  if (engine === 'docling') {
    console.log(
      '   (Note: Docling is slower but handles layouts/images better)',
    );
  }

  let successCount = 0;
  let failureCount = 0;

  for (const file of files) {
    const relFilePath = `data/pdfs/${file}`;
    const absFilePath = path.join(serverDir, relFilePath);
    const fileNameNoExt = file.replace(/\.pdf$/i, '');

    console.log(`\n📘 Processing: ${file}`);

    try {
      // 1. Extract Markdown
      console.log(`   Running PDF extraction (${engine})...`);
      const markdown = await knowledgeBaseService.extractPdf(
        absFilePath,
        engine,
        pageRange ? { startPage: pageRange.start, endPage: pageRange.end } : {},
      );

      // 2. Extract Metadata
      console.log('   Extracting metadata with AI...');
      const firstPageText = markdown.substring(0, 2000);
      const meta = await knowledgeBaseService.extractMetadata(
        firstPageText,
        fileNameNoExt,
      );

      // 3. Create Frontmatter Content
      const fileContent = matter.stringify(markdown, {
        title: meta.title,
        author: meta.author,
        volume: meta.volume || null,
        edition: meta.edition || null,
        year: meta.year || null,
        original_file: file,
        extraction_date: new Date().toISOString(),
      });

      // 4. Save to Markdowns
      const stagingPath = path.join(markdownsDir, `${fileNameNoExt}.md`);
      fs.writeFileSync(stagingPath, fileContent);
      console.log(
        `   ✅ Saved markdown to: data/markdowns/${fileNameNoExt}.md`,
      );

      // 5. Archive Original PDF
      const newAbsPath = path.join(archiveDir, file);
      fs.renameSync(absFilePath, newAbsPath);
      console.log(`   📦 Archived PDF to: data/archive/${file}`);

      successCount++;
    } catch (error) {
      console.error(`   ❌ Failed to convert ${file}:`, error.message);
      failureCount++;
    }
  }

  console.log('\n--- Conversion Summary ---');
  console.log(`Total files found: ${files.length}`);
  console.log(`Successfully converted: ${successCount}`);
  console.log(`Failed: ${failureCount}`);

  await app.close();
}

bootstrap().catch((err) => {
  console.error('Fatal error during conversion:', err);
  process.exit(1);
});
