import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../hooks';
import { createPermission, updatePermission } from '../features/rolePermissions/rolePermissionsSlice';
import { Permission } from '../types/types';
import Label from './form/Label';

const permissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required'),
  description: z.string().optional(),
});

type PermissionFormData = z.infer<typeof permissionSchema>;

interface PermissionFormProps {
  permission?: Permission | null;
  onSuccess?: () => void;
}

const PermissionForm: React.FC<PermissionFormProps> = ({ permission, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state: any) => state.rolePermissions);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      name: permission?.name || '',
      description: permission?.description || '',
    },
  });

  useEffect(() => {
    reset({
      name: permission?.name || '',
      description: permission?.description || '',
    });
  }, [permission, reset]);

  const onSubmit = async (data: PermissionFormData) => {
    try {
      if (permission?._id) {
        await dispatch(
          updatePermission({ id: permission._id, data })
        ).unwrap();
      } else {
        await dispatch(createPermission(data)).unwrap();
      }
      reset();
      onSuccess?.();
    } catch (err) {
      console.error('Failed to save permission:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Permission Name *</Label>
        <input
          id="name"
          {...register('name')}
          placeholder="e.g., view_dashboard"
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
          placeholder="Permission description"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting || loading ? 'Saving...' : permission?._id ? 'Update Permission' : 'Create Permission'}
      </button>
    </form>
  );
};

export default PermissionForm;
