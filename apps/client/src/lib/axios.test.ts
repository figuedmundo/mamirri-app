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
    } catch (e) {
      // expected
    }

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
});
