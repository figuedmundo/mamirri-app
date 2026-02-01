import { useEffect, useState } from 'react';
import { WifiOff, CheckCircle } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { cn } from '../../lib/utils';

export function OfflineBanner() {
  const { isOffline, wasOffline, isOnline } = useOnlineStatus();
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setTimeout(() => setShowRestored(true), 0);
    } else if (isOffline) {
      setTimeout(() => setShowRestored(false), 0);
    }
  }, [isOnline, wasOffline, isOffline]);

  useEffect(() => {
    if (!showRestored) return;

    const timer = setTimeout(() => {
      setShowRestored(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showRestored]);

  if (isOffline) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className={cn(
          'fixed top-0 left-0 right-0 z-[99]',
          'flex items-center justify-center gap-2',
          'px-4 py-2 text-sm font-medium',
          'bg-amber-50 border-b border-amber-200 text-amber-800',
          'shadow-sm',
          'animate-in slide-in-from-top duration-300',
        )}
      >
        <WifiOff className="h-4 w-4" />
        <span>Sin conexión a internet</span>
      </div>
    );
  }

  if (showRestored) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className={cn(
          'fixed top-0 left-0 right-0 z-[99]',
          'flex items-center justify-center gap-2',
          'px-4 py-2 text-sm font-medium',
          'bg-green-50 border-b border-green-200 text-green-800',
          'shadow-sm',
          'animate-in slide-in-from-top duration-300',
          'animate-out slide-out-to-top duration-500 fade-out',
        )}
      >
        <CheckCircle className="h-4 w-4" />
        <span>Conexión restaurada</span>
      </div>
    );
  }

  return null;
}
