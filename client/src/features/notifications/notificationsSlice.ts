import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { apiClient } from '../../utils/api';

// Define notification interface and initial state
import { Notification } from '../../types/types';
interface NotificationsState {
  items: Notification[];
  loading: boolean;
  error: string | null;
}
const initialState: NotificationsState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunk for fetching notifications with polling logic [1.2]
export const fetchNotifications = createAsyncThunk<Notification[], void, { state: RootState }>(
  'notifications/fetchNotifications',
  async (_, { getState }) => {
    // Polling logic to fetch notifications since the latest timestamp
    const latestTimestamp = selectAllNotifications(getState())[0]?.createdAt || '';
    const response = await apiClient.get<Notification[]>(
      `/notifications?since=${latestTimestamp}`
    );
    return response.data;
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
    markReadLocal: (state, action: PayloadAction<string>) => { /* ... */ },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { /* ... */ })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        // Add new notifications and sort by date
        /* ... */
      })
      .addCase(fetchNotifications.rejected, (state, action) => { /* ... */ });
  },
});

// Selector and actions [1.2]
export const selectAllNotifications = (state: RootState) => state.notifications.items;
export const { markReadLocal } = notificationsSlice.actions;
export default notificationsSlice.reducer;
