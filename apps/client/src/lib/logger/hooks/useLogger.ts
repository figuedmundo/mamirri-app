import { useEffect, useRef } from 'react';
import { logger } from '../logger';

export function useLogger(componentName: string) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    logger.debug(`[${componentName}] Mounted`);
    return () => {
      logger.debug(`[${componentName}] Unmounted`);
    };
  }, [componentName]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    logger.debug(`[${componentName}] Updated`);
  });

  return logger;
}
