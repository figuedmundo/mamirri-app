import { Module } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { VoyageEmbeddingService } from './services/voyage-embedding.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [KnowledgeBaseService, VoyageEmbeddingService],
  exports: [KnowledgeBaseService, VoyageEmbeddingService],
})
export class KnowledgeBaseModule {}
