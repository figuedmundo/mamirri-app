import { toast } from '@/hooks/use-toast';

export const showToast = (
  message: string,
  variant: 'success' | 'error' | 'warning' | 'info' = 'info',
) => {
  toast({
    title: message,
    variant: variant === 'error' ? 'destructive' : 'default',
  });
};

export const showSuccessToast = (message: string) => {
  showToast(message, 'success');
};

export const showErrorToast = (message: string) => {
  showToast(message, 'error');
};

export const showWarningToast = (message: string) => {
  showToast(message, 'warning');
};

export const showInfoToast = (message: string) => {
  showToast(message, 'info');
};
