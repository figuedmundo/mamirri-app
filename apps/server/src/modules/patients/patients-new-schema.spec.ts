import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('${')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
    '${POSTGRES_USER}',
    process.env.POSTGRES_USER || '',
  )
    .replace('${POSTGRES_PASSWORD}', process.env.POSTGRES_PASSWORD || '')
    .replace('${POSTGRES_PORT}', process.env.POSTGRES_PORT || '5432')
    .replace('${POSTGRES_DB}', process.env.POSTGRES_DB || '');
}

describe('Patients New Schema Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let therapistId: string;

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

    const therapist = await prisma.user.create({
      data: {
        email: `therapist-new-schema-${Date.now()}@example.com`,
        passwordHash: 'hashedpassword',
        name: 'Schema Test Therapist',
      },
    });
    therapistId = therapist.id;
  }, 30000);

  afterAll(async () => {
    if (therapistId) {
      await prisma.patient.deleteMany({ where: { therapistId } });
      await prisma.user.delete({ where: { id: therapistId } });
    }
    if (prisma && typeof prisma.$disconnect === 'function') {
      await prisma.$disconnect();
    }
    if (app && typeof app.close === 'function') {
      await app.close();
    }
  });

  it('should create a patient with new schema fields (emergencyContact, referralSource, medicalFlags)', async () => {
    const patientData: any = {
      name: 'New Schema Patient',
      occupation: 'Developer',
      phone: '1234567890',
      birthDate: new Date('1990-01-01'),
      therapistId,
      emergencyContact: {
        name: 'Jane Doe',
        phone: '9876543210',
      },
      referralSource: 'Instagram',
      medicalFlags: ['Diabetes', 'Hipertensión'],
    };

    const patient = (await prisma.patient.create({
      data: patientData,
    })) as any;

    expect(patient).toBeDefined();
    expect(patient.emergencyContact).toEqual(patientData.emergencyContact);
    expect(patient.referralSource).toBe(patientData.referralSource);
    expect(patient.medicalFlags).toEqual(
      expect.arrayContaining(patientData.medicalFlags),
    );
    expect(patient.age).toBeUndefined();
    expect(patient.address).toBeUndefined();
  });

  it('should fail if emergencyContact has invalid structure (handled at application level, but testing DB storage)', async () => {
    const patientData: any = {
      name: 'JSON Test Patient',
      occupation: 'Tester',
      phone: '1112223333',
      birthDate: new Date('1985-05-05'),
      therapistId,
      emergencyContact: 'Invalid JSON structure',
      referralSource: 'Google',
      medicalFlags: [],
    };

    const patient = (await prisma.patient.create({
      data: patientData,
    })) as any;

    expect(patient.emergencyContact).toBe('Invalid JSON structure');
  });
});
