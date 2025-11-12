import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import type { Category } from '../types/types';
import { fetchCategories, createCategory, deleteCategory } from '../features/categories/categoriesSlice';

export default function AdminCategories() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state: any) => state.categories?.data as Category[] || []);
  const loading = useAppSelector((state: any) => state.categories?.loading as boolean);
  const [name, setName] = useState('');
  const [parent, setParent] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  const handleCreate = async () => {
    try {
      await dispatch(createCategory({ name, parent })).unwrap();
      setName(''); setParent(null);
      dispatch(fetchCategories());
    } catch (err: any) {
      alert(err?.message || 'Failed to create category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete category?')) return;
    try {
      await dispatch(deleteCategory(id)).unwrap();
      dispatch(fetchCategories());
    } catch (err: any) {
      alert(err?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin - Manage Categories</h1>
      <div className="mb-6 grid gap-2 md:grid-cols-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Category name" className="p-2 border" />
        <select value={parent || ''} onChange={e => setParent(e.target.value || null)} className="p-2 border">
          <option value="">No parent</option>
          {categories.filter(c => !c.parent).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
      </div>

      {loading ? <div>Loading...</div> : (
        <div className="grid gap-2">
          {categories.map(c => (
            <div key={c._id} className="flex items-center justify-between border p-3">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-gray-500">{c.slug}{c.parent ? ` • child of ${c.parent}` : ''}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDelete(c._id!)} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
