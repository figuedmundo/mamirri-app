import type {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { logger } from './logger';

export function setupInterceptors(instance: AxiosInstance) {
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const correlationId = logger.getCorrelationId();
    if (correlationId) {
      config.headers.set('X-Correlation-ID', correlationId);
    }

    const metadata: Record<string, unknown> = {
      method: config.method,
      url: config.url,
      params: config.params,
    };

    (
      config as InternalAxiosRequestConfig & { metadata: { startTime: number } }
    ).metadata = { startTime: Date.now() };

    logger.info(
      `API Request: ${config.method?.toUpperCase()} ${config.url}`,
      metadata,
    );

    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      const config = response.config as InternalAxiosRequestConfig & {
        metadata?: { startTime: number };
      };
      const duration = config.metadata
        ? Date.now() - config.metadata.startTime
        : undefined;

      logger.info(`API Response: ${response.status} ${response.config.url}`, {
        status: response.status,
        duration,
        url: response.config.url,
      });

      return response;
    },
    (error: AxiosError) => {
      const config = error.config as
        | (InternalAxiosRequestConfig & { metadata?: { startTime: number } })
        | undefined;
      const duration = config?.metadata
        ? Date.now() - config.metadata.startTime
        : undefined;

      const status = error.response?.status;
      const url = config?.url ?? '';
      const isExpectedLatestAnalysisMiss =
        status === 404 &&
        /\/ai\/cases\/[^/]+\/analyses\/latest(?:\?.*)?$/.test(url);

      if (isExpectedLatestAnalysisMiss) {
        logger.info('API Response: 404 latest analysis not found (expected)', {
          status,
          duration,
          url,
        });
        return Promise.reject(error);
      }

      logger.error(`API Error: ${error.message}`, error, {
        status,
        duration,
        url,
        code: error.code,
      });

      return Promise.reject(error);
    },
  );
}
