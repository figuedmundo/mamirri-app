import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import storageConfig from '../../config/storage.config';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('../../config/storage.config');

const validFile = {
  fieldname: 'file',
  originalname: 'test.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1024 * 1024,
  buffer: Buffer.from([0xff, 0xd8, 0xff]),
};

describe('StorageService', () => {
  let service: StorageService;
  let s3ClientMock: any;
  let module: TestingModule;

  beforeEach(async () => {
    s3ClientMock = {
      send: jest.fn(),
    };

    (S3Client as unknown as jest.Mock).mockImplementation(() => s3ClientMock);
    (getSignedUrl as jest.Mock).mockResolvedValue('http://signed-url.com');

    (storageConfig as jest.Mock).mockReturnValue({
      endpoint: 'localhost',
      port: '9000',
      accessKey: 'test-key',
      secretKey: 'test-secret',
      useSSL: false,
      bucket: 'test-bucket',
    });

    module = await Test.createTestingModule({
      providers: [StorageService],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      s3ClientMock.send.mockResolvedValue({ $metadata: {} });

      const result = await service.uploadFile(validFile, 'test-path');

      expect(s3ClientMock.send).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result).toContain('test-path');
    });

    it('should throw BadRequestException for invalid file type', async () => {
      const invalidFile = {
        ...validFile,
        mimetype: 'application/pdf',
        buffer: Buffer.from('test'),
      };

      await expect(service.uploadFile(invalidFile, 'test.pdf')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for file too large', async () => {
      const largeFile = { ...validFile, size: 11 * 1024 * 1024 };

      await expect(service.uploadFile(largeFile, 'test.jpg')).rejects.toThrow(
        /File size exceeds limit of 10MB/,
      );
    });

    it('should upload video file successfully with correct magic numbers', async () => {
      s3ClientMock.send.mockResolvedValue({ $metadata: {} });
      const videoFile = {
        ...validFile,
        mimetype: 'video/mp4',
        originalname: 'test.mp4',
        size: 50 * 1024 * 1024,
        // ftyp box signature: bytes 4-7 = 'ftyp'
        buffer: Buffer.from([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]),
      };

      const result = await service.uploadFile(videoFile, 'test-path');

      expect(s3ClientMock.send).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException for video file too large', async () => {
      const largeVideo = {
        ...validFile,
        mimetype: 'video/mp4',
        originalname: 'test.mp4',
        size: 101 * 1024 * 1024, // 101 MB
        buffer: Buffer.from([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]),
      };

      await expect(service.uploadFile(largeVideo, 'test.mp4')).rejects.toThrow(
        /File size exceeds limit of 100MB/,
      );
    });

    it('should allow audio file up to 25MB', async () => {
      s3ClientMock.send.mockResolvedValue({ $metadata: {} });
      const audioFile = {
        ...validFile,
        mimetype: 'audio/mpeg',
        originalname: 'test.mp3',
        size: 24 * 1024 * 1024, // 24 MB
        buffer: Buffer.from([0xff, 0xfb]),
      };

      await service.uploadFile(audioFile, 'test-path');
      expect(s3ClientMock.send).toHaveBeenCalled();
    });

    it('should reject audio file larger than 25MB', async () => {
      const largeAudio = {
        ...validFile,
        mimetype: 'audio/mpeg',
        originalname: 'test.mp3',
        size: 26 * 1024 * 1024, // 26 MB
        buffer: Buffer.from([0xff, 0xfb]),
      };

      await expect(service.uploadFile(largeAudio, 'test.mp3')).rejects.toThrow(
        /File size exceeds limit of 25MB/,
      );
    });
  });

  describe('getFileUrl', () => {
    it('should generate presigned URL for file', async () => {
      const url = await service.getFileUrl('test-path/test.jpg', 3600);

      expect(getSignedUrl).toHaveBeenCalled();
      expect(url).toBe('http://signed-url.com');
    });

    it('should throw NotFoundException if file does not exist', async () => {
      const error = new Error('NotFound');
      error.name = 'NotFound';
      (getSignedUrl as jest.Mock).mockRejectedValue(error);

      await expect(service.getFileUrl('nonexistent.jpg', 3600)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      s3ClientMock.send.mockResolvedValue({ $metadata: {} });

      await service.deleteFile('test-path/test.jpg');

      expect(s3ClientMock.send).toHaveBeenCalled();
    });

    it('should throw NotFoundException if file does not exist', async () => {
      const error = new Error('NotFound');
      error.name = 'NotFound';
      s3ClientMock.send.mockRejectedValue(error);

      await expect(service.deleteFile('nonexistent.jpg')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('fileExists', () => {
    it('should return true if file exists', async () => {
      s3ClientMock.send.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      });

      const exists = await service.fileExists('test-path/test.jpg');

      expect(exists).toBe(true);
    });

    it('should return false if file does not exist', async () => {
      const error = new Error('NotFound');
      error.name = 'NotFound';
      s3ClientMock.send.mockRejectedValue(error);

      const exists = await service.fileExists('nonexistent.jpg');

      expect(exists).toBe(false);
    });
  });

  describe('onModuleInit', () => {
    it('should create bucket if it does not exist', async () => {
      s3ClientMock.send
        .mockRejectedValueOnce({ name: 'NotFound' })
        .mockResolvedValueOnce({ $metadata: {} })
        .mockResolvedValueOnce({ $metadata: {} });

      await service.onModuleInit();

      expect(s3ClientMock.send).toHaveBeenCalledTimes(3);
    });

    it('should not create bucket if it exists', async () => {
      s3ClientMock.send.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      });

      await service.onModuleInit();

      expect(s3ClientMock.send).toHaveBeenCalledTimes(1);
    });

    it('should handle bucket creation errors', async () => {
      const error = new Error('InternalError');
      s3ClientMock.send.mockRejectedValue(error);

      // Should not throw as it catches errors
      await expect(service.onModuleInit()).resolves.not.toThrow();
    });
  });
});
