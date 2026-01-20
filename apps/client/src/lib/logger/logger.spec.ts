import { Logger } from './logger';
import { LogLevel } from '@mamirri/logger';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';

describe('Frontend Logger', () => {
  let logger: Logger;
  const mockConfig = {
    level: LogLevel.INFO,
    format: 'json' as const,
    output: 'console' as const,
    serviceName: 'client',
    version: '1.0.0',
    environment: 'test',
  };

  beforeEach(() => {
    localStorage.clear(); // Clear queue from storage
    logger = new Logger(mockConfig);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log messages above threshold', () => {
    logger.debug('debug');
    logger.info('info');

    expect(console.log).toHaveBeenCalledTimes(1); // Only info
    // The implementation calls console.log("%c[INFO] info", "color: green", object)
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('info'),
      expect.stringContaining('color: green'),
      expect.anything(),
    );
  });

  it('should inject context', () => {
    logger.info('test');

    // Check the 3rd argument which is the log object
    expect(console.log).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        service: 'client',
        message: 'test',
      }),
    );
  });

  it('should queue messages when offline', () => {
    // Mock navigator.onLine getter
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: () => false,
    });

    logger.info('offline message');

    expect(
      (logger as unknown as { queue: { length: number } }).queue.length,
    ).toBe(1);
  });

  it('should flush queue when coming back online', async () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: () => false,
    });

    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      status: 201,
    } as Response);

    logger.info('queued message');
    expect(
      (logger as unknown as { queue: { length: number } }).queue.length,
    ).toBe(1);

    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: () => true,
    });
    window.dispatchEvent(new Event('online'));

    await vi.waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/v1/logs',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });
  });
});
