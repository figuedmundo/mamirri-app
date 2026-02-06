import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiAnalysisService } from './ai-analysis.service';
import { AiAnalysisController } from './ai-analysis.controller';
import { AnonymizerService } from './services/anonymizer.service';
import { TranslatorService } from './services/translator.service';
import { PromptBuilderService } from './services/prompt-builder.service';
import { VisionService } from './services/vision.service';
import { VisionPromptBuilderService } from './services/vision-prompt-builder.service';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [KnowledgeBaseModule, PrismaModule, ConfigModule, StorageModule],
  controllers: [AiAnalysisController],
  providers: [
    AiAnalysisService,
    AnonymizerService,
    TranslatorService,
    PromptBuilderService,
    VisionService,
    VisionPromptBuilderService,
  ],
  exports: [AiAnalysisService],
})
export class AiAnalysisModule {}
