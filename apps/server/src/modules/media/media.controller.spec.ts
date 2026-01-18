import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { SessionPhotoService } from './services/session-photo.service';
import { CanActivate } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FootprintType } from './dto/upload-footprint.dto';
import { PostureVideoType } from './dto/upload-posture-video.dto';

describe('MediaController', () => {
  let controller: MediaController;
  let service: MediaService;
  let sessionPhotoService: SessionPhotoService;

  const mockMediaService = {
    uploadPatientPhoto: jest.fn(),
    uploadFootprint: jest.fn(),
    uploadPostureVideo: jest.fn(),
    uploadVoiceNote: jest.fn(),
  };

  const mockSessionPhotoService = {
    uploadPhoto: jest.fn(),
    getPhotos: jest.fn(),
    deletePhoto: jest.fn(),
  };

  const mockUser = { userId: 'therapist-1' };

  const mockFile = {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('test'),
  } as any;

  beforeEach(async () => {
    const mockJwtAuthGuard: CanActivate = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: MediaService,
          useValue: mockMediaService,
        },
        {
          provide: SessionPhotoService,
          useValue: mockSessionPhotoService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<MediaController>(MediaController);
    service = module.get<MediaService>(MediaService);
    sessionPhotoService = module.get<SessionPhotoService>(SessionPhotoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadPatientPhoto', () => {
    it('should upload patient photo', async () => {
      const result = { url: 'http://url.com/photo.jpg', patientId: 'p-1' };
      mockMediaService.uploadPatientPhoto.mockResolvedValue(result);

      const response = await controller.uploadPatientPhoto(
        'p-1',
        mockFile,
        mockUser,
      );

      expect(service.uploadPatientPhoto).toHaveBeenCalledWith(
        'p-1',
        mockFile,
        'therapist-1',
      );
      expect(response).toEqual(result);
    });
  });

  describe('uploadFootprint', () => {
    it('should upload footprint', async () => {
      const dto = { type: FootprintType.INITIAL };
      const result = { id: 'fp-1', url: 'http://url.com/fp.jpg', ...dto };
      mockMediaService.uploadFootprint.mockResolvedValue(result);

      const response = await controller.uploadFootprint(
        'eval-1',
        dto,
        mockFile,
        mockUser,
      );

      expect(service.uploadFootprint).toHaveBeenCalledWith(
        'eval-1',
        mockFile,
        dto.type,
        'therapist-1',
      );
      expect(response).toEqual(result);
    });
  });

  describe('uploadPostureVideo', () => {
    it('should upload posture video', async () => {
      const dto = { type: PostureVideoType.GAIT, duration: 120 };
      const result = { id: 'vid-1', url: 'http://url.com/vid.mp4', ...dto };
      mockMediaService.uploadPostureVideo.mockResolvedValue(result);

      const response = await controller.uploadPostureVideo(
        'eval-1',
        dto,
        mockFile,
        mockUser,
      );

      expect(service.uploadPostureVideo).toHaveBeenCalledWith(
        'eval-1',
        mockFile,
        dto.type,
        120,
        'therapist-1',
      );
      expect(response).toEqual(result);
    });
  });

  describe('uploadEvaluationVoiceNote', () => {
    it('should upload voice note to evaluation', async () => {
      const dto = { durationSeconds: 60 };
      const result = {
        audioUrl: 'http://url.com/audio.wav',
        transcription: null,
        durationSeconds: 60,
      };
      mockMediaService.uploadVoiceNote.mockResolvedValue(result);

      const response = await controller.uploadEvaluationVoiceNote(
        'eval-1',
        dto,
        mockFile,
        mockUser,
      );

      expect(service.uploadVoiceNote).toHaveBeenCalledWith(
        'evaluation',
        'eval-1',
        mockFile,
        60,
        'therapist-1',
      );
      expect(response).toEqual(result);
    });
  });

  describe('uploadSessionVoiceNote', () => {
    it('should upload voice note to session', async () => {
      const dto = { durationSeconds: 45 };
      const result = {
        audioUrl: 'http://url.com/audio.wav',
        transcription: null,
        durationSeconds: 45,
      };
      mockMediaService.uploadVoiceNote.mockResolvedValue(result);

      const response = await controller.uploadSessionVoiceNote(
        'session-1',
        dto,
        mockFile,
        mockUser,
      );

      expect(service.uploadVoiceNote).toHaveBeenCalledWith(
        'session',
        'session-1',
        mockFile,
        45,
        'therapist-1',
      );
      expect(response).toEqual(result);
    });
  });

  describe('Session Photos', () => {
    const sessionId = 'session-1';

    it('should upload session photo', async () => {
      const dto = { caption: 'Test photo' };
      const result = {
        id: 'photo-1',
        url: 'http://url',
        sessionId: 'session-1',
        storageKey: 'key',
        caption: 'Test photo',
        capturedAt: new Date(),
        createdAt: new Date(),
      };
      mockSessionPhotoService.uploadPhoto.mockResolvedValue(result);

      const response = await controller.uploadSessionPhoto(
        sessionId,
        dto,
        mockFile,
        mockUser,
      );

      expect(sessionPhotoService.uploadPhoto).toHaveBeenCalledWith(
        sessionId,
        mockFile,
        mockUser.userId,
        dto.caption,
      );
      expect(response).toEqual(result);
    });

    it('should list session photos', async () => {
      mockSessionPhotoService.getPhotos.mockResolvedValue([]);
      await controller.getSessionPhotos(sessionId, mockUser);
      expect(sessionPhotoService.getPhotos).toHaveBeenCalledWith(
        sessionId,
        mockUser.userId,
      );
    });

    it('should delete session photo', async () => {
      const photoId = 'photo-1';
      mockSessionPhotoService.deletePhoto.mockResolvedValue(undefined);
      await controller.deleteSessionPhoto(sessionId, photoId, mockUser);
      expect(sessionPhotoService.deletePhoto).toHaveBeenCalledWith(
        sessionId,
        photoId,
        mockUser.userId,
      );
    });
  });
});
