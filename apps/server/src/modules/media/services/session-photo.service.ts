import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { SessionPhoto } from '@prisma/client';

// Define File interface locally since it's not exported from StorageService
interface File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class SessionPhotoService {
  private readonly logger = new Logger(SessionPhotoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async uploadPhoto(
    sessionId: string,
    file: File,
    therapistId: string,
    caption?: string,
  ): Promise<SessionPhoto & { url: string }> {
    await this.verifySessionOwnership(sessionId, therapistId);

    const path = `sessions/${sessionId}/photos`;
    const storagePath = await this.storage.uploadFile(file, path);
    const signedUrl = await this.storage.getFileUrl(storagePath);

    const photo = await this.prisma.sessionPhoto.create({
      data: {
        sessionId,
        storageKey: storagePath,
        caption: caption || null,
        capturedAt: new Date(),
      },
    });

    return { ...photo, url: signedUrl };
  }

  async getPhotos(
    sessionId: string,
    therapistId: string,
  ): Promise<(SessionPhoto & { url: string })[]> {
    await this.verifySessionOwnership(sessionId, therapistId);

    const photos = await this.prisma.sessionPhoto.findMany({
      where: { sessionId },
      orderBy: { capturedAt: 'desc' },
    });

    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => {
        try {
          const url = await this.storage.getFileUrl(photo.storageKey);
          return { ...photo, url };
        } catch (error) {
          this.logger.error(
            `Failed to generate URL for photo ${photo.id}`,
            error,
          );
          return { ...photo, url: '' }; // Handle missing files gracefully
        }
      }),
    );

    return photosWithUrls;
  }

  async deletePhoto(
    sessionId: string,
    photoId: string,
    therapistId: string,
  ): Promise<void> {
    await this.verifySessionOwnership(sessionId, therapistId);

    const photo = await this.prisma.sessionPhoto.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (photo.sessionId !== sessionId) {
      throw new BadRequestException('Photo does not belong to this session');
    }

    try {
      await this.storage.deleteFile(photo.storageKey);
    } catch (error) {
      this.logger.warn(
        `Failed to delete file from storage: ${photo.storageKey}`,
        error,
      );
      // Continue to delete from DB even if storage delete fails (consistency)
      // Or should we fail? Usually better to clean up DB if storage fails, or retry.
      // Given existing MediaService doesn't implement delete, I'll assume standard behavior.
      // StorageService throws InternalServerErrorException on failure.
      // If file not found in storage, it throws NotFoundException.
    }

    await this.prisma.sessionPhoto.delete({
      where: { id: photoId },
    });
  }

  private async verifySessionOwnership(
    sessionId: string,
    therapistId: string,
  ): Promise<void> {
    const session = await this.prisma.treatmentSession.findUnique({
      where: { id: sessionId },
      select: { therapistId: true },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.therapistId !== therapistId) {
      throw new ForbiddenException('Access denied');
    }
  }
}
