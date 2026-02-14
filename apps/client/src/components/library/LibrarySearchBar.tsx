import { useState, type KeyboardEvent } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LibrarySearchBarProps {
  onSearch: (query: string) => void;
}

export function LibrarySearchBar({ onSearch }: LibrarySearchBarProps) {
  const [value, setValue] = useState('');

  const handleSearch = () => {
    onSearch(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(value);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center w-full gap-2">
        <Search className="absolute left-4 h-5 w-5 text-muted-foreground z-10" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe el caso clínico (ej: 'Paciente de 88 años con hipercifosis...')"
          className={cn(
            'flex h-12 flex-1 rounded-full border border-input bg-background px-11 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            'shadow-sm transition-shadow hover:shadow-md',
          )}
        />
        <button
          onClick={handleSearch}
          type="button"
          className={cn(
            'h-12 px-6 rounded-full bg-primary text-primary-foreground font-medium text-sm',
            'hover:bg-primary/90 transition-colors',
            'shadow-sm hover:shadow-md',
            'whitespace-nowrap',
          )}
        >
          Buscar
        </button>
      </div>
    </div>
  );
}
