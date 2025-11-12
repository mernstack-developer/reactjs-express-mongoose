import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  fetchUsers,
  editUser,
} from '../features/users/usersSlice';
import {
  fetchRoles,
  fetchPermissions,
} from '../features/rolePermissions/rolePermissionsSlice';
import { User, Role } from '../types/types';
import Label from './form/Label';

interface UserPermissionManagerProps {
  userId?: string;
  onSuccess?: () => void;
}

const UserPermissionManager: React.FC<UserPermissionManagerProps> = ({
  userId,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { data: users, loading: usersLoading } = useAppSelector((state: any) => state.users);
  const { roles, loading: rolePermLoading } = useAppSelector((state: any) => state.rolePermissions);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoles());
    dispatch(fetchPermissions());
  }, [dispatch]);

  useEffect(() => {
    if (userId && users.length > 0) {
      const user = users.find((u: User) => u._id === userId);
      if (user) {
        setSelectedUser(user);
        const roleId = typeof user.role === 'string' ? user.role : user.role._id;
        setSelectedRole(roleId);
      }
    }
  }, [userId, users]);

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const user = users.find((u: User) => u._id === e.target.value);
    setSelectedUser(user || null);
    if (user) {
      const roleId = typeof user.role === 'string' ? user.role : user.role._id;
      setSelectedRole(roleId);
    }
    setError(null);
    setSuccess(null);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
    setError(null);
    setSuccess(null);
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      setError('Please select both a user and a role');
      return;
    }

    try {
      await dispatch(
        editUser({
          userId: selectedUser._id,
          userData: { role: selectedRole },
        })
      ).unwrap();

      setSuccess(`Role assigned to ${selectedUser.firstname} ${selectedUser.lastname}`);
      setSelectedUser(null);
      setSelectedRole('');
      onSuccess?.();
      dispatch(fetchUsers());
    } catch (err: any) {
      setError(err || 'Failed to assign role');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Assign Role to User</h3>

        <div className="space-y-4">
          {/* User Selection */}
          <div>
            <Label htmlFor="user-select">Select User *</Label>
            <select
              id="user-select"
              value={selectedUser?._id || ''}
              onChange={handleUserSelect}
              disabled={usersLoading || rolePermLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a user --</option>
              {users.map((user: User) => (
                <option key={user._id} value={user._id}>
                  {user.firstname} {user.lastname} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Role Selection */}
          {selectedUser && (
            <div>
              <Label htmlFor="role-select">Assign Role *</Label>
              <select
                id="role-select"
                value={selectedRole}
                onChange={handleRoleChange}
                disabled={usersLoading || rolePermLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a role --</option>
                {roles.map((role: Role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Display Role Permissions */}
          {selectedRole && roles.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-md">
              {(() => {
                const role = roles.find((r: Role) => r._id === selectedRole);
                const rolePermissions = role?.permissions || [];
                return (
                  <>
                    <p className="font-semibold mb-2">
                      Role Permissions:
                    </p>
                    {rolePermissions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {(rolePermissions as any[]).map((perm) => (
                          <span
                            key={perm._id}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                          >
                            {perm.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No permissions assigned to this role</p>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* Assign Button */}
          <button
            onClick={handleAssignRole}
            disabled={!selectedUser || !selectedRole || usersLoading || rolePermLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {usersLoading || rolePermLoading ? 'Loading...' : 'Assign Role'}
          </button>
        </div>
      </div>

      {/* Current Users and Their Roles */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Current User Roles</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-left">Role</th>
                <th className="border px-4 py-2 text-left">Permissions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: User) => {
                const userRole = typeof user.role === 'string'
                  ? roles.find((r: Role) => r._id === user.role)
                  : user.role;
                const permissions = (userRole as any)?.permissions || [];
                return (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">
                      {user.firstname} {user.lastname}
                    </td>
                    <td className="border px-4 py-2">{user.email}</td>
                    <td className="border px-4 py-2 font-semibold">
                      {(userRole as any)?.name || 'No Role'}
                    </td>
                    <td className="border px-4 py-2 text-sm">
                      {permissions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {permissions.map((p: any) => (
                            <span
                              key={p._id}
                              className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
                            >
                              {p.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">No permissions</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserPermissionManager;
