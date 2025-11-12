import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  createRole,
  updateRole,
  fetchPermissions,
  addPermissionToRole,
  removePermissionFromRole,
} from '../features/rolePermissions/rolePermissionsSlice';
import { Role, Permission } from '../types/types';
import Label from './form/Label';

const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleFormProps {
  role?: Role | null;
  onSuccess?: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ role, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { loading, error, permissions } = useAppSelector((state: any) => state.rolePermissions);
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
    },
  });

  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  useEffect(() => {
    reset({
      name: role?.name || '',
      description: role?.description || '',
    });

    if (role?.permissions) {
      setSelectedPermissions(
        (role.permissions as Permission[]).map((p) => p._id)
      );
    }
  }, [role, reset]);

  const onSubmit = async (data: RoleFormData) => {
    try {
      let savedRole: Role;

      if (role?._id) {
        const result = await dispatch(
          updateRole({ id: role._id, data })
        ).unwrap();
        savedRole = result;
      } else {
        const result = await dispatch(createRole(data)).unwrap();
        savedRole = result;
      }

      // Update permissions if role exists
      if (savedRole._id) {
        const currentPermissions = role?.permissions
          ? (role.permissions as Permission[]).map((p) => p._id)
          : [];

        // Add new permissions
        for (const permId of selectedPermissions) {
          if (!currentPermissions.includes(permId)) {
            await dispatch(
              addPermissionToRole({ roleId: savedRole._id, permissionId: permId })
            ).unwrap();
          }
        }

        // Remove unselected permissions
        for (const permId of currentPermissions) {
          if (!selectedPermissions.includes(permId)) {
            await dispatch(
              removePermissionFromRole({ roleId: savedRole._id, permissionId: permId })
            ).unwrap();
          }
        }
      }

      reset();
      setSelectedPermissions([]);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to save role:', err);
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Role Name *</Label>
        <input
          id="name"
          {...register('name')}
          placeholder="e.g., Editor"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          {...register('description')}
          placeholder="Role description"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <Label>Permissions</Label>
        <div className="space-y-2 mt-2 max-h-48 overflow-y-auto border border-gray-300 p-3 rounded-md">
          {permissions.length > 0 ? (
            permissions.map((permission: Permission) => (
              <label key={permission._id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission._id)}
                  onChange={() => togglePermission(permission._id)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{permission.name}</span>
              </label>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No permissions available</p>
          )}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting || loading ? 'Saving...' : role?._id ? 'Update Role' : 'Create Role'}
      </button>
    </form>
  );
};

export default RoleForm;
