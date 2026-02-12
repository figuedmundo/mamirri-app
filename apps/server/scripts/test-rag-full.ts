import { NestFactory } from '@nestjs/core';
import { AiAnalysisModule } from '../src/modules/ai-analysis/ai-analysis.module';
import { AiAnalysisService } from '../src/modules/ai-analysis/ai-analysis.service';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '../../../.env'),
    }),
    AiAnalysisModule,
  ],
})
class RagTestAppModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(RagTestAppModule);
  const aiAnalysisService = app.get(AiAnalysisService);

  const query = process.argv[2] || 'fascitis plantar';
  console.log(
    `\n🚀 Testing FULL AI RAG Pipeline (HyDE + Cross-Lingual Translation)`,
  );
  console.log(`Input Query: "${query}"`);
  console.log(`--------------------------------------------------`);

  try {
    // We simulate a case data object to trigger executeMultiQueryRag
    const dummyCaseData = {
      consultationReason: query,
      initialMedicalDiagnosis: query,
    };

    // This calls the "brain" of the system:
    // 1. HyDE (Hypothetical Document in English)
    // 2. Translation Fallback (Spanish -> English)
    // 3. KnowledgeBase Retrieval (8 per query)
    // 4. Reranking (Cohere v4-pro)
    const results = await (aiAnalysisService as any).executeMultiQueryRag(
      dummyCaseData,
    );

    console.log(`\nFound ${results.length} results after Reranking:`);
    results.forEach((res: any, i: number) => {
      const vol = res.documentMetadata?.volume
        ? ` (${res.documentMetadata.volume})`
        : '';
      console.log(`[${i + 1}] Rerank Score: ${res.relevanceScore.toFixed(4)}`);
      console.log(
        `Source: ${res.documentTitle}${vol} (Page ${res.pageNumber})`,
      );
      console.log(`Content Preview: ${res.content.substring(0, 150)}...`);
      console.log('---');
    });
  } catch (error) {
    console.error('RAG Pipeline failed:', error.message);
  }

  await app.close();
}

bootstrap().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
