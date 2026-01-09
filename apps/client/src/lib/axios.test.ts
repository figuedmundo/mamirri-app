import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { Mock } from 'vitest';

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => {
        const instance: any = vi.fn(() =>
          Promise.resolve({ data: 'mock data' }),
        );
        instance.interceptors = {
          request: { use: vi.fn(), eject: vi.fn() },
          response: { use: vi.fn(), eject: vi.fn() },
        };
        instance.defaults = { headers: { common: {} } };
        instance.get = vi.fn();
        instance.post = vi.fn();
        return instance;
      }),
    },
    isAxiosError: actual.isAxiosError,
  };
});

vi.mock('@/lib/toast', () => ({
  showErrorToast: vi.fn(),
}));

describe('Axios Interceptor', () => {
  let requestInterceptor: (
    config: InternalAxiosRequestConfig,
  ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
  let responseSuccessInterceptor: (response: AxiosResponse) => AxiosResponse;
  let responseErrorInterceptor: (error: any) => any;

  let mockAxiosInstance: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.resetModules();

    const mockFn: any = vi.fn(() => Promise.resolve({ data: 'retry success' }));

    mockFn.interceptors = {
      request: {
        use: vi.fn((onFulfilled) => {
          requestInterceptor = onFulfilled;
          return 1;
        }),
      },
      response: {
        use: vi.fn((onFulfilled, onRejected) => {
          responseSuccessInterceptor = onFulfilled;
          responseErrorInterceptor = onRejected;
          return 1;
        }),
      },
    };
    mockFn.defaults = { headers: { common: {} } };
    mockFn.post = vi.fn();
    mockFn.request = vi.fn();

    mockAxiosInstance = mockFn;

    (axios.create as Mock).mockReturnValue(mockAxiosInstance);

    await import('./axios');
  });

  it('Request Interceptor: should inject Bearer token from localStorage', async () => {
    localStorage.setItem('access_token', 'test-token');

    const config = { headers: {} } as InternalAxiosRequestConfig;
    const result = await requestInterceptor(config);

    const headers = result.headers as any;
    expect(headers.Authorization).toBe('Bearer test-token');
  });

  it('Response Interceptor: should not intercept successful responses', () => {
    const response = { status: 200, data: 'success' } as AxiosResponse;
    const result = responseSuccessInterceptor(response);
    expect(result).toBe(response);
  });

  it('Response Interceptor: should refresh token on 401 response', async () => {
    const newToken = 'new-access-token';
    mockAxiosInstance.post.mockResolvedValue({
      status: 200,
      data: { access_token: newToken },
    });

    mockAxiosInstance.request.mockResolvedValue({
      status: 200,
      data: 'retried success',
    });

    const originalRequest = {
      url: '/api/v1/protected',
      headers: {},
    };

    const error = {
      config: originalRequest,
      response: { status: 401 },
      isAxiosError: true,
    };

    const result = await responseErrorInterceptor(error);

    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/refresh');
    expect(localStorage.getItem('access_token')).toBe(newToken);

    expect((originalRequest.headers as any)['Authorization']).toBe(
      `Bearer ${newToken}`,
    );
    expect(mockAxiosInstance).toHaveBeenCalledWith(originalRequest);

    expect(result).toEqual({ data: 'retry success' });
  });

  it('Response Interceptor: should logout on failed refresh', async () => {
    mockAxiosInstance.post.mockRejectedValue({
      response: { status: 401 },
    });

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });

    const error = {
      config: { url: '/api/v1/protected', headers: {} },
      response: { status: 401 },
      isAxiosError: true,
    };

    try {
      await responseErrorInterceptor(error);
    } catch (e) {}

    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/refresh');
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('Response Interceptor: should NOT intercept 401 on refresh endpoint itself', async () => {
    const error = {
      config: { url: '/api/v1/auth/refresh', headers: {} },
      response: { status: 401 },
      isAxiosError: true,
    };

    try {
      await responseErrorInterceptor(error);
    } catch (e) {
      expect(e).toBe(error);
    }

    expect(mockAxiosInstance.post).not.toHaveBeenCalled();
  });

  it('should show error toast for 403 Forbidden errors', async () => {
    const error = {
      config: { url: '/api/v1/protected', headers: {} },
      response: {
        status: 403,
        data: { message: 'Access denied' },
        headers: {},
      },
      isAxiosError: true,
    };

    try {
      await responseErrorInterceptor(error);
    } catch (e) {}

    const { showErrorToast } = await import('./toast');
    expect(showErrorToast).toHaveBeenCalledWith(
      expect.stringContaining("You don't have permission"),
    );
  });

  it('should show error toast for 404 Not Found errors', async () => {
    const error = {
      config: { url: '/api/v1/resource', headers: {} },
      response: {
        status: 404,
        data: { message: 'Not found' },
        headers: {},
      },
      isAxiosError: true,
    };

    try {
      await responseErrorInterceptor(error);
    } catch (e) {}

    const { showErrorToast } = await import('./toast');
    expect(showErrorToast).toHaveBeenCalledWith(
      expect.stringContaining('Resource not found'),
    );
  });

  it('should show error toast for 500 Internal Server errors', async () => {
    const error = {
      config: { url: '/api/v1/resource', headers: {} },
      response: {
        status: 500,
        data: { message: 'Server error' },
        headers: {},
      },
      isAxiosError: true,
    };

    try {
      await responseErrorInterceptor(error);
    } catch (e) {}

    const { showErrorToast } = await import('./toast');
    expect(showErrorToast).toHaveBeenCalledWith(
      expect.stringContaining('Something went wrong'),
    );
  });

  it('should show correlation ID in toast when present', async () => {
    const correlationId = '123e4567-e89b-12d3-a456-426614174000';

    const error = {
      config: { url: '/api/v1/resource', headers: {} },
      response: {
        status: 500,
        data: { message: 'Server error' },
        headers: { 'x-correlation-id': correlationId },
      },
      isAxiosError: true,
    };

    try {
      await responseErrorInterceptor(error);
    } catch (e) {}

    const { showErrorToast } = await import('./toast');
    expect(showErrorToast).toHaveBeenCalledWith(
      expect.stringContaining(`Ref: ${correlationId}`),
    );
  });

  it('should handle network errors', async () => {
    const error = {
      config: { url: '/api/v1/resource', headers: {} },
      isAxiosError: true,
      response: undefined,
    };

    try {
      await responseErrorInterceptor(error);
    } catch (e) {}

    const { showErrorToast } = await import('./toast');
    expect(showErrorToast).toHaveBeenCalledWith(
      expect.stringContaining('Network error'),
    );
  });

  it('Response Interceptor: should NOT intercept 401 on refresh endpoint itself', async () => {
    const error = {
      config: { url: '/api/v1/auth/refresh', headers: {} },
      response: { status: 401 },
      isAxiosError: true,
    };

    try {
      await responseErrorInterceptor(error);
    } catch (e) {
      expect(e).toBe(error);
    }

    expect(mockAxiosInstance.post).not.toHaveBeenCalled();
  });

  it('should show error toast for 403 Forbidden errors', async () => {
    const error = {
      config: { url: '/api/v1/protected', headers: {} },
      response: {
        status: 403,
        data: { message: 'Access denied' },
        headers: {},
      },
      isAxiosError: true,
    };

    try {
      await responseErrorInterceptor(error);
    } catch (e) {
      // expected
    }

    const { showErrorToast } = await import('./toast');
    expect(showErrorToast).toHaveBeenCalledWith(
      expect.stringContaining("You don't have permission"),
    );
  });

  it('should show error toast for 404 Not Found errors', async () => {
    const error = {
      config: { url: '/api/v1/resource', headers: {} },
      response: {
        status: 404,
        data: { message: 'Not found' },
        headers: {},
      },
      isAxiosError: true,
    };

    try {
      await responseErrorInterceptor(error);
    } catch (e) {
      // expected
    }

    const { showErrorToast } = await import('./toast');
    expect(showErrorToast).toHaveBeenCalledWith(
      expect.stringContaining('Resource not found'),
    );
  });

  it('should show error toast for 500 Internal Server errors', async () => {
    const error = {
      config: { url: '/api/v1/resource', headers: {} },
      response: {
        status: 500,
        data: { message: 'Server error' },
        headers: {},
      },
      isAxiosError: true,
    };

    try {
      await responseErrorInterceptor(error);
    } catch (e) {
      // expected
    }

    const { showErrorToast } = await import('./toast');
    expect(showErrorToast).toHaveBeenCalledWith(
      expect.stringContaining('Something went wrong'),
    );
  });

  it('should show correlation ID in toast when present', async () => {
    const correlationId = '123e4567-e89b-12d3-a456-426614174000';

    const error = {
      config: { url: '/api/v1/resource', headers: {} },
      response: {
        status: 500,
        data: { message: 'Server error' },
        headers: { 'x-correlation-id': correlationId },
      },
      isAxiosError: true,
    };

    try {
      await responseErrorInterceptor(error);
    } catch (e) {
      // expected
    }

    const { showErrorToast } = await import('./toast');
    expect(showErrorToast).toHaveBeenCalledWith(
      expect.stringContaining(`Ref: ${correlationId}`),
    );
  });

  it('should handle network errors', async () => {
    const error = {
      config: { url: '/api/v1/resource', headers: {} },
      isAxiosError: true,
      response: undefined,
    };

    try {
      await responseErrorInterceptor(error);
    } catch (e) {
      // expected
    }

    const { showErrorToast } = await import('./toast');
    expect(showErrorToast).toHaveBeenCalledWith(
      expect.stringContaining('Network error'),
    );
  });
});
