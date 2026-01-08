import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import storageConfig from '../../config/storage.config';

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
  let mockS3Client: jest.Mocked<S3Client>;

  beforeEach(async () => {
    mockS3Client = {
      send: jest.fn(),
    } as any;

    (storageConfig as jest.Mock).mockReturnValue({
      endpoint: 'localhost',
      port: '9000',
      accessKey: 'test-key',
      secretKey: 'test-secret',
      useSSL: false,
      bucket: 'test-bucket',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: S3Client,
          useValue: mockS3Client,
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      mockS3Client.send.mockResolvedValue({ $metadata: {} });

      const result = await service.uploadFile(validFile, 'test-path');

      expect(mockS3Client.send).toHaveBeenCalled();
      expect(result).toBeDefined();
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
        BadRequestException,
      );
    });
  });

  describe('getFileUrl', () => {
    it('should generate presigned URL for file', async () => {
      mockS3Client.send.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      });

      const url = await service.getFileUrl('test-path/test.jpg', 3600);

      expect(url).toBeDefined();
      expect(url).toContain('X-Amz-SignedHeaders');
    });

    it('should throw NotFoundException if file does not exist', async () => {
      const error = new Error('NotFound');
      error.name = 'NotFound';
      mockS3Client.send.mockRejectedValue(error);

      await expect(service.getFileUrl('nonexistent.jpg', 3600)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      mockS3Client.send.mockResolvedValue({ $metadata: {} });

      await service.deleteFile('test-path/test.jpg');

      expect(mockS3Client.send).toHaveBeenCalled();
    });

    it('should throw NotFoundException if file does not exist', async () => {
      const error = new Error('NotFound');
      error.name = 'NotFound';
      mockS3Client.send.mockRejectedValue(error);

      await expect(service.deleteFile('nonexistent.jpg')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('fileExists', () => {
    it('should return true if file exists', async () => {
      mockS3Client.send.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      });

      const exists = await service.fileExists('test-path/test.jpg');

      expect(exists).toBe(true);
    });

    it('should return false if file does not exist', async () => {
      const error = new Error('NotFound');
      error.name = 'NotFound';
      mockS3Client.send.mockRejectedValue(error);

      const exists = await service.fileExists('nonexistent.jpg');

      expect(exists).toBe(false);
    });
  });

  describe('onModuleInit', () => {
    it('should create bucket if it does not exist', async () => {
      mockS3Client.send
        .mockRejectedValueOnce({ name: 'NotFound' })
        .mockResolvedValueOnce({ $metadata: {} })
        .mockResolvedValueOnce({ $metadata: {} });

      await service.onModuleInit();

      expect(mockS3Client.send).toHaveBeenCalledTimes(2);
    });

    it('should not create bucket if it exists', async () => {
      mockS3Client.send.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      });

      await service.onModuleInit();

      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it('should handle bucket creation errors', async () => {
      const error = new Error('InternalError');
      mockS3Client.send.mockRejectedValue(error);

      await expect(service.onModuleInit()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
