import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Calendar, 
  Award, 
  Clock, 
  TrendingUp, 
  Download,
  FileText,
  Users,
  Star,
  CheckCircle
} from 'lucide-react';
import { useAppSelector } from '../../hooks';
import { formatTime } from '../../utils/formatTime';
import { RootState } from '../../store';
interface CourseProgress {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  instructor: string;
  category: string;
  totalDuration: number;
  progress: {
    completedSections: number;
    totalSections: number;
    completionPercentage: number;
    timeSpent: number;
    lastActivity: string;
  };
  enrolledAt: string;
  isCompleted: boolean;
}

interface SectionProgress {
  _id: string;
  title: string;
  estimatedDuration: number;
  progress: {
    timeSpent: number;
    durationWatched: number;
    completionPercentage: number;
    isCompleted: boolean;
  };
}

interface Certificate {
  _id: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  completionDate: string;
  score?: number;
  qrCode?: string;
}

const StudentDashboard: React.FC = () => {
  const [activeCourses, setActiveCourses] = useState<CourseProgress[]>([]);
  const [completedCourses, setCompletedCourses] = useState<CourseProgress[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useAppSelector((state: RootState) => state.user.data);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Fetch active courses
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const activeResponse = await fetch(`${apiUrl}/student/courses/active`, { headers });
      const activeData = await activeResponse.json();
      if (activeResponse.ok) {
        setActiveCourses(activeData.data || []);
      } else {
        throw new Error(activeData.message || 'Failed to fetch active courses');
      }

      // Fetch completed courses
      const completedResponse = await fetch(`${apiUrl}/student/courses/completed`, { headers });
      const completedData = await completedResponse.json();
      if (completedResponse.ok) {
        setCompletedCourses(completedData.data || []);
      } else {
        throw new Error(completedData.message || 'Failed to fetch completed courses');
      }

      // Fetch recent activity
      const activityResponse = await fetch(`${apiUrl}/student/activity/recent`, { headers });
      const activityData = await activityResponse.json();
      if (activityResponse.ok) {
        setRecentActivity(activityData.data || []);
      } else {
        throw new Error(activityData.message || 'Failed to fetch recent activity');
      }

      // Fetch certificates
      const certificatesResponse = await fetch(`${apiUrl}/student/certificates`, { headers });
      const certificatesData = await certificatesResponse.json();
      if (certificatesResponse.ok) {
        setCertificates(certificatesData.data || []);
      } else {
        throw new Error(certificatesData.message || 'Failed to fetch certificates');
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (certificateId: string, courseTitle: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required to download certificate');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/student/certificates/${certificateId}/download`, { 
        headers,
        method: 'GET'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${courseTitle.replace(/\s+/g, '_')}_Certificate.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download certificate');
      }
    } catch (err: any) {
      console.error('Error downloading certificate:', err);
      alert(err.message || 'Failed to download certificate. Please try again.');
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDuration = (seconds: number) => {
    return formatTime(seconds);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-2 text-red-600 hover:text-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstname || 'Student'}!
        </h1>
        <p className="text-blue-100">
          Ready to continue your learning journey? Here's your progress overview.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">{activeCourses.length}</p>
            </div>
            <BookOpen className="w-12 h-12 text-blue-500 bg-blue-50 rounded-lg p-2" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedCourses.length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500 bg-green-50 rounded-lg p-2" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Certificates</p>
              <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
            </div>
            <Award className="w-12 h-12 text-yellow-500 bg-yellow-50 rounded-lg p-2" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(
                  activeCourses.reduce((total, course) => total + course.progress.timeSpent, 0) +
                  completedCourses.reduce((total, course) => total + course.progress.timeSpent, 0)
                )}
              </p>
            </div>
            <Clock className="w-12 h-12 text-purple-500 bg-purple-50 rounded-lg p-2" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Courses */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Active Courses</h2>
            <Link to="/my-courses" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          
          {activeCourses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No active courses. <Link to="/courses" className="text-blue-600">Browse Courses</Link></p>
            </div>
          ) : (
            activeCourses.slice(0, 3).map(course => (
              <div key={course._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start space-x-4">
                  {course.thumbnail && (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link to={`/courses/view/${course._id}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {course.title}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">{course.instructor}</p>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.progress.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(course.progress.completionPercentage)}`}
                          style={{ width: `${course.progress.completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Time Info */}
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{formatDuration(course.progress.timeSpent)} spent</span>
                      <span>{course.progress.completedSections}/{course.progress.totalSections} sections</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Certificates & Recent Activity */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No recent activity</p>
              ) : (
                recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Certificates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Certificates</h2>
              <Link to="/certificates" className="text-blue-600 hover:text-blue-800 text-sm">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {certificates.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No certificates yet</p>
              ) : (
                certificates.slice(0, 3).map(certificate => (
                  <div key={certificate._id} className="flex items-center justify-between p-4 bg-white rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Award className="w-8 h-8 text-yellow-500" />
                      <div>
                        <p className="font-medium text-gray-900">{certificate.courseTitle}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(certificate.completionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadCertificate(certificate._id, certificate.courseTitle)}
                      className="p-2 text-blue-600 hover:text-blue-800"
                      title="Download Certificate"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Progress Details */}
      {activeCourses.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Course Progress Details</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCourses.map(course => (
                <div key={course._id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">{course.title}</h3>
                  <div className="space-y-2">
                    {course.progress.completedSections > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Completed Sections:</span>
                        <span className="font-medium">{course.progress.completedSections}/{course.progress.totalSections}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Time Spent:</span>
                      <span className="font-medium">{formatDuration(course.progress.timeSpent)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Completion:</span>
                      <span className="font-medium text-green-600">{course.progress.completionPercentage}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Activity:</span>
                      <span className="text-gray-600 text-xs">{new Date(course.progress.lastActivity).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;