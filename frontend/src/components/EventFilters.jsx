import { X } from 'lucide-react';

const CATEGORIES = ['Music', 'Sports', 'Technology', 'Business', 'Arts', 'Food', 'Education', 'Health', 'Other'];

export default function EventFilters({ filters, onChange, onClear }) {
  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button
          onClick={onClear}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Clear All
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            className="input"
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value })}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <select
            className="input"
            value={filters.type}
            onChange={(e) => onChange({ type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium mb-2">City</label>
          <input
            type="text"
            className="input"
            placeholder="Enter city"
            value={filters.city}
            onChange={(e) => onChange({ city: e.target.value })}
          />
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium mb-2">Sort By</label>
          <select
            className="input"
            value={filters.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value })}
          >
            <option value="date">Date</option>
            <option value="price">Price</option>
            <option value="travelTime">Travel Time</option>
            <option value="createdAt">Newest</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium mb-2">Min Price</label>
          <input
            type="number"
            className="input"
            placeholder="0"
            value={filters.minPrice}
            onChange={(e) => onChange({ minPrice: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Max Price</label>
          <input
            type="number"
            className="input"
            placeholder="1000"
            value={filters.maxPrice}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
          />
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-medium mb-2">From Date</label>
          <input
            type="date"
            className="input"
            value={filters.dateFrom}
            onChange={(e) => onChange({ dateFrom: e.target.value })}
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-medium mb-2">To Date</label>
          <input
            type="date"
            className="input"
            value={filters.dateTo}
            onChange={(e) => onChange({ dateTo: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}



