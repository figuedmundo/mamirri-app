import { Module } from '@nestjs/common';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [PrismaModule, KnowledgeBaseModule],
  controllers: [LibraryController],
  providers: [LibraryService, RolesGuard],
  exports: [LibraryService],
})
export class LibraryModule {}
