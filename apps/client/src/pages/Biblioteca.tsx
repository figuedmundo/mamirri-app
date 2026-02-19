import { useState, useCallback } from 'react';
import { useOutlet } from 'react-router-dom';
import { LibraryDashboard } from '@/components/library/LibraryDashboard';
import { useLibrarySearch } from '@/hooks/use-library';

export default function Biblioteca() {
  const bookPanel = useOutlet();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResult = null, isLoading: searchLoading } =
    useLibrarySearch(searchQuery);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <LibraryDashboard
      searchResult={searchResult}
      isLoading={searchLoading}
      searchQuery={searchQuery}
      onSearch={handleSearch}
      bookPanel={bookPanel}
    />
  );
}
