import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env'), quiet: true });

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('${')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
    '${POSTGRES_USER}',
    process.env.POSTGRES_USER || '',
  )
    .replace('${POSTGRES_PASSWORD}', process.env.POSTGRES_PASSWORD || '')
    .replace('${POSTGRES_PORT}', process.env.POSTGRES_PORT || '5432')
    .replace('${POSTGRES_DB}', process.env.POSTGRES_DB || '');
}

describe('User Profile Fields', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: path.resolve(process.cwd(), '../../.env'),
        }),
        PrismaModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
    }
    if (prisma && typeof prisma.$disconnect === 'function') {
      await prisma.$disconnect();
    }
    if (app && typeof app.close === 'function') {
      await app.close();
    }
  });

  it('should create User with all new profile fields nullable and persist correctly', async () => {
    const userData: any = {
      email: `therapist-profile-${Date.now()}@example.com`,
      passwordHash: 'hashedpassword',
      name: 'Profile Test Therapist',
      phone: '+34 612 345 678',
      profilePhotoUrl: 'https://example.com/photos/therapist.jpg',
      clinicName: 'Fisioterapia Centro',
      licenseNumber: 'COL-12345',
      specialty: 'Fisioterapia Deportiva',
      yearsExperience: 10,
    };

    const user = (await prisma.user.create({
      data: userData,
    })) as any;

    testUserId = user.id;

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.phone).toBe(userData.phone);
    expect(user.profilePhotoUrl).toBe(userData.profilePhotoUrl);
    expect(user.clinicName).toBe(userData.clinicName);
    expect(user.licenseNumber).toBe(userData.licenseNumber);
    expect(user.specialty).toBe(userData.specialty);
    expect(user.yearsExperience).toBe(userData.yearsExperience);
  });

  it('should create User with null values for all new profile fields', async () => {
    const userData: any = {
      email: `therapist-null-${Date.now()}@example.com`,
      passwordHash: 'hashedpassword',
      name: 'Null Profile Therapist',
    };

    const user = (await prisma.user.create({
      data: userData,
    })) as any;

    const nullUserId = user.id;

    expect(user).toBeDefined();
    expect(user.phone).toBeNull();
    expect(user.profilePhotoUrl).toBeNull();
    expect(user.clinicName).toBeNull();
    expect(user.licenseNumber).toBeNull();
    expect(user.specialty).toBeNull();
    expect(user.yearsExperience).toBeNull();

    await prisma.user.delete({ where: { id: nullUserId } });
  });

  it('should store valid URL string in profilePhotoUrl field', async () => {
    const testUrls = [
      'https://example.com/profile.jpg',
      'https://cdn.example.com/therapists/123.png',
      'https://storage.example.com/bucket/user-456/photo.jpeg',
    ];

    for (const url of testUrls) {
      const userData: any = {
        email: `therapist-url-${Date.now()}-${Math.random()}@example.com`,
        passwordHash: 'hashedpassword',
        name: 'URL Test Therapist',
        profilePhotoUrl: url,
      };

      const user = (await prisma.user.create({
        data: userData,
      })) as any;

      const urlUserId = user.id;

      expect(user.profilePhotoUrl).toBe(url);
      expect(typeof user.profilePhotoUrl).toBe('string');

      await prisma.user.delete({ where: { id: urlUserId } });
    }
  });

  it('should accept integer values for yearsExperience field', async () => {
    const testValues = [0, 1, 5, 10, 25, 40];

    for (const years of testValues) {
      const userData: any = {
        email: `therapist-years-${Date.now()}-${Math.random()}@example.com`,
        passwordHash: 'hashedpassword',
        name: 'Years Test Therapist',
        yearsExperience: years,
      };

      const user = (await prisma.user.create({
        data: userData,
      })) as any;

      const yearsUserId = user.id;

      expect(user.yearsExperience).toBe(years);
      expect(typeof user.yearsExperience).toBe('number');
      expect(Number.isInteger(user.yearsExperience)).toBe(true);

      await prisma.user.delete({ where: { id: yearsUserId } });
    }
  });
});
