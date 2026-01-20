import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupInterceptors } from './axios-logger';
import axios from 'axios';
import { logger, Logger } from './logger';
import { LogLevel } from '@mamirri/logger';

describe('Frontend Integration', () => {
  beforeEach(() => {
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should intercept requests and log them', async () => {
    const instance = axios.create();
    setupInterceptors(instance);

    instance.defaults.adapter = async (config) => {
      return {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    };

    await instance.get('/test');

    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('API Request'),
      expect.objectContaining({
        method: 'get',
        url: '/test',
      }),
    );
  });

  it('should log response errors', async () => {
    const instance = axios.create();
    setupInterceptors(instance);

    instance.defaults.adapter = async () => {
      throw {
        response: {
          status: 500,
          data: { message: 'Server Error' },
          headers: {},
        },
        message: 'Request failed',
        config: {},
        isAxiosError: true,
      };
    };

    try {
      await instance.get('/test');
    } catch {
      // Expected
    }

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('API Error'),
      expect.anything(),
      expect.objectContaining({
        status: 500,
      }),
    );
  });

  it('should send logs to backend aggregation endpoint', async () => {
    const testLogger = new Logger({
      level: LogLevel.DEBUG,
      format: 'json',
      output: 'console',
      serviceName: 'test',
      version: '1.0.0',
      environment: 'production',
    });

    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      status: 201,
    } as Response);

    testLogger.info('test e2e flow');

    await vi.waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/v1/logs',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test e2e flow'),
        }),
      );
    });
  });
});
