import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { apiClient } from '../../utils/api';

// Define notification interface and initial state
import { ApiResponse, Notification } from '../../types/types';
interface NotificationsState {
  data: Notification[];
  loading: boolean;
  error: string | null;
}
const initialState: NotificationsState = {
  data: [],
  loading: false,
  error: null,
};

// Async thunk for fetching notifications with polling logic [1.2]
export const fetchNotifications = createAsyncThunk<Notification[], void, { state: RootState }>(
  'notifications/fetchNotifications',
  async (_, { getState }) => {
    // Polling logic to fetch notifications since the latest timestamp
    const latestTimestamp = selectAllNotifications(getState())[0]?.createdAt || '';
    const response = await apiClient.get<ApiResponse<Notification[]>>(
      `/notifications?since=${latestTimestamp}`
    );
    return response.data.data;
  }
);

// Async thunk for marking a notification as read [1.2]
export const markNotificationAsRead = createAsyncThunk<void, string>(
  'notifications/markAsRead',
  async (notificationId) => {
    await apiClient.post(`/notifications/${notificationId}/read`);
  }
);

// Create the slice with reducers and extraReducers to handle thunk actions [1.2]
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markReadLocal: (state, action: PayloadAction<string>) => {
      const notification = state.data.find(n => n._id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
         })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
       state.loading = false;
        state.data = action.payload;
         state.error = null;
       // state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.data.find(n => n._id === action.meta.arg);
        if (notification) {
          notification.read = true;
        }
      });
  },
});

// Selector and actions [1.2]
export const selectAllNotifications = (state: RootState) => state.notifications.data;
export const { markReadLocal } = notificationsSlice.actions;
export default notificationsSlice.reducer;
