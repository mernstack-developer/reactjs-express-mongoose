import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  fetchRoles,
  deleteRole,
  selectRole,
} from '../features/rolePermissions/rolePermissionsSlice';
import { fetchUsers } from '../features/users/usersSlice';
import { Role } from '../types/types';
import RoleForm from '../components/RoleForm';
import PageBreadCrumb from '../components/common/PageBreadCrumb';

const RolesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { roles, selectedRole, loading, error } = useAppSelector(
    (state: any) => state.rolePermissions
  );
  const { data: users } = useAppSelector((state: any) => state.users);

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleSelectRole = (role: Role) => {
    dispatch(selectRole(role));
  };

  const handleDeleteRole = async (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await dispatch(deleteRole(roleId)).unwrap();
        dispatch(selectRole(null));
      } catch (err) {
        console.error('Failed to delete role:', err);
      }
    }
  };

  const handleFormSuccess = () => {
    dispatch(selectRole(null));
    dispatch(fetchRoles());
  };

  const handleNewRole = () => {
    dispatch(selectRole(null));
  };

  // Function to count users in a role
  const getUserCountForRole = (roleId: string): number => {
    return (users || []).filter((user: any) => {
      const userRoleId = typeof user.role === 'string' ? user.role : user.role?._id;
      return userRoleId === roleId;
    }).length;
  };

  return (
    <div>
      <PageBreadCrumb pageTitle="Roles" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              {selectedRole ? 'Edit Role' : 'Create New Role'}
            </h2>
            <RoleForm
              role={selectedRole}
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold dark:text-white">Roles List</h2>
              <button
                onClick={handleNewRole}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                + New Role
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading roles...</p>
            ) : roles.length > 0 ? (
              <div className="space-y-4">
                {roles.map((role: Role) => {
                  const userCount = getUserCountForRole(role._id);
                  return (
                    <div
                      key={role._id}
                      className={`border rounded-lg p-4 transition ${
                        selectedRole?._id === role._id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg dark:text-white">{role.name}</h3>
                          {role.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{role.description}</p>
                          )}
                        </div>
                        <div className="space-x-2 flex ml-4">
                          <button
                            onClick={() => navigate(`/role/${role._id}/users`)}
                            className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-sm font-medium text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
                          >
                            {userCount} user{userCount !== 1 ? 's' : ''}
                          </button>
                          <button
                            onClick={() => handleSelectRole(role)}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role._id)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Permissions */}
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Permissions:</p>
                        {role.permissions && (role.permissions as any[]).length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {(role.permissions as any[]).map((perm) => (
                              <span
                                key={perm._id}
                                className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs"
                              >
                                {perm.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400 text-xs">No permissions assigned</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No roles found. Create one to get started.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesPage;
