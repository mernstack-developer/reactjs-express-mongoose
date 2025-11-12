import { useEffect, useState } from 'react';
import axios from 'axios';
import type { Category } from '../types/types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [parent, setParent] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/categories`);
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const createCategory = async () => {
    try {
      await axios.post(`${import.meta.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/categories`, { name, parent }, { headers: { Authorization: `Bearer ${token}` } });
      setName(''); setParent(null);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete category?')) return;
    try {
      await axios.delete(`${import.meta.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/categories/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete category');
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
        <button onClick={createCategory} className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
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
                <button onClick={() => deleteCategory(c._id!)} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
