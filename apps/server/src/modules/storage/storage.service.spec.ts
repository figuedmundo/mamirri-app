import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService],
    }).compile();

    service = module.get<StorageService>(StorageService);
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
        BadRequestException,
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

      await expect(service.onModuleInit()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
