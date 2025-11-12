import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  fetchPermissions,
  deletePermission,
  selectPermission,
} from '../features/rolePermissions/rolePermissionsSlice';
import { Permission } from '../types/types';
import PermissionForm from '../components/PermissionForm';
import PageBreadCrumb from '../components/common/PageBreadCrumb';

const PermissionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { permissions, selectedPermission, loading, error } = useAppSelector(
    (state: any) => state.rolePermissions
  );

  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  const handleSelectPermission = (permission: Permission) => {
    dispatch(selectPermission(permission));
  };

  const handleDeletePermission = async (permissionId: string) => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      try {
        await dispatch(deletePermission(permissionId)).unwrap();
        dispatch(selectPermission(null));
      } catch (err) {
        console.error('Failed to delete permission:', err);
      }
    }
  };

  const handleFormSuccess = () => {
    dispatch(selectPermission(null));
    dispatch(fetchPermissions());
  };

  const handleNewPermission = () => {
    dispatch(selectPermission(null));
  };

  return (
    <div>
      <PageBreadCrumb pageTitle="Permissions" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {selectedPermission ? 'Edit Permission' : 'Create New Permission'}
            </h2>
            <PermissionForm
              permission={selectedPermission}
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Permissions List</h2>
              <button
                onClick={handleNewPermission}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                + New Permission
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <p className="text-gray-500">Loading permissions...</p>
            ) : permissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-4 py-2 text-left">Name</th>
                      <th className="border px-4 py-2 text-left">Description</th>
                      <th className="border px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((permission: Permission) => (
                      <tr
                        key={permission._id}
                        className={`hover:bg-gray-50 ${
                          selectedPermission?._id === permission._id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="border px-4 py-2 font-medium">
                          {permission.name}
                        </td>
                        <td className="border px-4 py-2 text-gray-600">
                          {permission.description || '-'}
                        </td>
                        <td className="border px-4 py-2 text-center space-x-2">
                          <button
                            onClick={() => handleSelectPermission(permission)}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePermission(permission._id)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No permissions found. Create one to get started.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsPage;
