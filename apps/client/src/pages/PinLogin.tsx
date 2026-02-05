import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '../components/ui/card';
import PinPad from '../components/auth/PinPad';
import PinDots from '../components/auth/PinDots';
import { api } from '../lib/axios';

const PinLogin: React.FC = () => {
  const storedName = localStorage.getItem('last_user_name') || '';
  const storedEmail = localStorage.getItem('last_user_email') || '';

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!storedEmail) {
      navigate('/login');
    }
  }, [navigate, storedEmail]);

  const handlePinComplete = async (completedPin: string) => {
    try {
      setError('');
      const response = await api.post('/auth/pin/login', {
        email: storedEmail,
        pin: completedPin,
      });
      login(response.data.user, response.data.accessToken);
      navigate('/');
    } catch {
      setError('PIN incorrecto');
      setPin('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-[400px] shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Hola, {storedName || 'Bienvenido'}
          </CardTitle>
          <CardDescription className="text-center text-base">
            Ingresa tu PIN para acceder.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PinDots length={4} filled={pin.length} />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          <PinPad pin={pin} setPin={setPin} onComplete={handlePinComplete} />
        </CardContent>
        <CardFooter className="flex justify-center border-t py-4">
          <button
            onClick={() => navigate('/login?manual=true')}
            className="text-sm text-primary font-medium hover:underline"
          >
            Usar correo y contraseña →
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PinLogin;
