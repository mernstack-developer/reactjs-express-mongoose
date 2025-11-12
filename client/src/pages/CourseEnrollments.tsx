import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageBreadCrumb from '../components/common/PageBreadCrumb';
import Search from '../components/common/Search';
import Sort, { SortOption } from '../components/common/Sort';
import Pagination from '../components/common/Pagination';

interface EnrolledStudent {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
}

const CourseEnrollments: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('firstname');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortOptions: SortOption[] = [
    { label: 'First Name A-Z', value: 'firstname' },
    { label: 'Last Name A-Z', value: 'lastname' },
    { label: 'Email A-Z', value: 'email' },
  ];

  useEffect(() => {
    const fetchCourseAndStudents = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.REACT_APP_API_URL || 'http://localhost:3000/api';
        
        // Fetch course details
        const courseRes = await axios.get(`${apiUrl}/courses/${courseId}`);
        setCourse(courseRes.data.data);

        // Fetch all users
        const usersRes = await axios.get(`${apiUrl}/users`);
        const allUsers = usersRes.data.data || [];
        
        // Filter enrolled students
        const registeredUserIds = courseRes.data.data?.registeredUsers || [];
        const enrolled = allUsers.filter((user: any) =>
          registeredUserIds.includes(user._id)
        );
        
        setStudents(enrolled);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load course enrollments');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseAndStudents();
    }
  }, [courseId]);

  // Filter by search
  const searchFiltered = students.filter((student: EnrolledStudent) =>
    student.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort students
  const sortedStudents = [...searchFiltered].sort((a: EnrolledStudent, b: EnrolledStudent) => {
    let compareA: any = '';
    let compareB: any = '';

    if (sortBy === 'firstname') {
      compareA = a.firstname.toLowerCase();
      compareB = b.firstname.toLowerCase();
    } else if (sortBy === 'lastname') {
      compareA = a.lastname.toLowerCase();
      compareB = b.lastname.toLowerCase();
    } else if (sortBy === 'email') {
      compareA = a.email.toLowerCase();
      compareB = b.email.toLowerCase();
    }

    if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = sortedStudents.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="p-6">
        <PageBreadCrumb pageTitle="Course Enrollments" />
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
        <PageBreadCrumb pageTitle="Course Enrollments" />
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
          <PageBreadCrumb pageTitle="Course Enrollments" />
          {course && (
            <h1 className="mt-4 text-2xl font-bold">
              {course.title} - Enrolled Students ({students.length})
            </h1>
          )}
        </div>
        <button
          onClick={() => navigate('/admin/courses')}
          className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Back to Courses
        </button>
      </div>

      {/* Search and Sort Controls */}
      <div className="mb-6 flex flex-col gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1">
          <Search
            placeholder="Search by name or email..."
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

      {/* Students Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="border-b border-gray-200 p-3 text-left font-semibold dark:border-gray-700">Name</th>
              <th className="border-b border-gray-200 p-3 text-left font-semibold dark:border-gray-700">Email</th>
              <th className="border-b border-gray-200 p-3 text-left font-semibold dark:border-gray-700">Phone</th>
              <th className="border-b border-gray-200 p-3 text-left font-semibold dark:border-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-600 dark:text-gray-400">
                  {searchQuery ? 'No students match your search' : 'No students enrolled in this course'}
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student: EnrolledStudent) => (
                <tr key={student._id} className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                  <td className="p-3 font-medium text-gray-900 dark:text-white">
                    {student.firstname} {student.lastname}
                  </td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{student.email}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{student.phone || '-'}</td>
                  <td className="p-3">
                    <button
                      onClick={() => navigate(`/admin/users`)}
                      className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && paginatedStudents.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={sortedStudents.length}
          loading={loading}
        />
      )}
    </div>
  );
};

export default CourseEnrollments;
