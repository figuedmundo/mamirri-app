import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export interface MainNavProps {
  items: Array<{ label: string; href: string; isActive?: boolean }>;
  onItemClick?: (href: string) => void;
}

export function MainNav({ items, onItemClick }: MainNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Menú"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      <div className="hidden md:flex space-x-6">
        {items.map((item) => (
          <button
            key={item.href}
            onClick={() => onItemClick?.(item.href)}
            className={`
              px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${
                item.isActive
                  ? 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }
            `}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 md:hidden">
            <div className="p-4 space-y-2">
              {items.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    onItemClick?.(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full text-left px-4 py-3 text-base font-medium rounded-md transition-colors
                    ${
                      item.isActive
                        ? 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
