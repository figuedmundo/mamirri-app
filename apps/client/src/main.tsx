import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './index.css';
import App from './App.tsx';

// Initialize Sentry for error monitoring
// Get DSN from environment variable or use empty string (Sentry will be disabled if no DSN)
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    // Session Replay - only capture 10% of sessions in production
    replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 0.0,
    // Always capture 100% of sessions with errors
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    // PII Scrubbing for clinical data protection
    beforeSend(event) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['Cookie'];
      }
      // Remove potentially sensitive URL parameters
      if (event.request?.url) {
        const url = new URL(event.request.url);
        // Remove common sensitive params
        const sensitiveParams = ['token', 'password', 'secret', 'api_key'];
        sensitiveParams.forEach((param) => url.searchParams.delete(param));
        event.request.url = url.toString();
      }
      return event;
    },
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
