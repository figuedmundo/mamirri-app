import { useState } from 'react'
import { User, LogOut } from 'lucide-react'

export interface UserMenuProps {
  user: { name: string; avatarUrl?: string }
  onLogout?: () => void
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
            <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
        )}
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden lg:block">
          {user.name}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 z-20">
            <div className="py-1">
              <div className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                {user.name}
              </div>
              <button
                onClick={() => {
                  onLogout?.()
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
