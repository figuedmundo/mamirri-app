import { NestFactory } from '@nestjs/core';
import { KnowledgeBaseModule } from '../src/modules/knowledge-base/knowledge-base.module';
import { KnowledgeBaseService } from '../src/modules/knowledge-base/knowledge-base.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '../../../.env'),
    }),
    KnowledgeBaseModule,
  ],
})
class ArchiveAppModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ArchiveAppModule);
  const knowledgeBaseService = app.get(KnowledgeBaseService);
  const prisma = app.get(PrismaService);

  const identifier = process.argv[2];
  if (!identifier) {
    console.error('\nUsage: pnpm knowledge:archive <ID or current_path>');
    process.exit(1);
  }

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier,
    );

  const doc = await (prisma as any).document.findUnique({
    where: isUuid ? { id: identifier } : { filePath: identifier },
  });

  if (!doc) {
    console.error(`❌ Error: Document not found for: ${identifier}`);
    await app.close();
    process.exit(1);
  }

  const serverDir = path.resolve(__dirname, '..');
  const oldPath = path.resolve(serverDir, doc.filePath);
  const fileName = path.basename(doc.filePath);
  const archiveDir = path.join(serverDir, 'data/library/originals');
  const newRelPath = `data/library/originals/${fileName}`;
  const newAbsPath = path.join(archiveDir, fileName);

  if (!fs.existsSync(oldPath)) {
    console.error(`❌ Error: File not found on disk at: ${oldPath}`);
    await app.close();
    process.exit(1);
  }

  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  console.log(`📦 Archiving: ${fileName}`);
  console.log(`   From: ${doc.filePath}`);
  console.log(`   To:   ${newRelPath}`);

  try {
    fs.renameSync(oldPath, newAbsPath);
    await knowledgeBaseService.updateMetadata(doc.id, { filePath: newRelPath });
    console.log('✅ Archive complete and database updated.');
  } catch (error) {
    console.error('❌ Archive failed:', error.message);
  }

  await app.close();
}

bootstrap().catch((err) => {
  console.error('Fatal error during archiving:', err);
  process.exit(1);
});
