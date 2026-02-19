import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading application...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isLoading) {
    const hasPin = localStorage.getItem('last_user_email');
    return <Navigate to={hasPin ? '/pin-login' : '/login'} replace />;
  }

  return <>{children}</>;
};
