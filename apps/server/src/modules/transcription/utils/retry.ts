import { Logger } from '@nestjs/common';

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries: number; initialDelay?: number },
  logger?: Logger,
): Promise<T> {
  let attempt = 0;
  const initialDelay = options.initialDelay || 1000;

  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      if (attempt > options.maxRetries) {
        throw error;
      }

      let delay = Math.min(initialDelay * Math.pow(2, attempt - 1), 16000);

      const retryAfterHeader = error?.headers?.['retry-after'];
      if (retryAfterHeader) {
        const retryAfter = parseInt(retryAfterHeader, 10);
        if (!isNaN(retryAfter)) {
          delay = retryAfter * 1000;
        }
      }

      if (logger) {
        logger.warn(
          `Attempt ${attempt} failed. Retrying in ${delay}ms. Error: ${error.message}`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
