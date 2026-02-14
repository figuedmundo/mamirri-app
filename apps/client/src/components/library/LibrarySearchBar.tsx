import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LibrarySearchBarProps {
  onSearch: (query: string) => void;
}

export function LibrarySearchBar({ onSearch }: LibrarySearchBarProps) {
  const [value, setValue] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSearch(value);
    }, 400);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, onSearch]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      onSearch(value);
    }
  };

  const clearSearch = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center w-full">
        <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe el caso clínico (ej: 'Paciente de 88 años con hipercifosis...')"
          className={cn(
            'flex h-12 w-full rounded-full border border-input bg-background px-11 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            'shadow-sm transition-shadow hover:shadow-md',
          )}
        />
        {value ? (
          <button
            onClick={clearSearch}
            className="absolute right-4 rounded-full p-1 hover:bg-muted transition-colors"
            type="button"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        ) : (
          <div className="absolute right-4 hidden sm:flex items-center gap-1 text-xs text-muted-foreground pointer-events-none border rounded px-1.5 py-0.5 bg-muted/50">
            <span className="text-[10px]">⌘</span>K
          </div>
        )}
      </div>
    </div>
  );
}
