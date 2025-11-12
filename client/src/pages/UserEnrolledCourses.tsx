import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageBreadCrumb from '../components/common/PageBreadCrumb';
import { Course } from '../types/types';

const UserEnrolledCourses: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndCourses = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.REACT_APP_API_URL || 'http://localhost:3000/api';
        
        // Fetch user details
        const userRes = await axios.get(`${apiUrl}/users/${userId}`);
        setUser(userRes.data.data);

        // Fetch user's enrolled courses
        const coursesRes = await axios.get(`${apiUrl}/courses`);
        const allCourses = coursesRes.data.data || [];
        
        // Filter courses where user is enrolled
        const enrolledCourses = allCourses.filter((course: Course) =>
          userId && course.registeredUsers?.includes(userId as string)
        );
        
        setCourses(enrolledCourses);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load user courses');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserAndCourses();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="p-6">
        <PageBreadCrumb pageTitle="User Enrolled Courses" />
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <PageBreadCrumb pageTitle="User Enrolled Courses" />
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <PageBreadCrumb pageTitle="User Enrolled Courses" />
          {user && (
            <h1 className="mt-4 text-2xl font-bold">
              Courses for {user.firstname} {user.lastname}
            </h1>
          )}
        </div>
        <button
          onClick={() => navigate('/admin/users')}
          className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Back to Users
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.length === 0 ? (
          <div className="col-span-full rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-600 dark:text-gray-400">
              This user is not enrolled in any courses yet.
            </p>
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course._id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">
                {course.title}
              </h3>
              <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                {course.description}
              </p>
              
              <div className="mb-4 space-y-1 text-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Instructor:</span> {course.instructor || 'N/A'}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Sections:</span>{' '}
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {course.sections?.length || 0}
                  </span>
                </p>
              </div>

              <button
                onClick={() => navigate(`/course/${course._id}`)}
                className="w-full rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                View Course →
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserEnrolledCourses;
