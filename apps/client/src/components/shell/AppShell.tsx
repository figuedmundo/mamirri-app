import React from 'react';
import { MainNav } from './MainNav';
import { UserMenu } from './UserMenu';

export interface AppShellProps {
  children: React.ReactNode;
  navigationItems: Array<{ label: string; href: string; isActive?: boolean }>;
  appVersion?: string;
  user?: {
    name: string;
    avatarUrl?: string;
    clinicName?: string | null;
    role?: string | null;
  };
  onNavigate?: (href: string) => void;
  onLogout?: () => void;
  onLogoClick?: () => void;
}

export function AppShell({
  children,
  navigationItems,
  appVersion,
  user,
  onNavigate,
  onLogout,
  onLogoClick,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      <header className="bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 flex items-center gap-2">
              <button
                onClick={onLogoClick}
                className="text-xl font-bold text-teal-600 dark:text-teal-400 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:bg-teal-50 dark:focus:bg-teal-900/50 rounded px-2 py-1"
              >
                Mamirri
              </button>
              {appVersion ? (
                <span className="rounded-full border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  v{appVersion}
                </span>
              ) : null}
            </div>

            <nav className="flex-1 ml-8">
              <MainNav items={navigationItems} onItemClick={onNavigate} />
            </nav>

            {user && (
              <div className="ml-6">
                <UserMenu user={user} onLogout={onLogout} />
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
