import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../utils/api';
import { ApiResponse, Permission, Role } from '../../types/types';

export interface RolePermissionsState {
  roles: Role[];
  permissions: Permission[];
  loading: boolean;
  error: string | null;
  selectedRole: Role | null;
  selectedPermission: Permission | null;
}

const initialState: RolePermissionsState = {
  roles: [],
  permissions: [],
  loading: false,
  error: null,
  selectedRole: null,
  selectedPermission: null,
};

// Async Thunks for Permissions
export const fetchPermissions = createAsyncThunk<Permission[]>(
  'rolePermissions/fetchPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiResponse<Permission[]>>('/permissions');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch permissions');
    }
  }
);

export const createPermission = createAsyncThunk<Permission, Partial<Permission>>(
  'rolePermissions/createPermission',
  async (permissionData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ApiResponse<Permission>>('/permissions', permissionData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create permission');
    }
  }
);

export const updatePermission = createAsyncThunk<
  Permission,
  { id: string; data: Partial<Permission> }
>(
  'rolePermissions/updatePermission',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<ApiResponse<Permission>>(
        `/permissions/${id}`,
        data
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update permission');
    }
  }
);

export const deletePermission = createAsyncThunk<string, string>(
  'rolePermissions/deletePermission',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/permissions/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete permission');
    }
  }
);

// Async Thunks for Roles
export const fetchRoles = createAsyncThunk<Role[]>(
  'rolePermissions/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiResponse<Role[]>>('/roles');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch roles');
    }
  }
);

export const createRole = createAsyncThunk<Role, Partial<Role>>(
  'rolePermissions/createRole',
  async (roleData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ApiResponse<Role>>('/roles', roleData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create role');
    }
  }
);

export const updateRole = createAsyncThunk<Role, { id: string; data: Partial<Role> }>(
  'rolePermissions/updateRole',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<ApiResponse<Role>>(`/roles/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update role');
    }
  }
);

export const deleteRole = createAsyncThunk<string, string>(
  'rolePermissions/deleteRole',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/roles/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete role');
    }
  }
);

export const addPermissionToRole = createAsyncThunk<
  Role,
  { roleId: string; permissionId: string }
>(
  'rolePermissions/addPermissionToRole',
  async ({ roleId, permissionId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ApiResponse<Role>>(
        '/roles/permissions/add',
        { roleId, permissionId }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add permission to role');
    }
  }
);

export const removePermissionFromRole = createAsyncThunk<
  Role,
  { roleId: string; permissionId: string }
>(
  'rolePermissions/removePermissionFromRole',
  async ({ roleId, permissionId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ApiResponse<Role>>(
        '/roles/permissions/remove',
        { roleId, permissionId }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to remove permission from role');
    }
  }
);

const rolePermissionsSlice = createSlice({
  name: 'rolePermissions',
  initialState,
  reducers: {
    selectRole: (state, action: PayloadAction<Role | null>) => {
      state.selectedRole = action.payload;
    },
    selectPermission: (state, action: PayloadAction<Permission | null>) => {
      state.selectedPermission = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Permissions
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Permission
    builder
      .addCase(createPermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPermission.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions.push(action.payload);
      })
      .addCase(createPermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Permission
    builder
      .addCase(updatePermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePermission.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.permissions.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.permissions[index] = action.payload;
        }
      })
      .addCase(updatePermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Permission
    builder
      .addCase(deletePermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePermission.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = state.permissions.filter((p) => p._id !== action.payload);
      })
      .addCase(deletePermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Roles
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Role
    builder
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles.push(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Role
    builder
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.roles.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Role
    builder
      .addCase(deleteRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = state.roles.filter((r) => r._id !== action.payload);
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add Permission to Role
    builder
      .addCase(addPermissionToRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPermissionToRole.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.roles.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(addPermissionToRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Remove Permission from Role
    builder
      .addCase(removePermissionFromRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removePermissionFromRole.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.roles.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(removePermissionFromRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { selectRole, selectPermission } = rolePermissionsSlice.actions;
export default rolePermissionsSlice.reducer;
