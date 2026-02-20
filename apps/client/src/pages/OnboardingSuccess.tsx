import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Building2, Users, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

interface LocationState {
  clinicName: string;
}

export default function OnboardingSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const clinicName = state?.clinicName || 'Tu Clínica';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-[600px]">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">
            ¡Bienvenido a {clinicName}!
          </CardTitle>
          <CardDescription>
            Tu clínica ha sido creada exitosamente. Ahora estás conectado como
            el propietario de la clínica.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => navigate('/pacientes')}
            >
              <CardContent className="p-4 text-center">
                <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium text-sm">Crear Primer Paciente</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Comienza agregando tu primer paciente
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => navigate('/clinica')}
            >
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium text-sm">Invitar a tu Equipo</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Agrega fisioterapeutas y personal
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => navigate('/ajustes')}
            >
              <CardContent className="p-4 text-center">
                <Settings className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium text-sm">Configurar Ajustes</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Personaliza el perfil de tu clínica
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="pt-4">
            <Button
              onClick={() => navigate('/')}
              className="w-full h-12 text-lg"
            >
              Ir al Panel de Control →
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Siempre puedes acceder a estas opciones desde el menú principal
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
