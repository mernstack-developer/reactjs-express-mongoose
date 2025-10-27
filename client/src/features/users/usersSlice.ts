import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { User, ApiResponse } from '../../types/types';

interface UsersState {
  data: User[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: UsersState = {
  data: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

export const fetchUsers = createAsyncThunk<User[]>(
  'users/fetchUsers',
  async () => {
    const response = await axios.get<ApiResponse<User[]>>('/api/users');
    console.log('Fetched users:', response.data);
    return response.data.data;
  }
);

export const addUser = createAsyncThunk<User, Omit<User, 'id' | 'createdAt' | 'updatedAt'>>(
  'users/addUser',
  async (userData) => {
    const response = await axios.post<ApiResponse<User>>('/api/users', userData);
    return response.data.data;
  }
);

export const editUser = createAsyncThunk<
  User,
  { userId: string; userData: Partial<User> }
>(
  'users/editUser',
  async ({ userId, userData }) => {
    const response = await axios.put<ApiResponse<User>>(`/api/users/${userId}`, userData);
    return response.data.data;
  }
);

export const deleteUser = createAsyncThunk<string, string>(
  'users/deleteUser',
  async (userId) => {
    await axios.delete(`/api/users/${userId}`);
    return userId;
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.data = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An error occurred';
      })
      .addCase(addUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.data.push(action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(editUser.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.data.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.data = state.data.filter(user => user.id !== action.payload);
        state.lastUpdated = new Date().toISOString();
      });
  },
});

export default usersSlice.reducer;