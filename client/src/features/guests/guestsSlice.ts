import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Guest, InvitationStats, ApiResponse } from '../../types/types';

interface GuestsState {
  data: Guest[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  invitationStats: InvitationStats;
}

const initialState: GuestsState = {
  data: [],
  loading: false,
  error: null,
  lastUpdated: null,
  invitationStats: {
    accepted: 0,
    pending: 0,
    declined: 0,
  },
};

export const fetchGuests = createAsyncThunk<Guest[]>(
  'guests/fetchGuests',
  async () => {
    const response = await axios.get<ApiResponse<Guest[]>>('/api/guests');
    return response.data.data;
  }
);

export const addGuest = createAsyncThunk<Guest, Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>>(
  'guests/addGuest',
  async (guestData) => {
    const response = await axios.post<ApiResponse<Guest>>('/api/guests', guestData);
    return response.data.data;
  }
);

export const editGuest = createAsyncThunk<
  Guest,
  { guestId: string; guestData: Partial<Guest> }
>(
  'guests/editGuest',
  async ({ guestId, guestData }) => {
    const response = await axios.put<ApiResponse<Guest>>(`/api/guests/${guestId}`, guestData);
    return response.data.data;
  }
);

export const deleteGuest = createAsyncThunk<string, string>(
  'guests/deleteGuest',
  async (guestId) => {
    await axios.delete(`/api/guests/${guestId}`);
    return guestId;
  }
);

const guestsSlice = createSlice({
  name: 'guests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGuests.fulfilled, (state, action: PayloadAction<Guest[]>) => {
        state.loading = false;
        state.data = action.payload;
        state.lastUpdated = new Date().toISOString();
        // Update stats
        state.invitationStats = action.payload.reduce((stats, guest) => {
          const status = guest.status.toLowerCase() as keyof InvitationStats;
          stats[status]++;
          return stats;
        }, { accepted: 0, pending: 0, declined: 0 });
      })
      // ... other cases similar to usersSlice
  },
});

export default guestsSlice.reducer;