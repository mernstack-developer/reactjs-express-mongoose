import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchCourseById, createSection } from '../features/courses/coursesSlice';
import SectionEditor from '../components/CourseEditor/SectionEditor';

const CourseEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedCourse: course, loading } = useAppSelector((state: any) => state.courses);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(id));
    }
  }, [id, dispatch]);

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
