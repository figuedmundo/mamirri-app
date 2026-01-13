import React from 'react'
import { MainNav } from './MainNav'
import { UserMenu } from './UserMenu'

export interface AppShellProps {
  children: React.ReactNode
  navigationItems: Array<{ label: string; href: string; isActive?: boolean }>
  user?: { name: string; avatarUrl?: string }
  onNavigate?: (href: string) => void
  onLogout?: () => void
}

export function AppShell({
  children,
  navigationItems,
  user,
  onNavigate,
  onLogout,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-teal-600 dark:text-teal-400">
                Mamirri
              </h1>
            </div>

            <nav className="flex-1 ml-8">
              <MainNav
                items={navigationItems}
                onItemClick={onNavigate}
              />
            </nav>

            {user && (
              <div className="ml-6">
                <UserMenu
                  user={user}
                  onLogout={onLogout}
                />
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
