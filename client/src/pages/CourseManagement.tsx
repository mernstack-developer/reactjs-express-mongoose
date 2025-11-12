import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchCourses, deleteCourse, duplicateCourse } from '../features/courses/coursesSlice';
import PageBreadCrumb from '../components/common/PageBreadCrumb';
import Search from '../components/common/Search';
import Sort, { SortOption } from '../components/common/Sort';
import Pagination from '../components/common/Pagination';

const CourseManagement: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: courses, loading } = useAppSelector((state: any) => state.courses);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortOptions: SortOption[] = [
    { label: 'Title A-Z', value: 'title' },
    { label: 'Newest First', value: 'createdAt' },
    { label: 'Sections Count', value: 'sections' },
    { label: 'Instructor', value: 'instructor' },
  ];

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const toggleSelected = (courseId: string) => {
    const newSet = new Set(selected);
    if (newSet.has(courseId)) {
      newSet.delete(courseId);
    } else {
      newSet.add(courseId);
    }
    setSelected(newSet);
  };

  const selectAll = () => {
    if (selected.size === paginatedCourses.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginatedCourses.map((c: any) => c._id)));
    }
  };

  const handleBulkAction = async () => {
    for (const courseId of selected) {
      if (bulkAction === 'delete') {
        try {
          await dispatch(deleteCourse(courseId)).unwrap();
        } catch (err) {
          console.error(`Failed to delete course ${courseId}:`, err);
        }
      }
    }
    setSelected(new Set());
    setBulkAction('');
    await dispatch(fetchCourses());
  };

  const handleDelete = async (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await dispatch(deleteCourse(courseId)).unwrap();
        await dispatch(fetchCourses());
      } catch (err) {
        console.error('Failed to delete course:', err);
      }
    }
  };

  const handleDuplicate = async (courseId: string) => {
    try {
      await dispatch(duplicateCourse(courseId)).unwrap();
      await dispatch(fetchCourses());
    } catch (err) {
      console.error('Failed to duplicate course:', err);
    }
  };

  // Filter by search
  const filteredCourses = courses.filter((course: any) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a: any, b: any) => {
    let compareA: any = '';
    let compareB: any = '';

    if (sortBy === 'title') {
      compareA = a.title.toLowerCase();
      compareB = b.title.toLowerCase();
    } else if (sortBy === 'createdAt') {
      compareA = new Date(a.createdAt || 0).getTime();
      compareB = new Date(b.createdAt || 0).getTime();
    } else if (sortBy === 'sections') {
      compareA = (a.sections || []).length;
      compareB = (b.sections || []).length;
    } else if (sortBy === 'instructor') {
      compareA = a.instructor?.toLowerCase() || '';
      compareB = b.instructor?.toLowerCase() || '';
    }

    if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sortedCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourses = sortedCourses.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6">
      <PageBreadCrumb pageTitle="Course Management" />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Courses</h1>
        <button
          onClick={() => navigate('/course/create')}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Create Course
        </button>
      </div>

      {/* Search and Sort Controls */}
      <div className="mb-6 flex flex-col gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1">
          <Search
            placeholder="Search by title or description..."
            onSearch={(query) => {
              setSearchQuery(query);
              setCurrentPage(1);
            }}
            debounceMs={300}
            initialValue={searchQuery}
            loading={loading}
          />
        </div>
        <div className="flex-1 sm:min-w-64">
          <Sort
            options={sortOptions}
            currentSort={sortBy}
            currentOrder={sortOrder}
            onSortChange={(sort, order) => {
              setSortBy(sort);
              setSortOrder(order);
              setCurrentPage(1);
            }}
            loading={loading}
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="rounded border border-gray-300 px-3 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="">Choose action</option>
            <option value="delete">Delete</option>
          </select>
          {bulkAction && (
            <button
              onClick={handleBulkAction}
              className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
            >
              Apply
            </button>
          )}
        </div>
      )}

      {/* Course Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="border-b border-gray-200 p-3 text-left dark:border-gray-700">
                <input
                  type="checkbox"
                  checked={selected.size === paginatedCourses.length && paginatedCourses.length > 0}
                  onChange={selectAll}
                  className="rounded"
                />
              </th>
              <th className="border-b border-gray-200 p-3 text-left font-semibold dark:border-gray-700">Title</th>
              <th className="border-b border-gray-200 p-3 text-left font-semibold dark:border-gray-700">Instructor</th>
              <th className="border-b border-gray-200 p-3 text-center font-semibold dark:border-gray-700">Sections</th>
              <th className="border-b border-gray-200 p-3 text-center font-semibold dark:border-gray-700">Enrolled Students</th>
              <th className="border-b border-gray-200 p-3 text-left font-semibold dark:border-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                </td>
              </tr>
            ) : paginatedCourses.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-600 dark:text-gray-400">
                  {searchQuery ? 'No courses match your search' : 'No courses found'}
                </td>
              </tr>
            ) : (
              paginatedCourses.map((course: any) => (
                <tr key={course._id} className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.has(course._id)}
                      onChange={() => toggleSelected(course._id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-3 font-medium text-gray-900 dark:text-white">{course.title}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{course.instructor || '-'}</td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-sm font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {(course.sections || []).length}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => navigate(`/admin/courses/${course._id}/enrollments`)}
                      className="inline-flex items-center justify-center rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                    >
                      {(course.registeredUsers || []).length}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/courses/${course._id}/editor`)}
                        className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDuplicate(course._id)}
                        className="rounded bg-cyan-500 px-3 py-1 text-sm text-white hover:bg-cyan-600"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={() => handleDelete(course._id)}
                        className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && paginatedCourses.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={sortedCourses.length}
          loading={loading}
        />
      )}
    </div>
  );
};

export default CourseManagement;
