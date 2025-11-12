import React, { useState, useCallback, useEffect } from 'react';

interface SearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  initialValue?: string;
  loading?: boolean;
  clearable?: boolean;
}

export const Search: React.FC<SearchProps> = ({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  initialValue = '',
  loading = false,
  clearable = true,
}) => {
  const [value, setValue] = useState(initialValue);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      // Clear existing timer
      if (timer) {
        clearTimeout(timer);
      }

      // Set new timer for debounced search
      const newTimer = setTimeout(() => {
        onSearch(newValue);
      }, debounceMs);

      setTimer(newTimer);
    },
    [debounceMs, onSearch, timer]
  );

  const handleClear = useCallback(() => {
    setValue('');
    onSearch('');
    if (timer) {
      clearTimeout(timer);
    }
  }, [onSearch, timer]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={loading}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-500"
        />

        {/* Search Icon */}
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Clear Button */}
        {clearable && value && (
          <button
            onClick={handleClear}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed dark:hover:text-gray-300"
            aria-label="Clear search"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
