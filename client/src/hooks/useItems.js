import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import debounce from 'lodash/debounce';

export const useItems = (isAuthenticated, view, apiUrl, itemsPerPage) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState({ minQuantity: '', maxQuantity: '' });

  const { data: itemsData, isLoading } = useQuery({
    queryKey: ['items', currentPage, searchTerm, sortBy, sortOrder, filters],
    queryFn: async () => {
      const params = { page: currentPage, limit: itemsPerPage, search: searchTerm, sortBy, sortOrder };
      if (filters.minQuantity) params.minQuantity = filters.minQuantity;
      if (filters.maxQuantity) params.maxQuantity = filters.maxQuantity;
      const res = await axios.get(`${apiUrl}/items`, { params });
      return res.data;
    },
    enabled: isAuthenticated && view === 'table',
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  const debouncedHandleSearchChange = debounce((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300);

  const handleSearchChange = (e) => {
    setLocalSearchTerm(e.target.value);
    debouncedHandleSearchChange(e);
  };

  const handleSort = (sorter) => {
    if (sorter.order) {
      setSortBy(sorter.field);
      setSortOrder(sorter.order === 'descend' ? 'desc' : 'asc');
    } else {
      setSortBy('name');
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  return {
    itemsData,
    isLoading,
    currentPage,
    localSearchTerm,
    filters,
    handleSearchChange,
    handleSort,
    handleFilterChange,
    handlePageChange,
  };
};