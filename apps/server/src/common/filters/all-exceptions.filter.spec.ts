import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let httpAdapterHost: HttpAdapterHost;

  const mockHttpAdapter = {
    getRequestUrl: jest.fn().mockReturnValue('/test-url'),
    reply: jest.fn(),
  };

  const mockArgumentsHost = {
    switchToHttp: jest.fn().mockReturnValue({
      getResponse: jest.fn().mockReturnValue({}),
      getRequest: jest.fn().mockReturnValue({ headers: {} }),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllExceptionsFilter,
        {
          provide: HttpAdapterHost,
          useValue: { httpAdapter: mockHttpAdapter },
        },
      ],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
    httpAdapterHost = module.get<HttpAdapterHost>(HttpAdapterHost);

    // Silence logger for tests
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  it('should catch HttpException and return same status', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    filter.catch(exception, mockArgumentsHost as any);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
      }),
      HttpStatus.FORBIDDEN,
    );
  });

  it('should catch Prisma P2002 (Unique) and return 409 Conflict', () => {
    const exception = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint',
      {
        code: 'P2002',
        clientVersion: '1.0',
      },
    );

    filter.catch(exception, mockArgumentsHost as any);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        error: 'Conflict',
      }),
      HttpStatus.CONFLICT,
    );
  });

  it('should catch unknown errors and return 500 Internal Server Error', () => {
    const exception = new Error('Something broke');

    filter.catch(exception, mockArgumentsHost as any);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
      }),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });

  it('should catch Prisma P2014 and return 400 Bad Request', () => {
    const exception = new Prisma.PrismaClientKnownRequestError(
      'Relation violation',
      {
        code: 'P2014',
        clientVersion: '1.0',
      },
    );

    filter.catch(exception, mockArgumentsHost as any);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
      }),
      HttpStatus.BAD_REQUEST,
    );
  });

  it('should catch Prisma P2000 and return 400 Bad Request', () => {
    const exception = new Prisma.PrismaClientKnownRequestError(
      'Value out of range',
      {
        code: 'P2000',
        clientVersion: '1.0',
      },
    );

    filter.catch(exception, mockArgumentsHost as any);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
      }),
      HttpStatus.BAD_REQUEST,
    );
  });

  it('should catch Prisma P2023 and return 400 Bad Request', () => {
    const exception = new Prisma.PrismaClientKnownRequestError(
      'Inconsistent data',
      {
        code: 'P2023',
        clientVersion: '1.0',
      },
    );

    filter.catch(exception, mockArgumentsHost as any);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
      }),
      HttpStatus.BAD_REQUEST,
    );
  });

  it('should catch Prisma P2011 and return 400 Bad Request', () => {
    const exception = new Prisma.PrismaClientKnownRequestError(
      'Null constraint',
      {
        code: 'P2011',
        clientVersion: '1.0',
      },
    );

    filter.catch(exception, mockArgumentsHost as any);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
      }),
      HttpStatus.BAD_REQUEST,
    );
  });

  it('should catch Prisma P2013 and return 400 Bad Request', () => {
    const exception = new Prisma.PrismaClientKnownRequestError(
      'Missing required',
      {
        code: 'P2013',
        clientVersion: '1.0',
      },
    );

    filter.catch(exception, mockArgumentsHost as any);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
      }),
      HttpStatus.BAD_REQUEST,
    );
  });

  it('should include correlation ID in error response body', () => {
    const correlationId = '123e4567-e89b-12d3-a456-426614174000';
    const mockRequest = { headers: { 'x-correlation-id': correlationId } };
    (mockArgumentsHost.switchToHttp as jest.Mock).mockReturnValue({
      getResponse: jest.fn().mockReturnValue({}),
      getRequest: jest.fn().mockReturnValue(mockRequest),
    });

    const exception = new Error('Test error');

    filter.catch(exception, mockArgumentsHost as any);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        correlationId: correlationId,
      }),
      expect.any(Number),
    );
  });

  it('should handle missing correlation ID in request headers', () => {
    const mockRequest = { headers: {} };
    (mockArgumentsHost.switchToHttp as jest.Mock).mockReturnValue({
      getResponse: jest.fn().mockReturnValue({}),
      getRequest: jest.fn().mockReturnValue(mockRequest),
    });

    const exception = new Error('Test error');

    filter.catch(exception, mockArgumentsHost as any);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        correlationId: undefined,
      }),
      expect.any(Number),
    );
  });
});
