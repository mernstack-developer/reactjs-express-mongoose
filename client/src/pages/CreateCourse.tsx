import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks';
import { createCourse } from '../features/courses/coursesSlice';
import PageBreadCrumb from '../components/common/PageBreadCrumb';

const CreateCourse: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Course title is required');
      return;
    }
    setLoading(true);
    try {
      // If an image is provided, upload it first
      if (imageFile) {
        const upload = await import('../utils/upload');
        const resp = await upload.uploadFileToServer(imageFile);
        const url = resp?.data?.url || resp?.data?.downloadUrl || resp?.data?.publicUrl || resp?.url || resp.data;
        (formData as any).imageUrl = url;
      }
      const result = await dispatch(createCourse(formData));
      if ((result.payload as any)?._id) {
        navigate(`/admin/courses/${(result.payload as any)._id}/editor`);
      }
    } catch (err) {
      setError('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <PageBreadCrumb pageTitle="Create Course" />
      
      <div className="max-w-2xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Course</h1>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Course Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Introduction to React"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="w-full border rounded px-3 py-2"
              placeholder="Course description..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Instructor</label>
            <input
              type="text"
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Instructor name"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-1">Duration (hours)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="0"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-1">Course image (optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create & Edit'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
