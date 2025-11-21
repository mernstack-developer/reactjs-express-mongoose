import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { createCourse, updateCourse, fetchCourseById } from '../features/courses/coursesSlice';
import PageBreadCrumb from '../components/common/PageBreadCrumb';
import RichTextEditor from '../components/RichTextEditor/RichTextEditor';
import '../components/RichTextEditor/RichTextEditor.css';
//import { uploadFileToServer } from '../utils/upload';
import type { Category } from '../types/types';
import { fetchCategories } from '../features/categories/categoriesSlice';
const CreateCourse: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { courseId } = useParams();
  //const { selectedCourse } = useAppSelector((state) => state.courses);
    const categories = useAppSelector((state: any) => state.categories?.data as Category[] || []);
  console.log('Categories loaded:', categories);
  const isEdit = Boolean(courseId);
  useEffect(() => { 
    dispatch(fetchCategories()); 
  }, [dispatch]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: 0,
    enrollmentType: 'free' as 'free' | 'paid' | 'approval',
    price: 0,
    currency: 'INR',
    isPublic: false,
    maxStudents: undefined as number | undefined,
    enrollmentDeadline: '',
    startDate: '',
    endDate: '',
    tags: [] as string[],
    category: undefined as string | undefined,
    thumbnail: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  //const [imageUploading, setImageUploading] = useState(false);

  // Load course data when editing
  useEffect(() => {
    if (isEdit && courseId) {
      const loadCourse = async () => {
        try {
          const result = await dispatch(fetchCourseById(courseId));
          if (result.payload) {
            const course = result.payload as any;
            setFormData({
              title: course.title || '',
              description: course.description || '',
              instructor: course.instructor || '',
              duration: course.duration || 0,
              enrollmentType: course.enrollmentType || 'free',
              price: course.price || 0,
              currency: course.currency || 'INR',
              isPublic: course.isPublic || false,
              maxStudents: course.maxStudents,
              enrollmentDeadline: course.enrollmentDeadline || '',
              startDate: course.startDate || '',
              endDate: course.endDate || '',
              tags: course.tags || [],
              category: course.category || undefined,
              thumbnail: course.thumbnail || '',
            });
          }
        } catch (error) {
          console.error('Failed to load course:', error);
          setError('Failed to load course data');
        }
      };
      loadCourse();
    }
  }, [isEdit, courseId, dispatch]);  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let processedValue: any = value;
    
    if (name === 'duration') {
      processedValue = parseInt(value) || 0;
    } else if (name === 'price') {
      processedValue = parseFloat(value) || 0;
    } else if (name === 'maxStudents') {
      processedValue = value ? parseInt(value) || undefined : undefined;
    } else if (name === 'isPublic') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'enrollmentType') {
      processedValue = value as 'free' | 'paid' | 'approval';
    } else if (name === 'tags') {
      // Convert comma-separated tags to array
      processedValue = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleDescriptionChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      description: content,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Course title is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Prepare course data
      const courseData: any = { ...formData };
      
      // Handle category - only include if it has a value
      if (formData.category) {
        courseData.category = formData.category;
      } else {
        delete courseData.category;
      }
      
      // Handle image upload
      if (imageFile) {
        try {
          const upload = await import('../utils/upload');
          const resp = await upload.uploadFileToServer(imageFile);
          const url = resp?.data?.url || resp?.data?.downloadUrl || resp?.data?.publicUrl || resp?.url || resp.data;
          if (url) {
            courseData.imageUrl = url;
          }
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          // Don't fail the entire course creation if image upload fails
        }
      }
      
      // Validate price for paid courses
      if (formData.enrollmentType === 'paid' && (!formData.price || formData.price <= 0)) {
        setError('Price is required for paid courses and must be greater than 0');
        return;
      }
      
      let result;
      if (isEdit && courseId) {
        // Update existing course
        result = await dispatch(updateCourse({ id: courseId, data: courseData }));
        if (result.payload) {
          navigate(`/admin/courses/${courseId}/editor`);
        }
      } else {
        // Create new course
        result = await dispatch(createCourse(courseData));
        if ((result.payload as any)?._id) {
          navigate(`/admin/courses/${(result.payload as any)._id}/editor`);
        }
      }
    } catch (err: any) {
      console.error(isEdit ? 'Course update error:' : 'Course creation error:', err);
      if (err.message?.includes('category')) {
        setError('Please select a valid category or leave it empty');
      } else if (err.message?.includes('validation failed')) {
        setError('Please check your input and try again');
      } else {
        setError(err.message || (isEdit ? 'Failed to update course' : 'Failed to create course'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBreadCrumb pageTitle={isEdit ? "Edit Course" : "Create Course"} />
      
      <div className="flex h-screen">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEdit ? 'Edit Course' : 'Create New Course'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isEdit 
                    ? 'Update your course information and content'
                    : 'Build your course with rich content and engaging descriptions'
                  }
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/courses')}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    isEdit ? 'Updating...' : 'Creating...'
                  ) : (
                    isEdit ? 'Update Course' : 'Create & Edit'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
              {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., Complete React & TypeScript Development"
                      required
                    />
                  </div>

                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enrollment Type *
                    </label>
                    <select
                      name="enrollmentType"
                      value={formData.enrollmentType}
                      onChange={handleChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                      <option value="approval">Approval Required</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing Section (Conditional) */}
              {formData.enrollmentType === 'paid' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing Information</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Price *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">{formData.currency}</span>
                        </div>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className="w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="2999.00"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency *
                      </label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      >
                        <option value="INR">INR (Indian Rupee)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="EUR">EUR (Euro)</option>
                        <option value="GBP">GBP (British Pound)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Course Description with WYSIWYG Editor */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Description</h2>
                <p className="text-sm text-gray-600 mb-4">Create a compelling course description using the rich text editor below</p>
                
                <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-colors">
                  <RichTextEditor
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    placeholder="Describe your course in detail. Include what students will learn, course objectives, prerequisites, and any other important information..."
                    height="400px"
                    variant="full"
                  />
                </div>
              </div>

              {/* Course Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructor
                    </label>
                    <input
                      type="text"
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter instructor name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category (Optional)
                    </label>
                    <select
                      name="category"
                      value={formData.category || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select a category (optional)</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                      {/* 
                      <option value="programming">Programming</option>
                      <option value="web-development">Web Development</option>
                      <option value="data-science">Data Science</option>
                      <option value="mobile-development">Mobile Development</option>
                      <option value="cloud-computing">Cloud Computing</option>
                      <option value="devops">DevOps</option>
                      <option value="design">Design</option>
                      <option value="business">Business</option> */}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Students
                    </label>
                    <input
                      type="number"
                      name="maxStudents"
                      value={formData.maxStudents || ''}
                      onChange={handleChange}
                      min="1"
                      placeholder="Leave blank for unlimited"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags.join(', ')}
                      onChange={handleChange}
                      placeholder="e.g., React, TypeScript, Frontend, JavaScript"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Course Scheduling */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Scheduling</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enrollment Deadline
                    </label>
                    <input
                      type="date"
                      name="enrollmentDeadline"
                      value={formData.enrollmentDeadline}
                      onChange={handleChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Course Settings */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Settings</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-colors"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      Make course publicly visible on the course catalog
                    </span>
                  </label>
                </div>
              </div>

              {/* Media Upload */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Media Upload</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Image (optional)
                  </label>
                  <div className="border-2 border-gray-300 border-dashed rounded-lg p-4 text-center hover:border-blue-500 hover:bg-blue-50/5 transition-colors">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload a course image or thumbnail (recommended: 800x600px)</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky bottom-6">
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/courses')}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        Create & Edit Course
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
