import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../hooks/use-auth';
import axios from '../lib/axios';

export function ProfileNudgeBanner() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  const shouldShow =
    user?.role === 'THERAPIST' && !user?.profileNudgeDismissed && !isDismissed;

  if (!shouldShow) {
    return null;
  }

  const handleDismiss = async () => {
    setIsDismissing(true);
    try {
      await axios.patch('/users/me', { profileNudgeDismissed: true });
      updateUser({ profileNudgeDismissed: true });
      setIsDismissed(true);
    } catch {
      setIsDismissed(true);
    } finally {
      setIsDismissing(false);
    }
  };

  return (
    <div className="bg-primary/10 border-b px-4 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        <p className="text-sm">
          <strong>Completa tu perfil</strong> — Añade tu número de licencia y
          especialización
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" onClick={() => navigate('/perfil')} className="h-8">
            Completar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            disabled={isDismissing}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
