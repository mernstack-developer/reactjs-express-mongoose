import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCourses, registerForCourse } from '../features/courses/coursesSlice';
import { useAppDispatch, useAppSelector } from "../hooks";
import { useAuth } from "../hooks/useAuth";

export default function StudentCourses() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: courses, loading, error } = useAppSelector(state => state.courses);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEnrolled, setFilterEnrolled] = useState(false);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleRegister = (courseId: string) => {
    dispatch(registerForCourse(courseId));
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  // Filter courses based on search and enrollment status
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const isEnrolled = course.registeredUsers?.includes(user?._id);
    
    if (filterEnrolled) {
      return matchesSearch && isEnrolled;
    }
    return matchesSearch;
  });

  const enrolledCount = courses.filter(c => c.registeredUsers?.includes(user?._id)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading courses...</div>
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You are enrolled in {enrolledCount} of {courses.length} course{courses.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                          placeholder-gray-400 dark:placeholder-gray-500
                          focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setFilterEnrolled(!filterEnrolled)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterEnrolled
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              Enrolled Only
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {searchTerm ? 'No courses match your search.' : 'No courses available.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isEnrolled = course.registeredUsers.includes(user?._id);
              const imageUrl = course.imageUrl || '/images/grid-image/image-01.png';

              return (
                <div
                  key={course._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg
                            transition-shadow overflow-hidden group"
                >
                  {/* Course Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img
                      src={imageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {isEnrolled && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Enrolled
                      </div>
                    )}
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {course.description}
                    </p>

                    {/* Course Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span>
                        📚 {course.sections?.length || 0} sections
                      </span>
                      <span>
                        👥 {course.registeredUsers?.length || 0} enrolled
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {isEnrolled ? (
                        <button
                          onClick={() => handleViewCourse(course?._id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium
                                   py-2 px-4 rounded-lg transition-colors"
                        >
                          View Course
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegister(course._id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium
                                   py-2 px-4 rounded-lg transition-colors"
                        >
                          Enroll Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
