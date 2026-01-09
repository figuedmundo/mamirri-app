import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from './../src/common/filters/all-exceptions.filter';

describe('Global Error Handling (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Reproduce the global filter setup from main.ts
    const httpAdapter = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return standard JSON error for 404 Not Found', () => {
    return request(app.getHttpServer())
      .get('/api/v1/random-non-existent-route')
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            statusCode: 404,
            message: expect.stringContaining('Cannot GET'),
            error: 'Not Found',
            timestamp: expect.any(String),
            path: '/api/v1/random-non-existent-route',
          }),
        );
      });
  });
});
