import { onCLS, onLCP, onINP, type Metric } from 'web-vitals';
import { logger } from '../logger';

export function usePerformanceLogger() {
  const reportHandler = (metric: Metric) => {
    logger.info(`Web Vitals: ${metric.name}`, {
      metric: metric.name,
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      rating: metric.rating,
    });
  };

  if (typeof window !== 'undefined') {
    onCLS(reportHandler);
    onLCP(reportHandler);
    onINP(reportHandler);
  }
}
