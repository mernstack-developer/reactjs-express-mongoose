import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchCategories } from '../features/categories/categoriesSlice';
import { Category } from '../types/types';
import { useNavigate } from 'react-router-dom';
import Search from '../components/common/Search';
import Sort, { SortOption } from '../components/common/Sort';
import Pagination from '../components/common/Pagination';

export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state: any) => state.categories?.data as Category[] || []);
  const loading = useAppSelector((state: any) => state.categories?.loading as boolean);
  const error = useAppSelector((state: any) => state.categories?.error as string | null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const navigate = useNavigate();

  const sortOptions: SortOption[] = [
    { label: 'Name A-Z', value: 'name' },
    { label: 'Newest First', value: 'createdAt' },
    { label: 'Updated', value: 'updatedAt' },
  ];

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  // Filter to top-level categories only
  const topLevelCategories = (categories || []).filter((c: Category) => !c.parent);

  // Filter by search query
  const filteredCategories = topLevelCategories.filter((cat: Category) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort categories
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    let compareA, compareB;

    if (sortBy === 'name') {
      compareA = a.name.toLowerCase();
      compareB = b.name.toLowerCase();
    } else if (sortBy === 'createdAt') {
      compareA = new Date(a.createdAt || 0).getTime();
      compareB = new Date(b.createdAt || 0).getTime();
    } else if (sortBy === 'updatedAt') {
      compareA = new Date(a.updatedAt || 0).getTime();
      compareB = new Date(b.updatedAt || 0).getTime();
    } else {
      return 0;
    }

    if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = sortedCategories.slice(startIndex, startIndex + itemsPerPage);

  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-3xl font-bold mb-6">Browse Categories</h1>

      {/* Search and Sort Controls */}
      <div className="mb-6 flex flex-col gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1">
          <Search
            placeholder="Search categories..."
            onSearch={setSearchQuery}
            debounceMs={300}
            initialValue={searchQuery}
            loading={loading}
          />
        </div>
        <div className="flex-1 sm:min-w-64">
          <Sort
            options={sortOptions}
            currentSort={sortBy}
            currentOrder={sortOrder}
            onSortChange={(sort, order) => {
              setSortBy(sort);
              setSortOrder(order);
              setCurrentPage(1);
            }}
            loading={loading}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex h-40 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading categories...</p>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && paginatedCategories.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {searchQuery ? 'No categories match your search' : 'No categories found'}
          </p>
        </div>
      )}

      {/* Categories Grid */}
      {!loading && paginatedCategories.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {paginatedCategories.map(cat => (
              <div
                key={cat._id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{cat.name}</h3>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  {cat.metadata?.description || 'No description'}
                </p>
                <button
                  onClick={() => navigate(`/categories/${cat._id}`)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Category →
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={sortedCategories.length}
              loading={loading}
            />
          )}
        </>
      )}
    </div>
  );
}
