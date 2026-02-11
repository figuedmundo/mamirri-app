import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
        <Search size={20} />
      </div>
      <input
        type="text"
        placeholder="Describe el caso clínico (ej: 'Paciente de 88 años con hipercifosis...')"
        onChange={(e) => onSearch(e.target.value)}
        className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm 
                 text-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500
                 transition-all duration-200"
      />
      <div className="absolute inset-y-0 right-2 flex items-center">
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-400 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md font-mono">
          ⌘K
        </kbd>
      </div>
    </div>
  );
}
