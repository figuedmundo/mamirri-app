import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Building2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { api } from '../lib/axios';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  const lastEmail = localStorage.getItem('last_user_email');
  const isManual = searchParams.get('manual') === 'true';

  if (isAuthenticated && !isLoading) {
    return <Navigate to="/" replace />;
  }

  if (lastEmail && !isManual && !isAuthenticated && !isLoading) {
    return <Navigate to="/pin-login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      login(response.data.user, response.data.accessToken);

      const hasClinic = !!response.data.user?.clinicId;
      const onboardingSkipped =
        localStorage.getItem('clinic_onboarding_skipped') === 'true';

      const nextPath =
        hasClinic || onboardingSkipped ? '/' : '/onboarding/clinic';

      navigate(nextPath);
    } catch {
      setError('Correo o contraseña incorrectos');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-[400px] shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-center text-base">
            Ingresa tu correo y contraseña para acceder a tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-base font-medium">
                Correo Electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="h-12 text-lg"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-base font-medium">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-lg"
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full h-12 text-lg font-semibold">
              Iniciar Sesión
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t py-6">
          <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg mb-2">
            <p className="text-sm text-blue-700 text-center">
              ¿Eres fisioterapeuta y trabajas en una clínica existente?
              <br />
              <span className="font-medium">
                Solicita una invitación a tu administrador
              </span>
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 text-lg font-medium gap-2"
            onClick={() => navigate('/onboarding')}
          >
            <Building2 className="w-5 h-5" />
            Crear Nueva Clínica
            <ArrowRight className="w-5 h-5" />
          </Button>

          <p className="text-sm text-gray-500 text-center">
            ¿Quieres abrir tu propia clínica? Crea una nueva arriba
          </p>
        </CardFooter>
      </Card>

    </div>
  );
};

export default Login;
