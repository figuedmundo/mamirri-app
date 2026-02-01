import { useState, useEffect, useCallback } from 'react';

export function useServiceWorker() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null,
  );
  const [showReload, setShowReload] = useState(false);

  const onSWUpdate = useCallback((registration: ServiceWorkerRegistration) => {
    // Schedule state update to avoid synchronous setState in effect
    setTimeout(() => {
      setShowReload(true);
      setWaitingWorker(registration.waiting);
    }, 0);
  }, []);

  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');

        if (registration.waiting) {
          onSWUpdate(registration);
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                onSWUpdate(registration);
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, [onSWUpdate]);

  useEffect(() => {
    registerServiceWorker();
  }, [registerServiceWorker]);

  const updateServiceWorker = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [waitingWorker]);

  return {
    waitingWorker,
    showReload,
    updateServiceWorker,
    isUpdateAvailable: !!waitingWorker,
  };
}
