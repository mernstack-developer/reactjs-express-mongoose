import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { useNavigate } from 'react-router-dom';
import { fetchUsers, deleteUser } from '../features/users/usersSlice';
import { fetchCourses } from '../features/courses/coursesSlice';
import EditUserForm from '../components/EditUserForm';
import Search from '../components/common/Search';
import Sort, { SortOption } from '../components/common/Sort';
import Pagination from '../components/common/Pagination';
import PageBreadCrumb from '../components/common/PageBreadCrumb';
import { User, Course } from '../types/types';

const UserManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: users, loading, error } = useAppSelector(state => state.users);
  const { data: courses } = useAppSelector((state: any) => state.courses);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('firstname');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortOptions: SortOption[] = [
    { label: 'First Name A-Z', value: 'firstname' },
    { label: 'Last Name A-Z', value: 'lastname' },
    { label: 'Email A-Z', value: 'email' },
    { label: 'Role', value: 'role' },
    { label: 'Newest First', value: 'createdAt' },
  ];

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        await dispatch(fetchUsers());
      } catch (err) {
        console.error('Failed to delete user:', err);
      }
    }
  };

  const handleCloseEdit = () => {
    setEditingUser(null);
    dispatch(fetchUsers());
  };

  // Function to count enrolled courses for a user
  const getEnrolledCoursesCount = (userId: string) => {
    return (courses || []).filter((course: Course) =>
      (course.registeredUsers || []).includes(userId)
    ).length;
  };

  // Filter by search
  const filteredUsers = users.filter((user: User) =>
    user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a: User, b: User) => {
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
    } else if (sortBy === 'role') {
      compareA = typeof a.role === 'string' ? a.role.toLowerCase() : '';
      compareB = typeof b.role === 'string' ? b.role.toLowerCase() : '';
    } else if (sortBy === 'createdAt') {
      compareA = new Date(a.createdAt || 0).getTime();
      compareB = new Date(b.createdAt || 0).getTime();
    }

    if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <PageBreadCrumb pageTitle="User Management" />

      <h1 className="mb-6 text-2xl font-bold">Users</h1>

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

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-bold">Edit User</h2>
            <EditUserForm
              user={editingUser}
              onClose={handleCloseEdit}
            />
          </div>
        </div>
      )}

      {/* User Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="border-b border-gray-200 p-3 text-left font-semibold dark:border-gray-700">Name</th>
              <th className="border-b border-gray-200 p-3 text-left font-semibold dark:border-gray-700">Email</th>
              <th className="border-b border-gray-200 p-3 text-left font-semibold dark:border-gray-700">Phone</th>
              <th className="border-b border-gray-200 p-3 text-left font-semibold dark:border-gray-700">Role</th>
              <th className="border-b border-gray-200 p-3 text-center font-semibold dark:border-gray-700">Enrolled Courses</th>
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
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-600 dark:text-gray-400">
                  {searchQuery ? 'No users match your search' : 'No users found'}
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user: User) => (
                <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                  <td className="p-3 font-medium text-gray-900 dark:text-white">
                    {user.firstname} {user.lastname}
                  </td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{user.email}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{user.phone || '-'}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {typeof user.role === 'string' ? user.role : (user.role as any)?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => navigate(`/user/${user._id}/enrolled-courses`)}
                      className="inline-flex items-center justify-center rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                    >
                      {getEnrolledCoursesCount(user._id)}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
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
      {totalPages > 1 && paginatedUsers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={sortedUsers.length}
          loading={loading}
        />
      )}
    </div>
  );
};

export default UserManagement;
