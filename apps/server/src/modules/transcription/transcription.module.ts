import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TranscriptionService } from './transcription.service';
import { TranscriptionProcessor } from './transcription.processor';
import { PrismaModule } from '../../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [ConfigModule, PrismaModule, StorageModule],
  providers: [TranscriptionService, TranscriptionProcessor],
  exports: [TranscriptionService],
})
export class TranscriptionModule {}
