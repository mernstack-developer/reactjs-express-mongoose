import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { useNavigate } from 'react-router-dom';
import { fetchPublicCourses, enrollInCourse } from '../features/courses/coursesSlice';
import { addToCart, fetchCart } from '../features/cart/cartSlice';
import PageBreadCrumb from '../components/common/PageBreadCrumb';
import type { Course } from '../types/types';

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

interface FilterState {
  enrollmentType: string;
  searchTerm: string;
}

export default function PublicCourses() {
  const navigate = useNavigate();
  const user = useAppSelector(state => state.user.data);
  const isAuthenticated = useAppSelector(state => state.user.isAuthenticated);
  const dispatch = useAppDispatch();
  const { data: courses, loading, error } = useAppSelector((state: any) => state.courses);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [enrollmentModal, setEnrollmentModal] = useState<{
    visible: boolean;
    course: Course | null;
  }>({ visible: false, course: null });

  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 9,
  });

  const [filters, setFilters] = useState<FilterState>({
    enrollmentType: 'all',
    searchTerm: '',
  });

  // Fetch public courses from Redux
  useEffect(() => {
    dispatch(fetchPublicCourses());
  }, [dispatch]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...courses];

    // Filter by enrollment type
    if (filters.enrollmentType !== 'all') {
      filtered = filtered.filter(
        course => course.enrollmentType === filters.enrollmentType
      );
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter((course: Course) =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description?.toLowerCase().includes(searchLower) ||
        (course.tags || []).some((tag: string) =>
          tag.toLowerCase().includes(searchLower)
        )
      );
    }

    setFilteredCourses(filtered);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  }, [courses, filters]);

  // Pagination calculations
  const totalPages = Math.ceil(
    filteredCourses.length / pagination.itemsPerPage
  );
  const startIndex =
    (pagination.currentPage - 1) * pagination.itemsPerPage;
  const endIndex = startIndex + pagination.itemsPerPage;
  const displayedCourses = filteredCourses.slice(startIndex, endIndex);

  const handleEnrollClick = (course: Course) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/public-courses' } });
      return;
    }

    setEnrollmentModal({ visible: true, course });
  };

  const handleEnrollFree = async (courseId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setEnrollingCourseId(courseId);
      await dispatch(enrollInCourse(courseId)).unwrap();
      // Optimistically update UI by dispatching fetchPublicCourses again
      dispatch(fetchPublicCourses());
      setEnrollmentModal({ visible: false, course: null });
      alert('Successfully enrolled in the course!');
    } catch (err: any) {
      console.error('Error enrolling in course:', err);
      alert(err?.message || 'Failed to enroll in course');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const handleBuyCourse = async (course: Course) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/public-courses' } });
      return;
    }

    try {
      // Add course to cart
      await dispatch(addToCart(course._id)).unwrap();
      
      // Refresh cart data
      await dispatch(fetchCart()).unwrap();
      
      // Show success message and redirect to cart
      alert(`Course "${course.title}" added to cart successfully!`);
      navigate('/cart');
    } catch (error: any) {
      console.error('Error adding course to cart:', error);
      alert(error.message || 'Failed to add course to cart. Please try again.');
    }
  };

  const isEnrolled = (course: Course) => {
    if (!user) return false;
    return course.registeredUsers?.includes(user._id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 inline-block">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageBreadCrumb pageTitle="Public Courses" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
            Explore Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and enroll in courses tailored to your interests
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Search */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Search Courses
              </label>
              <input
                type="text"
                placeholder="Search by title, description, or tags..."
                value={filters.searchTerm}
                onChange={e =>
                  setFilters(prev => ({
                    ...prev,
                    searchTerm: e.target.value,
                  }))
                }
                className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
              />
            </div>

            {/* Enrollment Type Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Enrollment Type
              </label>
              <select
                value={filters.enrollmentType}
                onChange={e =>
                  setFilters(prev => ({
                    ...prev,
                    enrollmentType: e.target.value,
                  }))
                }
                className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
              >
                <option value="all">All Types</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
                <option value="approval">Approval Required</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {/* No Results */}
        {filteredCourses.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-800">
            <p className="text-gray-600 dark:text-gray-400">
              No courses found matching your criteria.
            </p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredCourses.length)} of{' '}
              {filteredCourses.length} courses
            </div>

            {/* Courses Grid */}
            <div className="mb-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {displayedCourses.map(course => (
                <div
                  key={course._id}
                  className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
                >
                  {/* Course Image */}
                  {course.imageUrl && (
                    <div className="relative h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  {/* Course Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {course.description}
                    </p>

                    {/* Tags */}
                    {course.tags && course.tags.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {course.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            {tag}
                          </span>
                        ))}
                        {course.tags.length > 2 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{course.tags.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Enrollment Info */}
                    <div className="mb-4 space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Enrollment:
                        </span>
                        <span className="inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium capitalize text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {course.enrollmentType}
                        </span>
                      </div>

                      {/* Price for Paid Courses */}
                      {course.enrollmentType === 'paid' && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Price:
                          </span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ${course.price} {course.currency || 'USD'}
                          </span>
                        </div>
                      )}

                      {/* Student Count */}
                      {course.maxStudents && (
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            {course.registeredUsers?.length || 0} /{' '}
                            {course.maxStudents} students
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => {
                        if (course.enrollmentType === 'paid') {
                          handleBuyCourse(course);
                        } else {
                          handleEnrollClick(course);
                        }
                      }}
                      disabled={
                        isEnrolled(course) ||
                        enrollingCourseId === course._id
                      }
                      className="w-full rounded-lg bg-blue-600 px-4 py-2 text-center font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      {isEnrolled(course) ? (
                        '✓ Enrolled'
                      ) : enrollingCourseId === course._id ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Processing...
                        </span>
                      ) : course.enrollmentType === 'paid' ? (
                        'Add to Cart'
                      ) : (
                        'Enroll Free'
                      )}
                    </button>

                    {/* View Course Link */}
                    {isEnrolled(course) && (
                      <button
                        onClick={() => navigate(`/course/${course._id}`)}
                        className="mt-2 w-full rounded-lg border border-blue-600 px-4 py-2 text-center font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      >
                        View Course
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() =>
                    setPagination(prev => ({
                      ...prev,
                      currentPage: Math.max(1, prev.currentPage - 1),
                    }))
                  }
                  disabled={pagination.currentPage === 1}
                  className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  page => (
                    <button
                      key={page}
                      onClick={() =>
                        setPagination(prev => ({
                          ...prev,
                          currentPage: page,
                        }))
                      }
                      className={`rounded px-3 py-2 text-sm font-medium ${
                        pagination.currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    setPagination(prev => ({
                      ...prev,
                      currentPage: Math.min(
                        totalPages,
                        prev.currentPage + 1
                      ),
                    }))
                  }
                  disabled={pagination.currentPage === totalPages}
                  className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Enrollment Modal */}
      {enrollmentModal.visible && enrollmentModal.course && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              {enrollmentModal.course.title}
            </h2>

            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {enrollmentModal.course.description}
            </p>

            {/* Price */}
            {enrollmentModal.course.enrollmentType === 'paid' && (
              <div className="mb-6 rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
                <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                  Course Price
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${enrollmentModal.course.price}{' '}
                  <span className="text-lg text-gray-600 dark:text-gray-400">
                    {enrollmentModal.course.currency || 'USD'}
                  </span>
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setEnrollmentModal({ visible: false, course: null })}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>

              {enrollmentModal.course.enrollmentType === 'paid' ? (
                <button
                  onClick={() => handleBuyCourse(enrollmentModal.course!)}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Buy Now
                </button>
              ) : (
                <button
                  onClick={() =>
                    handleEnrollFree(enrollmentModal.course?._id!)
                  }
                  disabled={enrollingCourseId === enrollmentModal.course._id}
                  className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:bg-gray-400 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  {enrollingCourseId === enrollmentModal.course._id
                    ? 'Enrolling...'
                    : 'Enroll Free'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
