import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CorrelationIdInterceptor } from './correlation-id.interceptor';

describe('CorrelationIdInterceptor', () => {
  let interceptor: CorrelationIdInterceptor;

  const mockCallHandler: CallHandler = {
    handle: jest.fn().mockImplementation((data) => {
      return Promise.resolve({
        ...data,
        headers: {},
      } as any);
    }),
  };

  const mockExecutionContext: ExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        headers: {},
      }),
      getResponse: jest.fn().mockReturnValue({
        setHeader: jest.fn(),
      }),
    }),
    getClass: jest.fn(),
    getHandler: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getType: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorrelationIdInterceptor],
    }).compile();

    interceptor = module.get<CorrelationIdInterceptor>(
      CorrelationIdInterceptor,
    );
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should generate correlation ID and attach to request', async () => {
    const mockRequest: any = { headers: {} };
    (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn().mockReturnValue({ setHeader: jest.fn() }),
    });

    await interceptor.intercept(mockExecutionContext, mockCallHandler);

    expect(mockRequest.headers).toHaveProperty('x-correlation-id');
    expect(mockRequest.headers['x-correlation-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('should add correlation ID to response headers', async () => {
    const mockSetHeader = jest.fn();
    (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ headers: {} }),
      getResponse: jest.fn().mockReturnValue({ setHeader: mockSetHeader }),
    });

    await interceptor.intercept(mockExecutionContext, mockCallHandler);

    expect(mockSetHeader).toHaveBeenCalledWith(
      'X-Correlation-ID',
      expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      ),
    );
  });

  it('should preserve same correlation ID from request to response', async () => {
    const mockRequest: any = { headers: {} };
    const mockSetHeader = jest.fn();

    (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn().mockReturnValue({ setHeader: mockSetHeader }),
    });

    await interceptor.intercept(mockExecutionContext, mockCallHandler);

    const requestCorrelationId = mockRequest.headers['x-correlation-id'];
    const responseCorrelationIdCall = mockSetHeader.mock.calls[0][1];

    expect(requestCorrelationId).toBe(responseCorrelationIdCall);
  });

  it('should not modify request body or other headers', async () => {
    const mockRequest: any = {
      headers: {
        authorization: 'Bearer token',
        'content-type': 'application/json',
      },
      body: { data: 'test' },
    };
    (mockExecutionContext.switchToHttp as jest.Mock).mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn().mockReturnValue({ setHeader: jest.fn() }),
    });

    await interceptor.intercept(mockExecutionContext, mockCallHandler);

    expect(mockRequest.headers.authorization).toBe('Bearer token');
    expect(mockRequest.headers['content-type']).toBe('application/json');
    expect(mockRequest.body).toEqual({ data: 'test' });
  });
});
