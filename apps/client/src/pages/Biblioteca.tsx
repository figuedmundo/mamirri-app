import { useState, useCallback } from 'react';
import { LibraryDashboard } from '@/components/library/LibraryDashboard';
import {
  useCategoriesQuery,
  useProtocolsQuery,
  useReferencesQuery,
  useLibrarySearch,
} from '@/hooks/use-library';

export default function Biblioteca() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >();

  const { data: categories = [], isLoading: categoriesLoading } =
    useCategoriesQuery();
  const { data: protocols = [], isLoading: protocolsLoading } =
    useProtocolsQuery(selectedCategoryId);
  const { data: references = [], isLoading: referencesLoading } =
    useReferencesQuery();
  const { data: searchResult = null, isLoading: searchLoading } =
    useLibrarySearch(searchQuery);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSelectCategory = useCallback((id: string | undefined) => {
    setSelectedCategoryId(id);
    setSearchQuery('');
  }, []);

  const isLoading =
    categoriesLoading || protocolsLoading || referencesLoading || searchLoading;

  return (
    <LibraryDashboard
      categories={categories}
      protocols={searchResult ? searchResult.protocols : protocols}
      references={references}
      searchResult={searchResult}
      isLoading={isLoading}
      onSearch={handleSearch}
      onSelectCategory={handleSelectCategory}
      selectedCategoryId={selectedCategoryId}
    />
  );
}
