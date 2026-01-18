import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { SessionPhotoService } from './services/session-photo.service';
import { StorageModule } from '../storage/storage.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [StorageModule, PrismaModule],
  controllers: [MediaController],
  providers: [MediaService, SessionPhotoService],
  exports: [SessionPhotoService],
})
export class MediaModule {}
