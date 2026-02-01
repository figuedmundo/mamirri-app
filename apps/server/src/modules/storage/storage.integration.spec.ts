import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { StorageModule } from './storage.module';
import { StorageService } from './storage.service';
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import storageConfig from '../../config/storage.config';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('../../config/storage.config');

describe('Storage Integration Tests', () => {
  let app: INestApplication;
  let service: StorageService;
  let s3ClientMock: any;

  beforeAll(async () => {
    s3ClientMock = {
      send: jest.fn(),
    };

    (S3Client as unknown as jest.Mock).mockImplementation(() => s3ClientMock);
    (getSignedUrl as jest.Mock).mockResolvedValue(
      'http://localhost:9000/test.jpg?signature=...',
    );

    (storageConfig as jest.Mock).mockReturnValue({
      endpoint: 'localhost',
      port: '9000',
      accessKey: 'test-key',
      secretKey: 'test-secret',
      useSSL: false,
      bucket: 'test-bucket',
    });

    const module: TestingModule = await Test.createTestingModule({
      imports: [StorageModule],
    }).compile();

    app = module.createNestApplication();
    service = module.get<StorageService>(StorageService);
    await app.init();
  });

  afterAll(async () => {
    if (app && typeof app.close === 'function') {
      await app.close();
    }
  });

  describe('End-to-End File Upload Flow', () => {
    it('should upload file, generate URL, and delete it', async () => {
      s3ClientMock.send.mockResolvedValue({ $metadata: {} });

      const testFile = {
        fieldname: 'file',
        originalname: 'integration-test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024 * 1024,
        buffer: Buffer.from([0xff, 0xd8, 0xff]),
      };

      const uploadedPath = await service.uploadFile(testFile, 'integration', {
        source: 'test',
      });
      expect(uploadedPath).toBeDefined();

      const url = await service.getFileUrl(uploadedPath, 3600);
      expect(url).toContain('test.jpg');

      s3ClientMock.send.mockResolvedValueOnce({
        $metadata: { httpStatusCode: 200 },
      });
      const exists = await service.fileExists(uploadedPath);
      expect(exists).toBe(true);

      await service.deleteFile(uploadedPath);

      s3ClientMock.send.mockRejectedValueOnce({ name: 'NotFound' });
      const existsAfterDelete = await service.fileExists(uploadedPath);
      expect(existsAfterDelete).toBe(false);
    });
  });

  describe('File Type Validation', () => {
    it('should reject invalid file types', async () => {
      const invalidFile = {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test'),
      };

      await expect(service.uploadFile(invalidFile, 'test')).rejects.toThrow();
    });
  });

  describe('File Size Validation', () => {
    it('should reject files larger than 10MB', async () => {
      const largeFile = {
        fieldname: 'file',
        originalname: 'large.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 11 * 1024 * 1024,
        buffer: Buffer.from([0xff, 0xd8, 0xff]),
      };

      await expect(service.uploadFile(largeFile, 'test')).rejects.toThrow();
    });
  });
});
