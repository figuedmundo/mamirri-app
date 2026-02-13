import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AiAnalysisModule } from './ai-analysis.module';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';
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

describe('AiAnalysis Feedback API', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let therapistId: string;
  let analysisId: string;

  const mockUser = { userId: 'therapist-1' };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        KnowledgeBaseModule,
        AiAnalysisModule,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    const user = await prisma.user.upsert({
      where: { email: 'therapist-1@example.com' },
      update: {},
      create: {
        id: 'therapist-1',
        email: 'therapist-1@example.com',
        name: 'Test Therapist',
        passwordHash: 'hash',
      },
    });
    therapistId = user.id;

    const patient = await prisma.patient.create({
      data: {
        name: 'Test Patient',
        occupation: 'Tester',
        phone: '123',
        birthDate: new Date(),
        therapistId,
      },
    });

    const clinicalCase = await prisma.clinicalCase.create({
      data: {
        patientId: patient.id,
        title: 'Test Case',
        consultationReason: 'Test',
        startDate: new Date(),
        status: 'ACTIVE',
      },
    });

    const analysis = await (prisma as any).aiAnalysis.create({
      data: {
        clinicalCaseId: clinicalCase.id,
        therapistId,
        result: { foo: 'bar' },
      },
    });
    analysisId = analysis.id;
  }, 30000);

  afterAll(async () => {
    if (therapistId) {
      await prisma.user.delete({ where: { id: therapistId } });
    }
    await app.close();
  });

  it('3.1 should PUT feedback for a suggestion (upsert)', async () => {
    const response = await request(app.getHttpServer())
      .put(`/ai/analyses/${analysisId}/suggestions/0/feedback`)
      .send({ isPositive: true, comment: 'Great!' });

    expect(response.status).toBe(200);
    expect(response.body.isPositive).toBe(true);
    expect(response.body.comment).toBe('Great!');
    expect(response.body.suggestionIndex).toBe(0);
  });

  it('3.2 should update existing feedback', async () => {
    await request(app.getHttpServer())
      .put(`/ai/analyses/${analysisId}/suggestions/0/feedback`)
      .send({ isPositive: false, comment: 'Actually not good' });

    const response = await request(app.getHttpServer()).get(
      `/ai/analyses/${analysisId}/feedback`,
    );

    expect(response.status).toBe(200);
    const feedback = response.body.find((f) => f.suggestionIndex === 0);
    expect(feedback.isPositive).toBe(false);
    expect(feedback.comment).toBe('Actually not good');
  });

  it('3.3 should DELETE feedback', async () => {
    const response = await request(app.getHttpServer()).delete(
      `/ai/analyses/${analysisId}/suggestions/0/feedback`,
    );

    expect(response.status).toBe(204);

    const checkResponse = await request(app.getHttpServer()).get(
      `/ai/analyses/${analysisId}/feedback`,
    );
    const feedback = checkResponse.body.find((f) => f.suggestionIndex === 0);
    expect(feedback).toBeUndefined();
  });

  it('3.4 should return 403 when analysis belongs to another therapist', async () => {
    const otherTherapist = await prisma.user.create({
      data: {
        email: `other-${Date.now()}@example.com`,
        name: 'Other',
        passwordHash: 'hash',
      },
    });

    const otherPatient = await prisma.patient.create({
      data: {
        name: 'Other Patient',
        occupation: 'Tester',
        phone: '123',
        birthDate: new Date(),
        therapistId: otherTherapist.id,
      },
    });

    const otherCase = await prisma.clinicalCase.create({
      data: {
        patientId: otherPatient.id,
        title: 'Other Case',
        consultationReason: 'Test',
        startDate: new Date(),
        status: 'ACTIVE',
      },
    });

    const otherAnalysis = await (prisma as any).aiAnalysis.create({
      data: {
        clinicalCaseId: otherCase.id,
        therapistId: otherTherapist.id,
        result: { foo: 'bar' },
      },
    });

    const response = await request(app.getHttpServer())
      .put(`/ai/analyses/${otherAnalysis.id}/suggestions/0/feedback`)
      .send({ isPositive: true });

    expect(response.status).toBe(403);

    await prisma.user.delete({ where: { id: otherTherapist.id } });
  });

  it('3.5 should return 404 for nonexistent analysis', async () => {
    const response = await request(app.getHttpServer())
      .put(`/ai/analyses/nonexistent-id/suggestions/0/feedback`)
      .send({ isPositive: true });

    expect(response.status).toBe(404);
  });
});
