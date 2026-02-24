import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CircleX, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { clinicsApi } from '../api/clinics';
import { useAuth } from '../hooks/use-auth';

type InvitationDetails = {
  email: string;
  role: string;
  clinicName: string;
  expiresAt: string;
};

type ErrorType = 'expired' | 'used' | 'invalid' | 'generic';

export default function InvitationAcceptance() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState<InvitationDetails | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) {
        setErrorType('invalid');
        setIsLoading(false);
        return;
      }
      try {
        const invitation = await clinicsApi.getInvitation(token);
        setDetails(invitation as InvitationDetails);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        const message = error.response?.data?.message?.toLowerCase() || '';
        if (message.includes('expired')) {
          setErrorType('expired');
        } else if (message.includes('used') || message.includes('already')) {
          setErrorType('used');
        } else if (
          message.includes('not found') ||
          message.includes('invalid')
        ) {
          setErrorType('invalid');
        } else {
          setErrorType('generic');
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadInvitation();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !details) return;

    if (password !== confirmPassword) {
      setSubmitError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setSubmitError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await clinicsApi.acceptInvitation({
        token,
        name,
        email: details.email,
        password,
        confirmPassword,
        licenseNumber: licenseNumber || undefined,
      });
      login(response.user, response.accessToken);
      navigate('/invite/success', {
        state: { clinicName: details.clinicName },
      });
    } catch {
      setSubmitError(
        'No se pudo aceptar la invitación. Por favor, inténtalo de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-[520px] shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Verificando invitación...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (errorType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-[520px] shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            {errorType === 'expired' && (
              <>
                <CircleX className="h-16 w-16 text-red-500 mb-4" />
                <CardTitle className="text-xl mb-2">
                  Esta invitación ha expirado
                </CardTitle>
                <p className="text-muted-foreground mb-6">
                  Solicita una nueva invitación al dueño de la clínica.
                </p>
              </>
            )}
            {errorType === 'used' && (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <CardTitle className="text-xl mb-2">
                  Esta invitación ya fue utilizada
                </CardTitle>
                <p className="text-muted-foreground mb-6">
                  Ya tienes una cuenta con este email.
                </p>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full h-12"
                >
                  Ir a Iniciar Sesión
                </Button>
              </>
            )}
            {(errorType === 'invalid' || errorType === 'generic') && (
              <>
                <AlertCircle className="h-16 w-16 text-yellow-500 mb-4" />
                <CardTitle className="text-xl mb-2">
                  Invitación no válida
                </CardTitle>
                <p className="text-muted-foreground mb-6">
                  Contacta con tu clínica para obtener una nueva invitación.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleDisplay =
    details?.role === 'CLINIC_OWNER'
      ? 'Propietario de Clínica'
      : 'Fisioterapeuta';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-[520px] shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">
            Te invitamos a unirte a{' '}
            <span className="text-primary">{details?.clinicName}</span>
          </CardTitle>
          <p className="text-muted-foreground">
            como <strong>{roleDisplay}</strong>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre Completo <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Dra. María García"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Correo Electrónico
              </label>
              <Input
                id="email"
                type="email"
                value={details?.email || ''}
                disabled
                className="h-12 text-lg bg-muted"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña <span className="text-destructive">*</span>
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-lg"
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Debe tener al menos 6 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Contraseña <span className="text-destructive">*</span>
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 text-lg"
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-destructive">
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="licenseNumber" className="text-sm font-medium">
                Número de Licencia Profesional
              </label>
              <Input
                id="licenseNumber"
                type="text"
                placeholder="F-12345"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="h-12 text-lg"
              />
            </div>

            {submitError && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {submitError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-lg"
              disabled={
                isSubmitting ||
                !name ||
                password.length < 6 ||
                password !== confirmPassword
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear cuenta y entrar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
