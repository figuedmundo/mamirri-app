import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

export default function Ajustes() {
  const { toast } = useToast();

  const handleClearCache = async () => {
    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));

        if ('serviceWorker' in navigator) {
          const registrations =
            await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
        }

        toast({
          title: 'Caché eliminada',
          description: 'La aplicación se recargará para aplicar los cambios.',
          variant: 'default',
        });

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        console.error('Error clearing cache:', error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar la caché.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
        Ajustes
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Configuración: idioma español/inglés, preferencias de IA, ajustes de
        voz.
      </p>

      <div className="space-y-6">
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Almacenamiento y Caché
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Si experimentas problemas con la aplicación, intentar borrar la
            caché puede ayudar. Esto forzará una recarga completa de la
            aplicación.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Borrar caché
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará todos los datos en caché de la
                  aplicación. La aplicación se recargará automáticamente y
                  necesitará descargar los recursos nuevamente. No perderás tus
                  datos guardados (pacientes, historias, etc.).
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearCache}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Sí, borrar caché
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
