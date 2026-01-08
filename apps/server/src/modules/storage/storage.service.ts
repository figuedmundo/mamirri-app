import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import storageConfig from '../../config/storage.config';

interface File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'audio/wav',
  'audio/mpeg',
  'audio/mp4',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const MAGIC_NUMBERS: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'audio/wav': [0x52, 0x49, 0x46, 0x46],
  'audio/mpeg': [0xff, 0xfb],
  'audio/mp4': [0x00, 0x00, 0x00],
};

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;

  constructor() {
    const config = storageConfig();
    this.client = new S3Client({
      endpoint: `http${config.useSSL ? 's' : ''}://${config.endpoint}:${config.port}`,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
      region: 'us-east-1',
      forcePathStyle: true,
    });
  }

  async onModuleInit() {
    try {
      const bucket = storageConfig().bucket;
      const exists = await this.bucketExists(bucket);

      if (!exists) {
        this.logger.log(`Bucket ${bucket} does not exist, creating...`);
        await this.createBucket(bucket);
      } else {
        this.logger.log(`Bucket ${bucket} already exists`);
      }
    } catch (error) {
      this.logger.error('Failed to initialize storage bucket', error);
      throw new InternalServerErrorException('Storage initialization failed');
    }
  }

  async uploadFile(
    file: File,
    path: string,
    metadata?: Record<string, string>,
  ) {
    this.validateFile(file);

    const sanitizedPath = this.sanitizePath(path);
    const uniquePath = this.generateUniquePath(
      sanitizedPath,
      file.originalname,
    );

    try {
      const command = new PutObjectCommand({
        Bucket: storageConfig().bucket,
        Key: uniquePath,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          ...metadata,
          originalName: file.originalname,
        },
      });

      await this.client.send(command);
      this.logger.log(`File uploaded: ${uniquePath}`);
      return uniquePath;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${uniquePath}`, error);
      throw new InternalServerErrorException('File upload failed');
    }
  }

  async getFileUrl(path: string, expiry: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: storageConfig().bucket,
      Key: path,
    });

    try {
      const url = await getSignedUrl(this.client, command, {
        expiresIn: expiry,
      });
      return url;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        throw new NotFoundException('File not found');
      }
      this.logger.error(`Failed to generate URL for: ${path}`, error);
      throw new InternalServerErrorException('Failed to generate file URL');
    }
  }

  async deleteFile(path: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: storageConfig().bucket,
      Key: path,
    });

    try {
      await this.client.send(command);
      this.logger.log(`File deleted: ${path}`);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        throw new NotFoundException('File not found');
      }
      this.logger.error(`Failed to delete file: ${path}`, error);
      throw new InternalServerErrorException('File deletion failed');
    }
  }

  async fileExists(path: string): Promise<boolean> {
    const command = new HeadObjectCommand({
      Bucket: storageConfig().bucket,
      Key: path,
    });

    try {
      await this.client.send(command);
      return true;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return false;
      }
      throw error;
    }
  }

  private validateFile(file: File) {
    if (file.size > MAX_FILE_SIZE) {
      this.logger.warn(`File too large: ${file.size} bytes`);
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      this.logger.warn(`Invalid file type: ${file.mimetype}`);
      throw new BadRequestException('Invalid file type');
    }

    this.validateMagicNumbers(file);
  }

  private validateMagicNumbers(file: File) {
    const expectedMagic = MAGIC_NUMBERS[file.mimetype];
    if (!expectedMagic) {
      return;
    }

    const actualMagic = Array.from(file.buffer.slice(0, expectedMagic.length));
    const matches = actualMagic.every(
      (byte, index) => byte === expectedMagic[index],
    );

    if (!matches) {
      this.logger.warn(`Magic number mismatch for: ${file.mimetype}`);
      throw new BadRequestException('Invalid file type');
    }
  }

  private sanitizePath(path: string): string {
    return path
      .split('/')
      .filter((segment) => segment.trim() !== '')
      .map((segment) => segment.replace(/\.\./g, ''))
      .join('/');
  }

  private generateUniquePath(path: string, filename: string): string {
    const timestamp = Date.now();
    const uuid = crypto.randomUUID();
    const ext = filename.split('.').pop();
    return `${path}/${timestamp}-${uuid}.${ext}`;
  }

  private async bucketExists(bucket: string): Promise<boolean> {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: 'check',
    });

    try {
      await this.client.send(command);
      return true;
    } catch (error) {
      if (this.isNotFoundError(error) || this.isNoSuchBucketError(error)) {
        return false;
      }
      throw error;
    }
  }

  private async createBucket(bucket: string): Promise<void> {
    const createCommand = new CreateBucketCommand({
      Bucket: bucket,
    });

    await this.client.send(createCommand);

    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetBucketLocation', 's3:ListBucket'],
          Resource: [`arn:aws:s3:::${bucket}`],
        },
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucket}/*`],
        },
      ],
    };

    const policyCommand = new PutBucketPolicyCommand({
      Bucket: bucket,
      Policy: JSON.stringify(policy),
    });

    await this.client.send(policyCommand);
    this.logger.log(`Bucket ${bucket} created with public read access`);
  }

  private isNotFoundError(error: any): boolean {
    return error.name === 'NotFound' || error.name === 'NoSuchKey';
  }

  private isNoSuchBucketError(error: any): boolean {
    return error.name === 'NoSuchBucket';
  }
}
