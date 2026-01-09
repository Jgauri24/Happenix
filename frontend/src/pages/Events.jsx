import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import api from '../utils/api';
import EventCard from '../components/EventCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EventFilters from '../components/EventFilters';
import { useAuthStore } from '../store/authStore';
import { useEventFilters } from '../hooks/useEventFilters';

export default function Events() {
  const [showFilters, setShowFilters] = useState(false);
  const { filters, handleFilterChange, clearFilters } = useEventFilters();
  const { user } = useAuthStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      const params = {
        ...filters,
        userLat: user?.location?.lat,
        userLng: user?.location?.lng,
        travelMode: 'driving'
      };
      // Remove empty values
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });
      const res = await api.get('/events', { params });
      return res.data;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Discover Events
        </h1>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              className="input pl-10"
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary flex items-center"
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <EventFilters
            filters={filters}
            onChange={handleFilterChange}
            onClear={clearFilters}
          />
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {data?.events?.length > 0 ? (
            <>
              <div className="mb-4 text-gray-600 dark:text-gray-400">
                Found {data.pagination?.total || 0} events
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.events.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>

              {/* Pagination */}
              {data.pagination && data.pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {[...Array(data.pagination.pages)].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handleFilterChange({ page })}
                        className={`px-4 py-2 rounded ${data.pagination.page === page
                          ? 'bg-primary-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              <p className="text-xl mb-2">No events found</p>
              <p>Try adjusting your filters or search terms</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}



