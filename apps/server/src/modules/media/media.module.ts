import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { SessionPhotoService } from './services/session-photo.service';
import { StorageModule } from '../storage/storage.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { TranscriptionModule } from '../transcription/transcription.module';

@Module({
  imports: [
    StorageModule,
    PrismaModule,
    TranscriptionModule,
    MulterModule.register({
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService, SessionPhotoService],
  exports: [SessionPhotoService],
})
export class MediaModule {}
