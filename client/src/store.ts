import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './features/users/usersSlice';
import guestsReducer from './features/guests/guestsSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    guests: guestsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;