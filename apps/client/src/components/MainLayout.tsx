import { useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from './shell/AppShell';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    {
      label: 'Pacientes',
      href: '/pacientes',
      isActive: location.pathname === '/pacientes',
    },
    {
      label: 'Análisis',
      href: '/analisis',
      isActive: location.pathname === '/analisis',
    },
    {
      label: 'Biblioteca Médica',
      href: '/biblioteca',
      isActive: location.pathname === '/biblioteca',
    },
    {
      label: 'Plantillas',
      href: '/plantillas',
      isActive: location.pathname === '/plantillas',
    },
    {
      label: 'Ajustes',
      href: '/ajustes',
      isActive: location.pathname === '/ajustes',
    },
  ];

  const user = {
    name: 'Dr. María García',
    avatarUrl: undefined,
  };

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <AppShell
      navigationItems={navigationItems}
      user={user}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {children}
    </AppShell>
  );
}
