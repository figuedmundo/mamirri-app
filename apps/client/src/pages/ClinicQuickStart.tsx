import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { InviteTherapistDialog } from '../components/clinic/InviteTherapistDialog';
import { clinicsApi } from '../api/clinics';
import { useAuth } from '../hooks/use-auth';

export default function ClinicQuickStart() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [inviteOpen, setInviteOpen] = useState(false);

  const clinicName =
    params.get('clinicName') || user?.clinicName || 'tu clínica';
  const clinicId = useMemo(
    () => params.get('clinicId') || user?.clinicId,
    [params, user?.clinicId],
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8">
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Bienvenido a {clinicName}!</h1>
          <p className="text-muted-foreground">
            Tu clínica está lista. Elige un siguiente paso.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Crear tu primer paciente</CardTitle>
              <CardDescription>
                Empieza registrando la ficha clínica inicial.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => navigate('/pacientes/nuevo')}
              >
                Ir a pacientes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invitar a tu equipo</CardTitle>
              <CardDescription>
                Agrega terapeutas para colaborar en casos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setInviteOpen(true)}
              >
                Invitar terapeuta
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurar clínica</CardTitle>
              <CardDescription>
                Ajusta datos de contacto y preferencias básicas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigate('/clinic/dashboard')}
              >
                Ir a configuración
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate('/')}>
            Saltar por ahora
          </Button>
        </div>
      </div>

      {clinicId ? (
        <InviteTherapistDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          onSubmit={async (payload) => {
            await clinicsApi.inviteTherapist(clinicId, payload);
          }}
        />
      ) : null}
    </div>
  );
}
