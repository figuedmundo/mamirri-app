import { NestFactory } from '@nestjs/core';
import { KnowledgeBaseModule } from '../src/modules/knowledge-base/knowledge-base.module';
import { KnowledgeBaseService } from '../src/modules/knowledge-base/knowledge-base.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '../../../.env'),
    }),
    KnowledgeBaseModule,
  ],
})
class ExportAppModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ExportAppModule);
  const knowledgeBaseService = app.get(KnowledgeBaseService);
  const prisma = app.get(PrismaService);

  const serverDir = path.resolve(__dirname, '..');
  const backupsDir = path.resolve(serverDir, '../../backups/library');

  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const identifier = process.argv[2];

  if (!identifier) {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19);
    const fileName = `library_all_${timestamp}.sql.gz`;
    const outputPath = path.join(backupsDir, fileName);

    console.log(
      '📚 Exporting all books in library (documents & embeddings)...',
    );
    console.log(`   Destination: backups/library/${fileName}`);

    try {
      const dumpCmd = `docker exec -t physio_db pg_dump -U physio_user -d physio_db -t documents -t embeddings --data-only | gzip > "${outputPath}"`;
      execSync(dumpCmd);
      console.log('✅ Library export complete.');
    } catch (error) {
      console.error('❌ Library export failed:', error.message);
    }

    await app.close();
    return;
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

  const safeTitle = doc.title.replace(/[^a-z0-9]/gi, '_');
  const fileName = `${safeTitle}.sql.gz`;
  const outputPath = path.join(backupsDir, fileName);

  console.log(`📤 Exporting: ${doc.title}`);
  console.log(`   Destination: backups/library/${fileName}`);

  try {
    await knowledgeBaseService.exportDocument(doc.id, outputPath);
    console.log('✅ Export complete.');
  } catch (error) {
    console.error('❌ Export failed:', error.message);
  }

  await app.close();
}

bootstrap().catch((err) => {
  console.error('Fatal error during exporting:', err);
  process.exit(1);
});
