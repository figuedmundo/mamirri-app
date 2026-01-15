import { Test, TestingModule } from '@nestjs/testing';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

interface File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  stream: any;
  destination: string;
  filename: string;
  path: string;
}

const mockFile: File = {
  fieldname: 'file',
  originalname: 'test.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1024 * 1024,
  buffer: Buffer.from([0xff, 0xd8, 0xff]),
  stream: null,
  destination: '',
  filename: 'test.jpg',
  path: 'test.jpg',
};

describe('StorageController', () => {
  let controller: StorageController;
  let service: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [
        {
          provide: StorageService,
          useValue: {
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
    }).compile();

    controller = module.get<StorageController>(StorageController);
    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const result = await controller.uploadFile(
        { path: 'test-path', metadata: '{"key":"value"}' },
        mockFile,
      );

      expect(service.uploadFile).toHaveBeenCalledWith(mockFile, 'test-path', {
        key: 'value',
      });
      expect(result).toEqual({ path: 'uploads/test.jpg' });
    });

    it('should handle invalid file type', async () => {
      (service.uploadFile as jest.Mock).mockRejectedValue(
        new BadRequestException('Invalid file type'),
      );

      await expect(
        controller.uploadFile({ path: 'test' }, mockFile),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle file too large', async () => {
      (service.uploadFile as jest.Mock).mockRejectedValue(
        new BadRequestException('File size exceeds 10MB limit'),
      );

      await expect(
        controller.uploadFile({ path: 'test' }, mockFile),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getFileUrl', () => {
    it('should generate presigned URL', async () => {
      const result = await controller.getFileUrl('test.jpg', {
        path: 'test.jpg',
        expiry: 3600,
      });

      expect(service.getFileUrl).toHaveBeenCalledWith('test.jpg', 3600);
      expect(result).toEqual({
        url: 'http://localhost:9000/test.jpg?signature=...',
      });
    });

    it('should handle file not found', async () => {
      (service.getFileUrl as jest.Mock).mockRejectedValue(
        new NotFoundException('File not found'),
      );

      await expect(
        controller.getFileUrl('nonexistent.jpg', { path: 'nonexistent.jpg' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const result = await controller.deleteFile('test.jpg');

      expect(service.deleteFile).toHaveBeenCalledWith('test.jpg');
      expect(result).toEqual({ success: true });
    });

    it('should handle file not found', async () => {
      (service.deleteFile as jest.Mock).mockRejectedValue(
        new NotFoundException('File not found'),
      );

      await expect(controller.deleteFile('nonexistent.jpg')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('fileExists', () => {
    it('should check file existence', async () => {
      const result = await controller.fileExists('test.jpg');

      expect(service.fileExists).toHaveBeenCalledWith('test.jpg');
      expect(result).toEqual({ exists: true });
    });
  });
});
