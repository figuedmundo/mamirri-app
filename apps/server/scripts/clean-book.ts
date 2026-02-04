import { NestFactory } from '@nestjs/core';
import { KnowledgeBaseModule } from '../src/modules/knowledge-base/knowledge-base.module';
import { KnowledgeBaseService } from '../src/modules/knowledge-base/knowledge-base.service';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '../../../.env'),
    }),
    KnowledgeBaseModule,
  ],
})
class CleanAppModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CleanAppModule);
  const knowledgeBaseService = app.get(KnowledgeBaseService);

  const filename = process.argv[2];
  if (!filename) {
    console.error('Usage: pnpm knowledge:clean <filename.pdf>');
    process.exit(1);
  }

  const filePath = filename.startsWith('data/books/')
    ? filename
    : `data/books/${filename}`;

  console.log(`🧹 Attempting to clean data for: ${filePath}`);

  try {
    await knowledgeBaseService.removeDocument(filePath);
    console.log('✅ Cleanup complete.');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }

  await app.close();
}

bootstrap().catch((err) => {
  console.error('Fatal error during cleanup:', err);
  process.exit(1);
});
