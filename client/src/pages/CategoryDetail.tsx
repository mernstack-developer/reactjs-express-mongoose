import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import type { Category, Course } from '../types/types';

export default function CategoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/categories/${id}`);
        setData(res.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load category');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  const subcats: Category[] = data.subcategories || [];
  const courses: Course[] = data.courses || [];

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-bold mb-4">{data.name}</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Subcategories</h2>
        <div className="flex gap-3 mt-3">
          {subcats.map(s => (
            <button key={s._id} onClick={() => navigate(`/categories/${s._id}`)} className="rounded bg-gray-100 px-3 py-1">{s.name}</button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Courses</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map(c => (
            <div key={c._id} className="rounded-lg border p-4">
              <h3 className="font-semibold">{c.title}</h3>
              <p className="text-sm text-gray-600">{c.description}</p>
              <div className="mt-2">
                <button onClick={() => navigate(`/course/${c._id}`)} className="text-blue-600">View Course</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
