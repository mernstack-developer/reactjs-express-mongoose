import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import type { Category } from '../types/types';
import { fetchCategories, createCategory, deleteCategory, updateCategory } from '../features/categories/categoriesSlice';
import { Plus, Edit2, Trash2, Save, X, FolderPlus } from 'lucide-react';
import Search from '../components/common/Search';
import Sort, { SortOption } from '../components/common/Sort';
import Pagination from '../components/common/Pagination';

export default function AdminCategories() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state: any) => state.categories?.data as Category[] || []);
  const loading = useAppSelector((state: any) => state.categories?.loading as boolean);
  
  // Form state for creating new categories
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParent, setNewCategoryParent] = useState<string | null>(null);
  
  // Edit state for updating existing categories
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryParent, setEditCategoryParent] = useState<string | null>(null);
 const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const sortOptions: SortOption[] = [
    { label: 'Name A-Z', value: 'name' },
    { label: 'Newest First', value: 'createdAt' },
    { label: 'Updated', value: 'updatedAt' },
  ];

 
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

  useEffect(() => { 
    dispatch(fetchCategories()); 
  }, [dispatch]);

  const handleCreate = async () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }
    
    try {
      await dispatch(createCategory({ name: newCategoryName, parent: newCategoryParent })).unwrap();
      setNewCategoryName('');
      setNewCategoryParent(null);
      dispatch(fetchCategories());
    } catch (err: any) {
      alert(err?.message || 'Failed to create category');
    }
  };

  const handleUpdate = async (categoryId: string) => {
    if (!editCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }
    
    try {
      await dispatch(updateCategory({ 
        id: categoryId, 
        name: editCategoryName, 
        parent: editCategoryParent 
      })).unwrap();
      setEditingCategory(null);
      setEditCategoryName('');
      setEditCategoryParent(null);
      dispatch(fetchCategories());
    } catch (err: any) {
      alert(err?.message || 'Failed to update category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) return;
    
    try {
      await dispatch(deleteCategory(id)).unwrap();
      dispatch(fetchCategories());
    } catch (err: any) {
      alert(err?.message || 'Failed to delete category');
    }
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category._id);
    setEditCategoryName(category.name);
    setEditCategoryParent(category.parent || null);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditCategoryName('');
    setEditCategoryParent(null);
  };

  // Get top-level categories for parent selection

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin - Manage Categories</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Create, edit, and organize your course categories</p>
      </div>

      {/* Create New Category Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <FolderPlus className="h-5 w-5 mr-2" />
          Create New Category
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category Name *
            </label>
            <input 
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Parent Category
            </label>
            <select 
              value={newCategoryParent || ''} 
              onChange={e => setNewCategoryParent(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">No parent (top-level)</option>
              {topLevelCategories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={handleCreate}
              disabled={loading || !newCategoryName.trim()}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              Create Category
            </button>
          </div>
        </div>
      </div>

      {/* Categories List */}
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
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Categories ({categories.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading categories...</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedCategories.map(category => (
              <div key={category._id} className="p-6">
                {editingCategory === category._id ? (
                  /* Edit Mode */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category Name *
                      </label>
                      <input 
                        value={editCategoryName}
                        onChange={e => setEditCategoryName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Parent Category
                      </label>
                      <select 
                        value={editCategoryParent || ''} 
                        onChange={e => setEditCategoryParent(e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">No parent (top-level)</option>
                        {topLevelCategories
                          .filter(c => c._id !== category._id) // Don't allow self-reference
                          .map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                      </select>
                    </div>
                    
                    <div className="md:col-span-2 flex gap-2">
                      <button 
                        onClick={() => handleUpdate(category._id)}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </button>
                      
                      <button 
                        onClick={cancelEdit}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 rounded-md font-medium transition-colors"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{category.name}</h3>
                        {category.parent && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                            Subcategory
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Slug: <code className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{category.slug}</code></span>
                        {category.parent && (
                          <span>
                            Parent: <span className="font-medium">{categories.find(c => c._id === category.parent)?.name || 'Unknown'}</span>
                          </span>
                        )}
                        <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {category.metadata?.description && (
                        <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">{category.metadata.description}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEdit(category)}
                        className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        title="Edit category"
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(category._id)}
                        className="flex items-center px-3 py-2 text-red-600 hover:text-red-700 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {categories.length === 0 && (
              <div className="py-12 text-center">
                <FolderPlus className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No categories found. Create your first category above!</p>
              </div>
            )}
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
          </div>
          
        )}
 
      </div>
    </div>
  );
}
