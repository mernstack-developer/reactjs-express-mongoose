import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchCourseById, registerForCourse } from '../features/courses/coursesSlice';
import CourseSidebar from '../components/CourseSidebar';
import RichTextRenderer from '../components/RichTextRenderer/RichTextRenderer';
import { CourseSection, ContentBlock } from '../types/types';

interface Activity {
  _id: string;
  type: string;
  title: string;
  description: string;
  config?: Record<string, any>;
  createdBy?: string;
  createdAt?: string;
}

const ContentBlockRenderer: React.FC<{ content: ContentBlock }> = ({ content }) => {
  switch (content.type) {
    case 'video':
      return (
        <div className="content-block mb-6">
          <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Video: {content.title}
          </h4>
          {content.videoUrl && (
            <video
              controls
              src={content.videoUrl}
              className="w-full rounded-lg shadow-md"
              style={{ maxHeight: '500px' }}
            />
          )}
        </div>
      );
    case 'text':
      return (
        <div className="content-block mb-6">
          <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            {content.title}
          </h4>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {content.textBody}
          </p>
        </div>
      );
    case 'quiz':
      return (
        <div className="content-block mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            📝 Quiz: {content.title}
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            Quiz content structure - to be implemented
          </p>
        </div>
      );
    default:
      return null;
  }
};

const ActivityRenderer: React.FC<{
  activity: Activity;
  title: string;
  enrollmentStatus: boolean;
}> = ({ activity, title, enrollmentStatus }) => {
  const navigate = useNavigate();

  const handleActivityClick = (activityType: string) => {
    if (activityType === 'assignment' && activity.config?.assignmentId) {
      navigate(`/assignments/${activity.config.assignmentId}`);
    }
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      assignment: '📝',
      quiz: '❓',
      forum: '💬',
      lesson: '📖',
      video: '🎥',
      resource: '📄',
    };
    return icons[type] || '🔗';
  };

  if (!enrollmentStatus) {
    return null;
  }

  return (
    <div
      id={`activity-${activity._id}`}
      className="activity-block mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg
                border border-gray-200 dark:border-gray-700"
      onClick={() => handleActivityClick(activity.type)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>{getActivityIcon(activity.type)}</span>
            {activity.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Section: {title} • Type: {activity.type}
          </p>
        </div>
      </div>

      {activity.description && (
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {activity.description}
        </p>
      )}

      {activity.type === 'assignment' && activity.config && activity.config.assignmentId && (
        <button
          onClick={() => navigate(`/assignments/${activity.config!.assignmentId}`)}
          className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700
                   text-white rounded-lg font-medium transition-colors"
        >
          Open Assignment →
        </button>
      )}
    </div>
  );
};

const SectionRenderer: React.FC<{
  section: CourseSection;
  enrollmentStatus: boolean;
  isActive: boolean;
}> = ({ section, enrollmentStatus, isActive }) => {
  console.log('Rendering section:', section);
  
  return (
    <div className={`section-block mb-8 ${!isActive ? 'hidden' : 'block'}`}>
      {isActive && (
        <>
          {/* Section Media */}
          {section.media && (
            <div className="mb-6">
              {section.media.type === 'video' ? (
                <div className="video-container rounded-lg overflow-hidden shadow-lg">
                  <video
                    controls
                    src={section.media.url}
                    className="w-full"
                    style={{ maxHeight: '500px' }}
                    poster={section.media.thumbnail}
                  />
                </div>
              ) : (
                <div className="image-container rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={section.media.url}
                    alt={section.media.alt || section.title}
                    className="w-full"
                    style={{ maxHeight: '500px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Section Description */}
          {section.description && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                About this Section
              </h3>
              <RichTextRenderer content={section.description} />
            </div>
          )}

          {/* Content Blocks */}
          {section.contents && section.contents.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Section Content
              </h3>
              {section.contents.map((content) => (
                <ContentBlockRenderer key={content._id} content={content} />
              ))}
            </div>
          )}

          {/* Activities */}
          {section.activities && section.activities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Activities
              </h3>
              {section.activities.map((activity: Activity) => (
                <ActivityRenderer
                  key={activity._id}
                  activity={activity}
                  title={section.title}
                  enrollmentStatus={enrollmentStatus}
                />
              ))}
            </div>
          )}

          {!section.contents?.length && !section.activities?.length && (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No content or activities in this section yet.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default function StudentCourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { selectedCourse: course, loading, error } = useAppSelector((state) => state.courses);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const { data: user } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(id));
    }
  }, [id, dispatch]);

  const isEnrolled = course && user && course.registeredUsers.includes(user._id);
console.log('course.registeredUsers',course?.registeredUsers +''+'user._id='+user)
  const handleEnroll = () => {
    if (course) {
      dispatch(registerForCourse(course._id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading course...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Course not found.</div>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {course.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            {course.description}
          </p>
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={handleEnroll}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg
                       font-medium transition-colors"
            >
              Enroll in this Course
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600
                       text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar - Collapsible on mobile */}
      <div
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block md:w-64 lg:w-80 flex-shrink-0 overflow-y-auto`}
      >
        <CourseSidebar 
          course={course} 
          onSectionSelect={setActiveSectionId}
          activeSectionId={activeSectionId || undefined}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
            {course.title}
          </h1>
          {activeSectionId && (
            <button
              onClick={() => setActiveSectionId(null)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              Show All Sections
            </button>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 md:p-8">
            {/* Course Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
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
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {course.duration} hours
                      </p>
                    </div>
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
                  </div>
                </div>
              </div>
            </div>

            {/* Sections and Content */}
            {course.sections && course.sections.length > 0 ? (
              course.sections.map((section) => (
                <SectionRenderer
                  key={section._id}
                  section={section}
                  enrollmentStatus={isEnrolled || false}
                  isActive={activeSectionId ? activeSectionId === section._id : true}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>No sections added to this course yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
