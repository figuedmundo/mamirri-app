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

  const idOrFilename = process.argv[2];
  if (!idOrFilename) {
    console.error('Usage: pnpm knowledge:clean <ID or filename.pdf>');
    process.exit(1);
  }

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      idOrFilename,
    );
  const identifier =
    isUuid || idOrFilename.startsWith('data/books/')
      ? idOrFilename
      : `data/books/${idOrFilename}`;

  console.log(`🧹 Attempting to clean data for identifier: ${identifier}`);

  try {
    await knowledgeBaseService.removeDocument(identifier);
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
