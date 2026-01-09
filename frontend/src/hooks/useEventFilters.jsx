import { useState } from 'react';

const initialFilters = {
  search: '',
  category: '',
  city: '',
  type: '',
  minPrice: '',
  maxPrice: '',
  dateFrom: '',
  dateTo: '',
  sortBy: 'date'
};


export const useEventFilters = () => {
  const [filters, setFilters] = useState(initialFilters);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  return {
    filters,
    handleFilterChange,
    clearFilters
  };
};
