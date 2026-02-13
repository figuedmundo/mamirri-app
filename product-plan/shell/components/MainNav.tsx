export interface MainNavProps {
  items: Array<{ label: string; href: string; isActive?: boolean }>;
  onItemClick?: (href: string) => void;
}

export function MainNav({ items, onItemClick }: MainNavProps) {
  return (
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
  );
}
