import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchUsers } from '../features/users/usersSlice';
import Search from '../components/common/Search';
import Sort, { SortOption } from '../components/common/Sort';
import Pagination from '../components/common/Pagination';
import PageBreadCrumb from '../components/common/PageBreadCrumb';
import { User } from '../types/types';

const UsersByRole: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: allUsers, loading, error } = useAppSelector(state => state.users);
  const { roles } = useAppSelector((state: any) => state.rolePermissions);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('firstname');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortOptions: SortOption[] = [
    { label: 'First Name A-Z', value: 'firstname' },
    { label: 'Last Name A-Z', value: 'lastname' },
    { label: 'Email A-Z', value: 'email' },
    { label: 'Newest First', value: 'createdAt' },
  ];

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Find role name
  const selectedRole = roles.find((r: any) => r._id === roleId);
  const roleName = selectedRole?.name || 'Unknown Role';

  // Filter users by role
  const usersWithRole = allUsers.filter((user: User) => {
    const userRole = typeof user.role === 'string' ? user.role : (user.role as any)?._id;
    return userRole === roleId;
  });

  // Filter by search
  const filteredUsers = usersWithRole.filter((user: User) =>
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
      <PageBreadCrumb pageTitle={`Users - ${roleName}`} />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {roleName} Users ({usersWithRole.length})
        </h1>
        <button
          onClick={() => navigate('/admin/roles')}
          className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
        >
          Back to Roles
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

      {/* Users Table */}
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
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                </td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-600 dark:text-gray-400">
                  {searchQuery ? 'No users match your search' : 'No users found with this role'}
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
                    <button
                      onClick={() => navigate(`/admin/users`)}
                      className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                    >
                      Edit
                    </button>
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

export default UsersByRole;
