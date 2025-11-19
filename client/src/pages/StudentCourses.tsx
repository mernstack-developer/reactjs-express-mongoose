import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRegisteredCourses } from '../features/courses/coursesSlice';
import { useAppDispatch, useAppSelector } from "../hooks";
import { RootState } from "../store";


export default function StudentCourses() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
       const { data:user}
     = useAppSelector((state: RootState) => state.user);
  // fetch only courses the current user is registered in
  const { data: courses, loading, error } = useAppSelector((state: any) => state.courses);
  
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if(!user?._id) return;
    dispatch(fetchRegisteredCourses({ userId: user._id }));
  }, [dispatch, user?._id]);

  const handleViewCourse = (courseId: string) => {
    // navigate to student course detail which includes start features
    navigate(`/courses/view/${courseId}`);
  };

  const getProgressForCourse = (course: any) => {
    // Prefer explicit user progress if backend returns it
    if (typeof course.userProgress === 'number') return Math.max(0, Math.min(100, course.userProgress));
    // Fallback: compute based on sections with user completion flags
    const sections = course.sections || [];
    if (!sections.length) return 0;
    let completed = 0;
    sections.forEach((s: any) => {
      // section.completedBy may be an array of user ids
      if (s.completedBy && Array.isArray(s.completedBy) && s.completedBy.includes(user?._id)) completed++;
      // or per-section userProgress flag
      if (s.userProgress && typeof s.userProgress === 'number' && s.userProgress >= 100) completed++;
    });
    return Math.round((completed / sections.length) * 100);
  };

  // Filter courses by search term. This page shows only registered courses returned by the thunk.
  const filteredCourses = (courses || []).filter((course: any) => {
    const matchesSearch = (course.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const enrolledCount = (courses || []).filter((c: any) => c.registeredUsers?.includes(user?._id)).length;
  const totalCount = (courses || []).length;

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
            You are enrolled in {enrolledCount} of {totalCount} course{totalCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4">
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
            {filteredCourses.map((course: any) => {
              const isEnrolled = !!course.registeredUsers?.includes(user?._id);
              const progress = getProgressForCourse(course);
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

                    {/* Progress */}
                    <div className="w-full mb-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{progress}% complete</div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewCourse(course?._id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium
                                 py-2 px-4 rounded-lg transition-colors"
                      >
                        Start Course
                      </button>
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
