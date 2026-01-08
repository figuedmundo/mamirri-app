import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { StorageService } from './storage.service';
import { S3Client } from '@aws-sdk/client-s3';

describe('Storage Integration Tests', () => {
  let app: INestApplication;
  let service: StorageService;
  let mockS3Client: jest.Mocked<S3Client>;

  beforeAll(async () => {
    mockS3Client = {
      send: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: StorageService,
          useValue: {
            onModuleInit: jest.fn().mockResolvedValue(undefined),
            uploadFile: jest.fn().mockResolvedValue('uploads/test.jpg'),
            getFileUrl: jest
              .fn()
              .mockResolvedValue(
                'http://localhost:9000/test.jpg?signature=...',
              ),
            deleteFile: jest.fn().mockResolvedValue(undefined),
            fileExists: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    })
      .overrideProvider(S3Client, {
        useValue: mockS3Client,
      })
      .compile();

    app = module.createNestApplication();
    service = module.get<StorageService>(StorageService);
  });

  describe('End-to-End File Upload Flow', () => {
    it('should upload file, generate URL, and delete it', async () => {
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

      const exists = await service.fileExists(uploadedPath);
      expect(exists).toBe(true);

      await service.deleteFile(uploadedPath);
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
