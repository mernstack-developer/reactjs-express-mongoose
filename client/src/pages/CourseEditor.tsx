import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchCourseById, createSection, updateCourse } from '../features/courses/coursesSlice';
import SectionEditor from '../components/CourseEditor/SectionEditor';
import RichTextEditor from '../components/RichTextEditor/RichTextEditor';
import '../components/RichTextEditor/RichTextEditor.css';

const CourseEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedCourse: course, loading } = useAppSelector((state: any) => state.courses);
  const [editMode, setEditMode] = useState(false);
  const [editBasicInfo, setEditBasicInfo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [courseData, setCourseData] = useState({
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
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(id));
    }
  }, [id, dispatch]);

  // Populate form data when course loads
  useEffect(() => {
    if (course) {
      setCourseData({
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
      });
    }
  }, [course]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      processedValue = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    
    setCourseData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleDescriptionChange = (content: string) => {
    setCourseData(prev => ({
      ...prev,
      description: content,
    }));
  };

  const handleSaveCourse = async () => {
    if (!course?._id) return;
    
    setSaving(true);
    setError('');
    
    try {
      const courseUpdateData: any = { ...courseData };
      
      // Handle category - only include if it has a value
      if (courseData.category) {
        courseUpdateData.category = courseData.category;
      } else {
        delete courseUpdateData.category;
      }
      
      await dispatch(updateCourse({ id: course._id, data: courseUpdateData }));
      setEditBasicInfo(false);
      // Refresh course data
      dispatch(fetchCourseById(course._id));
    } catch (err: any) {
      setError(err.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    // Navigate to a preview route or open in new tab
    const previewUrl = `/courses/view/${course?._id}`;
    window.open(previewUrl, '_blank');
  };

  const handleAddSection = async () => {
    const title = prompt('Enter section title:') || 'Untitled Section';
    if (!course) return;
    try {
      await dispatch(createSection({ courseId: course._id, section: { title, description: '' } }));
      // Refresh course data after creating section
      dispatch(fetchCourseById(course._id));
    } catch (error) {
      console.error('Failed to create section:', error);
    }
  };

  const handleRefreshCourse = () => {
    if (course) {
      dispatch(fetchCourseById(course._id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Course not found</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Go back"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {course.title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Course Editor</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                editMode
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {editMode ? '🔒 Turn Editing Off' : '🔓 Turn Editing On'}
            </button>

            <button
              onClick={() => setEditBasicInfo(!editBasicInfo)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                editBasicInfo
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              {editBasicInfo ? '📝 Save Basic Info' : '✏️ Edit Basic Info'}
            </button>

            <button
              onClick={handlePreview}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              👁️ Preview Course
            </button>

            {editMode && (
              <button
                onClick={handleAddSection}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                + Add Section
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Basic Course Information */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Course Information</h2>
          </div>

          {editBasicInfo ? (
            <form onSubmit={handleSaveCourse} className="space-y-6">
              {/* Course Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={courseData?.title || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter course title"
                  required
                />
              </div>

              {/* Course Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Description *
                </label>
                <RichTextEditor
                  value={courseData?.description || ''}
                  onChange={handleDescriptionChange}
                  placeholder="Describe your course..."
                />
              </div>

              {/* Instructor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Instructor *
                </label>
                <input
                  type="text"
                  name="instructor"
                  value={courseData?.instructor || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter instructor name"
                  required
                />
              </div>

              {/* Enrollment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enrollment Type *
                </label>
                <select
                  name="enrollmentType"
                  value={courseData?.enrollmentType || 'free'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                  <option value="approval">Approval Required</option>
                </select>
              </div>

              {/* Pricing */}
              {(courseData?.enrollmentType === 'paid') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price
                    </label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      min="0"
                      value={courseData?.price || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <input
                      type="text"
                      name="currency"
                      value={courseData?.currency || 'USD'}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="USD"
                    />
                  </div>
                </div>
              )}

              {/* Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (hours) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    step="0.5"
                    min="0.5"
                    value={courseData?.duration || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="1.0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={courseData?.tags?.join(', ') || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="javascript, react, programming"
                  />
                </div>
              </div>

              {/* Scheduling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={courseData?.startDate?.split('T')[0] || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={courseData?.endDate?.split('T')[0] || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Public Visibility */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={courseData?.isPublic || false}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Make this course publicly visible
                  </span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                >
                  {saving ? '💾 Saving...' : '💾 Save Course'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditBasicInfo(false)}
                  disabled={saving}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Instructor</span>
                  <p className="font-medium text-gray-900 dark:text-white">{courseData?.instructor || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Duration</span>
                  <p className="font-medium text-gray-900 dark:text-white">{courseData?.duration || 'Not specified'} hours</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Enrollment Type</span>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{courseData?.enrollmentType || 'free'}</p>
                </div>
              </div>
              
              {courseData?.enrollmentType === 'paid' && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Price</span>
                  <p className="font-medium text-gray-900 dark:text-white">{courseData?.currency || 'USD'} {courseData?.price || 0}</p>
                </div>
              )}

              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Description</span>
                <div className="mt-1 text-gray-700 dark:text-gray-300 prose max-w-none">
                  {courseData?.description ? (
                    <div dangerouslySetInnerHTML={{ __html: courseData.description }} />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No description provided</p>
                  )}
                </div>
              </div>

              {courseData?.tags && courseData.tags.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Tags</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {courseData.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900 dark:text-blue-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-6">
        {/* Course Overview Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex gap-6">
            {course.imageUrl && (
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {course.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {course.description}
              </p>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Sections</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {course.sections?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Enrolled</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {course.registeredUsers?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Duration</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {course.duration} hours
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Status</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    {editMode ? '✏️ Editing' : '👁️ Viewing'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        {editMode ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Course Structure
            </h2>
            {course.sections && course.sections.length > 0 ? (
              course.sections.map((section: any, idx: number) => (
                <SectionEditor
                  key={section._id}
                  section={section}
                  courseId={course._id}
                  sectionIndex={idx}
                  onRefresh={handleRefreshCourse}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-4">No sections yet.</p>
                <button
                  onClick={handleAddSection}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Create First Section
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Turn on editing to modify sections, activities, and course content.
            </p>
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Enable Editing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseEditor;
