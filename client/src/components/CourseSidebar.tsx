import { useState } from 'react';
import { Course, CourseSection } from '../types/types';

interface CourseSidebarProps {
  course: Course;
  activeActivityId?: string;
  onSectionSelect?: (sectionId: string | null) => void;
  onCourseOverviewToggle?: () => void;
  onCourseOverviewHide?: () => void;
  activeSectionId?: string | null;
  selectedActivityId?: string | null;
  showCourseOverview?: boolean;
}

export default function CourseSidebar({ course, activeActivityId, onSectionSelect, onCourseOverviewToggle, onCourseOverviewHide, activeSectionId, selectedActivityId, showCourseOverview }: CourseSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(course.sections?.map(s => s._id) || [])
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const renderActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'assignment':
        return '📝';
      case 'quiz':
        return '❓';
      case 'forum':
        return '💬';
      case 'lesson':
        return '📖';
      case 'video':
        return '🎥';
      case 'resource':
        return '📄';
      default:
        return '🔗';
    }
  };

  return (
    <aside className="w-full h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
                    overflow-y-auto flex flex-col">
      {/* Course Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
        <h2 className="font-bold text-gray-900 dark:text-white truncate">
          {course.title}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {course.sections?.length || 0} sections
        </p>
      </div>

      {/* Course Overview Option */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            if (onCourseOverviewToggle) {
              onCourseOverviewToggle();
            }
            if (onSectionSelect) {
              onSectionSelect(null);
            }
          }}
          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
            showCourseOverview && !activeSectionId && !selectedActivityId
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          📖 Course Overview
        </button>
      </div>

      {/* Activity Selected Indicator */}
      {selectedActivityId && (
        <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Activity Selected</div>
          <button
            onClick={() => {
              if (onSectionSelect) {
                onSectionSelect(null);
              }
            }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            ← Back to Course
          </button>
        </div>
      )}

      {/* Sections List */}
      <nav className="flex-1 overflow-y-auto">
        {course.sections && course.sections.length > 0 ? (
          <ul className="space-y-0">
            {course.sections.map((section: CourseSection, index: number) => (
              <li key={section._id} className="border-b border-gray-100 dark:border-gray-700">
                {/* Section Header */}
                <button
                  onClick={() => {
                    toggleSection(section._id);
                    if (onSectionSelect) {
                      onSectionSelect(section._id);
                    }
                    if (onCourseOverviewHide) {
                      onCourseOverviewHide();
                    }
                  }}
                  className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50
                           dark:hover:bg-gray-700 transition-colors text-left group cursor-pointer
                           ${activeSectionId === section._id ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <svg
                      className={`flex-shrink-0 w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform
                                 ${expandedSections.has(section._id) ? 'rotate-90' : ''}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {index + 1}. {section.title}
                    </span>
                  </div>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {section.activities?.length || 0}
                  </span>
                </button>

                {/* Activities List */}
                {expandedSections.has(section._id) && (
                  <ul className="bg-gray-50 dark:bg-gray-700/50">
                    {section.activities && section.activities.length > 0 ? (
                      section.activities.map((activity: any) => (
                        <li key={activity._id}>
                          <a
                            href={`#activity-${activity._id}`}
                            className={`block px-4 py-2 pl-12 text-sm hover:bg-gray-100
                                      dark:hover:bg-gray-600 transition-colors group
                                      ${
                                        activeActivityId === activity._id
                                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                          : 'text-gray-700 dark:text-gray-300'
                                      }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>{renderActivityIcon(activity.type)}</span>
                              <span className="truncate">{activity.title}</span>
                            </span>
                          </a>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 pl-12 text-xs text-gray-500 dark:text-gray-400">
                        No activities yet
                      </li>
                    )}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            No sections added yet
          </div>
        )}
      </nav>

      {/* Course Info Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p className="font-medium">Course Details</p>
          <p>Instructor: {course.instructor}</p>
          <p>Duration: {course.duration}h</p>
        </div>
      </div>
    </aside>
  );
}
