import { useEffect, useState } from 'react';
import { useServiceWorker } from '../../hooks/useServiceWorker';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { ToastAction } from '../ui/toast';

export function UpdateNotification() {
  const { isUpdateAvailable, updateServiceWorker } = useServiceWorker();
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isUpdateAvailable && !dismissed) {
      toast({
        title: 'Nueva versión disponible',
        description:
          'Hay una nueva versión de la aplicación. Actualiza para obtener las últimas mejoras.',
        duration: Infinity,
        action: (
          <div className="flex gap-2">
            <ToastAction altText="Más tarde" onClick={() => setDismissed(true)}>
              Más tarde
            </ToastAction>
            <Button size="sm" onClick={updateServiceWorker}>
              Actualizar ahora
            </Button>
          </div>
        ),
      });
    }
  }, [isUpdateAvailable, dismissed, toast, updateServiceWorker]);

  return null;
}
