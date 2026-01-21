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
  HeadBucketCommand,
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
  'audio/webm',
  'audio/mpeg',
  'audio/mp4',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

const SIZE_LIMITS: Record<string, number> = {
  'image/jpeg': 10 * 1024 * 1024,
  'image/png': 10 * 1024 * 1024,
  'image/webp': 10 * 1024 * 1024,
  'audio/wav': 25 * 1024 * 1024,
  'audio/webm': 25 * 1024 * 1024,
  'audio/mpeg': 25 * 1024 * 1024,
  'audio/mp4': 25 * 1024 * 1024,
  'video/mp4': 100 * 1024 * 1024,
  'video/webm': 100 * 1024 * 1024,
  'video/quicktime': 100 * 1024 * 1024,
};

const MAGIC_NUMBERS: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'audio/wav': [0x52, 0x49, 0x46, 0x46],
  'audio/webm': [0x1a, 0x45, 0xdf, 0xa3],
  'audio/mpeg': [0xff, 0xfb],
  'audio/mp4': [0x00, 0x00, 0x00],
  'video/mp4': [0x00, 0x00, 0x00], // ftyp box (checked specially)
  'video/webm': [0x1a, 0x45, 0xdf, 0xa3],
  'video/quicktime': [0x00, 0x00, 0x00], // ftyp or moov (checked specially)
};

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;

  constructor() {
    const config = storageConfig();
    this.logger.log(
      `Initializing S3 Client with endpoint: ${config.endpoint}:${config.port}`,
    );
    this.logger.log(`Using bucket: ${config.bucket}`);
    this.logger.log(
      `Access Key (first 3 chars): ${config.accessKey.substring(0, 3)}***`,
    );

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
      // Skip bucket creation/check if using ephemeral credentials or restricted access
      // Just try to use it or check if it exists but don't fail hard if we can't inspect it.
      // However, for development with MinIO we expect to own the instance.

      const exists = await this.bucketExists(bucket);

      if (!exists) {
        this.logger.log(`Bucket ${bucket} does not exist, creating...`);
        try {
          await this.createBucket(bucket);
        } catch (error: any) {
          // If creation fails but we suspect it might already exist or we lack permissions
          if (
            error.Code === 'BucketAlreadyOwnedByYou' ||
            error.Code === 'BucketAlreadyExists'
          ) {
            this.logger.log(`Bucket ${bucket} already exists (caught error)`);
          } else {
            this.logger.warn(
              `Could not create bucket: ${error.message}. This might be due to permissions or it already exists.`,
            );
            // Don't throw, let application start. Uploads might fail later if it truly doesn't exist.
          }
        }
      } else {
        this.logger.log(`Bucket ${bucket} already exists`);
      }
    } catch (error) {
      this.logger.error('Failed to initialize storage bucket', error);
      // Don't kill the app if storage is optional or transiently unavailable
      // throw new InternalServerErrorException('Storage initialization failed');
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

  async getFile(path: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: storageConfig().bucket,
      Key: path,
    });

    try {
      const response = await this.client.send(command);
      if (!response.Body) {
        throw new InternalServerErrorException('Empty file body');
      }
      const byteArray = await response.Body.transformToByteArray();
      return Buffer.from(byteArray);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        throw new NotFoundException('File not found');
      }
      this.logger.error(`Failed to get file: ${path}`, error);
      throw new InternalServerErrorException('Failed to get file');
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
    this.logger.log(
      `Validating file: ${file.originalname}, type: ${file.mimetype}, size: ${file.size}`,
    );

    const baseMimeType = file.mimetype.split(';')[0].trim();
    const limit = SIZE_LIMITS[baseMimeType] || 10 * 1024 * 1024;

    if (file.size > limit) {
      this.logger.warn(`File too large: ${file.size} bytes (limit: ${limit})`);
      throw new BadRequestException(
        `File size exceeds limit of ${limit / 1024 / 1024}MB`,
      );
    }

    if (!ALLOWED_MIMETYPES.includes(baseMimeType)) {
      this.logger.warn(
        `Invalid file type: ${file.mimetype} (base: ${baseMimeType})`,
      );
      throw new BadRequestException(`Invalid file type: ${file.mimetype}`);
    }

    this.validateMagicNumbers(file, baseMimeType);
  }

  private validateMagicNumbers(file: File, baseMimeType: string) {
    // Special handling for MP4/QuickTime (check for ftyp or moov)
    if (baseMimeType === 'video/mp4' || baseMimeType === 'video/quicktime') {
      const buffer = file.buffer;
      if (buffer.length < 8) return; // Too short

      // Check for 'ftyp' at offset 4
      const isFtyp =
        buffer[4] === 0x66 &&
        buffer[5] === 0x74 &&
        buffer[6] === 0x79 &&
        buffer[7] === 0x70;
      // Check for 'moov' at offset 4 (less common but valid)
      const isMoov =
        buffer[4] === 0x6d &&
        buffer[5] === 0x6f &&
        buffer[6] === 0x6f &&
        buffer[7] === 0x76;

      if (!isFtyp && !isMoov) {
        this.logger.warn(`Invalid MP4/MOV signature for: ${file.mimetype}`);
        throw new BadRequestException('Invalid file type');
      }
      return;
    }

    const expectedMagic = MAGIC_NUMBERS[baseMimeType];
    if (!expectedMagic) {
      return;
    }

    const actualMagic = Array.from(file.buffer.slice(0, expectedMagic.length));
    const matches = actualMagic.every(
      (byte, index) => byte === expectedMagic[index],
    );

    if (!matches) {
      this.logger.warn(
        `Magic number mismatch for: ${file.mimetype} (expected: ${expectedMagic.join(',')}, actual: ${actualMagic.join(',')})`,
      );
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
    const command = new HeadBucketCommand({
      Bucket: bucket,
    });

    try {
      await this.client.send(command);
      return true;
    } catch (error: any) {
      if (
        this.isNotFoundError(error) ||
        this.isNoSuchBucketError(error) ||
        error.$metadata?.httpStatusCode === 404 ||
        error.$metadata?.httpStatusCode === 403 // MinIO returns 403 for non-existent buckets with default policy
      ) {
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
