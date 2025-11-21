import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  Users,
  Award,
  Download,
  Eye
} from 'lucide-react';
import { formatTime } from '../../utils/formatTime';
import useSectionProgress from '../../hooks/useSectionProgress';

interface Section {
  _id: string;
  title: string;
  description?: string;
  estimatedDuration: number;
  order: number;
  isCompleted: boolean;
  progress?: {
    timeSpent: number;
    durationWatched: number;
    completionPercentage: number;
    isCompleted: boolean;
  };
}

interface CourseProgressProps {
  courseId: string;
  sections: Section[];
  courseTitle: string;
  courseDuration: number;
  onSectionStart?: (sectionId: string) => void;
  className?: string;
}

const CourseProgress: React.FC<CourseProgressProps> = ({
  courseId,
  sections,
  courseTitle,
  courseDuration,
  onSectionStart,
  className = ''
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [courseProgress, setCourseProgress] = useState({
    completedSections: 0,
    totalSections: 0,
    completionPercentage: 0,
    totalTimeSpent: 0
  });

  // Calculate course progress
  useEffect(() => {
    if (sections.length > 0) {
      const totalSections = sections.length;
      const completedSections = sections.filter(section => section.progress?.isCompleted).length;
      const totalTimeSpent = sections.reduce((total, section) => total + (section.progress?.timeSpent || 0), 0);
      const completionPercentage = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

      setCourseProgress({
        completedSections,
        totalSections,
        completionPercentage,
        totalTimeSpent
      });
    }
  }, [sections]);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    onSectionStart?.(sectionId);
  };

  const getSectionProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCompletionStatus = (percentage: number) => {
    if (percentage >= 100) return { text: 'Completed', className: 'text-green-600' };
    if (percentage >= 75) return { text: 'In Progress', className: 'text-blue-600' };
    if (percentage >= 50) return { text: 'Getting There', className: 'text-yellow-600' };
    return { text: 'Started', className: 'text-red-600' };
  };

  const generateCertificate = async () => {
    try {
      const response = await fetch(`/api/student/certificates/generate/${courseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const result = await response.json();
        alert('Certificate generated successfully!');
      } else {
        alert('Failed to generate certificate. Please try again.');
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('An error occurred while generating the certificate.');
    }
  };

  return (
    <div className={`course-progress ${className}`}>
      {/* Course Overview */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{courseTitle}</h2>
            <p className="text-gray-600">Course Progress Overview</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{courseProgress.completionPercentage}%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{courseProgress.completedSections}/{courseProgress.totalSections} sections</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${getSectionProgressColor(courseProgress.completionPercentage)}`}
              style={{ width: `${courseProgress.completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">{courseProgress.completedSections}</div>
            <div className="text-xs text-gray-500 flex items-center justify-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">{formatTime(courseProgress.totalTimeSpent)}</div>
            <div className="text-xs text-gray-500 flex items-center justify-center">
              <Clock className="w-3 h-3 mr-1" />
              Time Spent
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">{formatTime(courseDuration)}</div>
            <div className="text-xs text-gray-500 flex items-center justify-center">
              <BarChart3 className="w-3 h-3 mr-1" />
              Total Duration
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">{courseProgress.totalSections}</div>
            <div className="text-xs text-gray-500 flex items-center justify-center">
              <Users className="w-3 h-3 mr-1" />
              Total Sections
            </div>
          </div>
        </div>

        {/* Certificate Button */}
        {courseProgress.completionPercentage >= 90 && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={generateCertificate}
              className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg"
            >
              <Award className="w-4 h-4" />
              <span>Get Certificate</span>
            </button>
          </div>
        )}
      </div>

      {/* Section List */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Course Sections</h3>
          <p className="text-gray-600 mt-1">Click on any section to start or continue learning</p>
        </div>

        <div className="divide-y divide-gray-200">
          {sections.map((section, index) => {
            const status = getCompletionStatus(section.progress?.completionPercentage || 0);
            const isActive = activeSection === section._id;
            
            return (
              <div
                key={section._id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-medium text-gray-500">Section {section.order + 1}</span>
                      <span className={`text-sm font-medium ${status.className}`}>
                        {section.progress?.isCompleted ? 'Completed' : status.text}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-medium text-gray-900 mb-1">{section.title}</h4>
                    
                    {section.description && (
                      <p className="text-gray-600 text-sm mb-3">{section.description}</p>
                    )}

                    {/* Section Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{section.progress?.completionPercentage || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getSectionProgressColor(section.progress?.completionPercentage || 0)}`}
                          style={{ width: `${section.progress?.completionPercentage || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Section Stats */}
                    <div className="flex items-center space-x-6 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(section.estimatedDuration)} estimated
                      </span>
                      {section.progress && (
                        <>
                          <span className="flex items-center">
                            <Play className="w-3 h-3 mr-1" />
                            {formatTime(section.progress.timeSpent)} spent
                          </span>
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {formatTime(section.progress.durationWatched)} watched
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 ml-4">
                    {section.progress?.isCompleted && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    <button
                      onClick={() => handleSectionClick(section._id)}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span>{section.progress?.isCompleted ? 'Review' : 'Continue'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;