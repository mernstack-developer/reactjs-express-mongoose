import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../utils/api';
import { ApiResponse, Category } from '../../types/types';

export interface CategoriesState {
  data: Category[];
  loading: boolean;
  error: string | null;
  selectedCategory: any | null;
}

const initialState: CategoriesState = {
  data: [],
  loading: false,
  error: null,
  selectedCategory: null,
};

export const fetchCategories = createAsyncThunk<Category[]>('categories/fetchCategories', async () => {
  const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
  if (!res.data) throw new Error('Failed to fetch categories');
  return res.data.data;
});

export const fetchCategoryById = createAsyncThunk<any, string>('categories/fetchCategoryById', async (id) => {
  const res = await apiClient.get<ApiResponse<any>>(`/categories/${id}`);
  if (!res.data) throw new Error('Failed to fetch category');
  return res.data.data;
});

export const createCategory = createAsyncThunk<any, { name: string; parent?: string | null }>('categories/createCategory', async (payload) => {
  const res = await apiClient.post<ApiResponse<any>>('/categories', payload);
  if (!res.data) throw new Error('Failed to create category');
  return res.data.data;
});

export const deleteCategory = createAsyncThunk<any, string>('categories/deleteCategory', async (id) => {
  const res = await apiClient.delete<ApiResponse<any>>(`/categories/${id}`);
  if (!res.data) throw new Error('Failed to delete category');
  return { id };
});

export const updateCategory = createAsyncThunk<any, { id: string; name: string; parent?: string | null }>('categories/updateCategory', async (payload) => {
  const { id, ...data } = payload;
  const res = await apiClient.put<ApiResponse<any>>(`/categories/${id}`, data);
  if (!res.data) throw new Error('Failed to update category');
  return res.data.data;
});

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => { state.loading = false; state.data = action.payload; })
      .addCase(fetchCategories.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to fetch categories'; })
      .addCase(fetchCategoryById.pending, (state) => { state.loading = true; state.error = null; state.selectedCategory = null; })
      .addCase(fetchCategoryById.fulfilled, (state, action) => { state.loading = false; state.selectedCategory = action.payload; })
      .addCase(fetchCategoryById.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to fetch category'; state.selectedCategory = null; })
      .addCase(createCategory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createCategory.fulfilled, (state, action) => { state.loading = false; state.data.unshift(action.payload); })
      .addCase(createCategory.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to create category'; })
      .addCase(deleteCategory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteCategory.fulfilled, (state, action) => { state.loading = false; state.data = state.data.filter(c => c._id !== action.payload.id); })
      .addCase(deleteCategory.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to delete category'; })
      .addCase(updateCategory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateCategory.fulfilled, (state, action) => { 
        state.loading = false; 
        const index = state.data.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to update category'; });
  }
});

export default categoriesSlice.reducer;
