import React from 'react';

export interface SortOption {
  label: string;
  value: string;
}

interface SortProps {
  options: SortOption[];
  currentSort?: string;
  currentOrder?: 'asc' | 'desc';
  onSortChange: (sortBy: string, order: 'asc' | 'desc') => void;
  label?: string;
  loading?: boolean;
}

export const Sort: React.FC<SortProps> = ({
  options,
  currentSort = '',
  currentOrder = 'asc',
  onSortChange,
  label = 'Sort by',
  loading = false,
}) => {
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(e.target.value, currentOrder);
  };

  const toggleOrder = () => {
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(currentSort, newOrder);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <label htmlFor="sort-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <div className="flex gap-2">
        <select
          id="sort-select"
          value={currentSort}
          onChange={handleSortChange}
          disabled={loading}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500"
        >
          <option value="">-- Select Sort Option --</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {currentSort && (
          <button
            onClick={toggleOrder}
            disabled={loading}
            title={`Sort ${currentOrder === 'asc' ? 'descending' : 'ascending'}`}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:focus:border-blue-500"
          >
            {currentOrder === 'asc' ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 13a1 1 0 10-2 0V7.414l-1.293 1.293a1 1 0 00-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L15 7.414V13z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Sort;
