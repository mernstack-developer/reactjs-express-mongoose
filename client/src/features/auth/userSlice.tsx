import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../store'; // Assumes you have your store file
import { apiClient } from '../../utils/api';
import {User} from '../../types/types';
// // Define TypeScript types
// export interface User {
//   _id: string;
//   name: string;
//   email: string;
//   roles: string[]; // Just storing role names here for simplicity in the frontend user object
// }

export interface UserState {
  data: User | null;
  isAuthenticated: boolean;
  permissions: string[]; // The flat list of all capabilities
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  data: null,
  isAuthenticated: false,
  permissions: [],
  loading: false,
  error: null,
};

// --- Async Thunks ---

// Thunk for handling user login
// This assumes your backend /api/auth/login returns a user object 
// AND a flat list of all permissions associated with that user's roles.
export const loginUser = createAsyncThunk<
  { data: User; permissions: string[] }, // Return type
  { email: string; password: string }    // Argument type
>('user/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    // Set the Authorization header for future requests immediately
   // axios.defaults.headers.common['x-auth-token'] = token;
    return {data: user, permissions: user.role.permissions.map((p: any) => p.name)};
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});
export const fetchProfile=createAsyncThunk<
{data:User},// Return type
{email: string;}// Argument type
>('user/profile',async({email},{rejectWithValue})=>{
  try{
  const response = await apiClient.get('/auth/profile', { email });
  return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
})

// Thunk for handling user logout
export const logoutUser = createAsyncThunk('user/logout', async () => {
  // Optional: Invalidate server session/cookie
  await apiClient.post('/auth/logout');
  // We clear the state locally regardless of API success
});

// Thunk to check auth status on app load (e.g., check valid token in cookie)
export const checkAuthStatus = createAsyncThunk(
  'user/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      // Assumes a backend endpoint that returns user data if a valid session exists
      const response = await apiClient.get('/auth/status');
      return response.data;
    } catch (error) {
      return rejectWithValue('Not authenticated');
    }
  }
);


// --- The Slice ---

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Login Handlers ---
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.data = action.payload.data;
        console.log("permissions in slice:", action.payload);
        state.permissions = action.payload.permissions;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        // Remove token if login fails
        localStorage.removeItem('token');
        axios.defaults.headers.common['x-auth-token'] = null;
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.error.message || 'Login failed';
        state.data = null;
        state.permissions = [];
        state.error = action.payload as string;
      })

      // --- Logout Handlers ---
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.data = null;
        state.permissions = [];
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Clear cookies/local storage logic might be here or in the thunk
      })
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        // Assume checkAuthStatus returns { user, permissions } just like login
        state.isAuthenticated = true;
        state.data = action.payload.user;
        state.permissions = action.payload?.user?.role?.permissions;
        state.loading = false;
        state.error = null;
        console.log("permissions in slice checkAuthStatus:", action.payload);
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isAuthenticated = false;
        state.data = null;
        state.permissions = [];
                console.log("Auth rejected:", state);

      })
      //profileHandler//
       .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
                console.log("permissions in slice fetchProfile:", action.payload.data);

        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
        state.data = null;
        state.error = action.payload as string;
      })

  },
});

// Selector to easily get permissions
export const selectPermissions = (state: RootState) => state.user.permissions;

export default userSlice.reducer;
