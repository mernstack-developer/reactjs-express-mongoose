import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { menuApi } from '../../utils/api';
import { MenuItem } from '../../types/types';

export interface MenuState {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: MenuState = {
  menuItems: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const fetchMenuItems = createAsyncThunk<MenuItem[]>(
  'menu/fetchMenuItems',
  async () => {
    const response = await menuApi.getAllMenuItems();
    return response.data;
  }
);

export const createMenuItem = createAsyncThunk<MenuItem, Omit<MenuItem, '_id'>>(
  'menu/createMenuItem',
  async (menuItemData) => {
    const response = await menuApi.createMenuItem(menuItemData);
    return response.data;
  }
);

export const updateMenuItem = createAsyncThunk<MenuItem, { id: string; data: Partial<MenuItem> }>(
  'menu/updateMenuItem',
  async ({ id, data }) => {
    const response = await menuApi.updateMenuItem(id, data);
    return response.data;
  }
);

export const deleteMenuItem = createAsyncThunk<string, string>(
  'menu/deleteMenuItem',
  async (id) => {
    await menuApi.deleteMenuItem(id);
    return id;
  }
);

export const reorderMenuItems = createAsyncThunk<MenuItem[], MenuItem[]>(
  'menu/reorderMenuItems',
  async (items) => {
    const response = await menuApi.reorderMenuItems(items);
    return response.data;
  }
);

// Slice
const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    clearMenuError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch menu items
    builder
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.menuItems = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch menu items';
      });

    // Create menu item
    builder
      .addCase(createMenuItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        state.menuItems.push(action.payload);
      })
      .addCase(createMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create menu item';
      });

    // Update menu item
    builder
      .addCase(updateMenuItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.menuItems.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.menuItems[index] = action.payload;
        }
      })
      .addCase(updateMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update menu item';
      });

    // Delete menu item
    builder
      .addCase(deleteMenuItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        state.menuItems = state.menuItems.filter(item => item._id !== action.payload);
      })
      .addCase(deleteMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete menu item';
      });

    // Reorder menu items
    builder
      .addCase(reorderMenuItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reorderMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.menuItems = action.payload;
      })
      .addCase(reorderMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to reorder menu items';
      });
  },
});

export const { clearMenuError } = menuSlice.actions;

export default menuSlice.reducer;

//write menuSlies
