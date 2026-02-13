import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { initSentry } from './lib/sentry-init';

// Wrapper component to defer Sentry initialization after first render
function AppWithSentry() {
  useEffect(() => {
    // Defer Sentry initialization to after app mounts for faster initial render
    initSentry().catch((error) => {
      // Graceful degradation - app continues even if Sentry fails
      console.error('Sentry initialization failed:', error);
    });
  }, []);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithSentry />
  </StrictMode>,
);
