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
class SearchAppModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SearchAppModule);
  const knowledgeBaseService = app.get(KnowledgeBaseService);

  const query = process.argv[2] || 'anatomical structures of the hand';
  console.log(`Searching for: "${query}"`);

  try {
    const results = await knowledgeBaseService.findSimilar(query, 5);
    console.log('--- Search Results ---');
    results.forEach((res, i) => {
      const vol = res.documentMetadata?.volume
        ? ` (${res.documentMetadata.volume})`
        : '';

      const score = res.rerankScore
        ? `Rerank: ${res.rerankScore.toFixed(4)}`
        : `Sim: ${res.similarity?.toFixed(4) || 'N/A'}`;

      console.log(`[${i + 1}] ${score}`);
      console.log(
        `Source: ${res.documentTitle}${vol} (Page ${res.pageNumber})`,
      );
      console.log(`Content: ${res.content.substring(0, 200)}...`);
      console.log('---');
    });
  } catch (error) {
    console.error('Search failed:', error.message);
  }

  await app.close();
}

bootstrap().catch((err) => {
  console.error('Fatal error during search test:', err);
  process.exit(1);
});
