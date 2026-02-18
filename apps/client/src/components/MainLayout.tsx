import { useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from './shell/AppShell';
import { useAuth } from '../hooks/use-auth';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();

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
      label: 'Protocolos',
      href: '/protocolos',
      isActive: location.pathname === '/protocolos',
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
    name: authUser?.name || 'Dra. Noemi Herbas',
    avatarUrl: undefined,
  };

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <AppShell
      navigationItems={navigationItems}
      user={user}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      onLogoClick={handleLogoClick}
    >
      {children}
    </AppShell>
  );
}
