import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    const correlationId = request.headers['x-correlation-id'] as
      | string
      | undefined;

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let error = 'Internal Server Error';
    let details: string[] | undefined = undefined;

    // 1. Handle HttpException
    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        const respObj = response as any;
        message = respObj.message || message;
        error = respObj.error || HttpStatus[httpStatus];
        if (Array.isArray(respObj.message)) {
          details = respObj.message;
          message = 'Validation Error';
        }
      }
    }
    // 2. Handle Prisma Errors
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          httpStatus = HttpStatus.CONFLICT;
          message = 'Unique constraint failed';
          error = 'Conflict';
          break;
        case 'P2025':
          httpStatus = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          error = 'Not Found';
          break;
        case 'P2003':
          httpStatus = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint violation';
          error = 'Bad Request';
          break;
        case 'P2014':
          httpStatus = HttpStatus.BAD_REQUEST;
          message = 'Change would violate required relation';
          error = 'Bad Request';
          break;
        case 'P2000':
          httpStatus = HttpStatus.BAD_REQUEST;
          message = 'Value out of range for column';
          error = 'Bad Request';
          break;
        case 'P2023':
          httpStatus = HttpStatus.BAD_REQUEST;
          message = 'Inconsistent column data';
          error = 'Bad Request';
          break;
        case 'P2011':
          httpStatus = HttpStatus.BAD_REQUEST;
          message = 'Null constraint violation';
          error = 'Bad Request';
          break;
        case 'P2013':
          httpStatus = HttpStatus.BAD_REQUEST;
          message = 'Missing required value';
          error = 'Bad Request';
          break;
        default:
          httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
          break;
      }
    }

    // 3. Prepare Response Body
    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: message,
      error: error,
      details: details,
      correlationId: correlationId,
    };

    // 4. Log appropriately
    const correlationLog = correlationId
      ? ` Correlation ID: ${correlationId}`
      : '';
    if (httpStatus >= 500) {
      console.error('CRITICAL EXCEPTION:', exception);
      this.logger.error(
        `Http Status: ${httpStatus} Error Message: ${message}${correlationLog}`,
        exception instanceof Error ? exception.stack : '',
      );
    } else {
      this.logger.warn(
        `Http Status: ${httpStatus} Error Message: ${message} Path: ${responseBody.path}${correlationLog}`,
      );
    }

    // 5. Send Response
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
