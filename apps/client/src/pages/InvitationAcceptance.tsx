import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

export default function InvitationAcceptance() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const { login } = useAuth();

  const [details, setDetails] = useState<InvitationDetails | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) {
        setError('Invitación inválida.');
        return;
      }
      try {
        const invitation = (await clinicsApi.getInvitation(
          token,
        )) as InvitationDetails;
        setDetails(invitation);
        setEmail(invitation.email);
      } catch {
        setError('No se pudo validar la invitación.');
      }
    };

    void loadInvitation();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Invitación inválida.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await clinicsApi.acceptInvitation({
        token,
        name,
        email,
        password,
        confirmPassword,
      });
      login(response.user, response.accessToken);
      navigate('/');
    } catch {
      setError('No se pudo aceptar la invitación.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Aceptar invitación</CardTitle>
        </CardHeader>
        <CardContent>
          {details ? (
            <p className="mb-4 text-sm text-slate-600">
              Te invitamos a unirte a <strong>{details.clinicName}</strong> como{' '}
              <strong>{details.role}</strong>.
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
              required
            />
            <Input value={email} disabled placeholder="Email" required />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar contraseña"
              required
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" className="w-full">
              Crear cuenta y entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
