import { NestFactory } from '@nestjs/core';
import { KnowledgeBaseModule } from '../src/modules/knowledge-base/knowledge-base.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
class RestoreAppModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(RestoreAppModule);

  const backupFile = process.argv[2];
  if (!backupFile) {
    console.error('\nUsage: pnpm knowledge:restore <backup_file.sql>');
    const backupsDir = path.resolve(__dirname, '../../../backups');
    if (fs.existsSync(backupsDir)) {
      const files = fs
        .readdirSync(backupsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort()
        .reverse();
      if (files.length > 0) {
        console.log('\nAvailable backups:');
        files.forEach((f) => console.log(` - backups/${f}`));
      }
    }
    process.exit(1);
  }

  const absolutePath = path.isAbsolute(backupFile)
    ? backupFile
    : path.resolve(process.cwd(), backupFile);

  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Error: Backup file not found at ${absolutePath}`);
    process.exit(1);
  }

  console.log(`⚠️  WARNING: This will overwrite your current library data!`);
  console.log(`🔄 Restoring from: ${absolutePath}...`);

  try {
    execSync(
      `cat "${absolutePath}" | docker exec -i physio_db psql -U physio_user -d physio_db`,
      { stdio: 'inherit' },
    );
    console.log('✅ Restore complete.');
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
  }

  await app.close();
}

bootstrap().catch((err) => {
  console.error('Fatal error during restore:', err);
  process.exit(1);
});
