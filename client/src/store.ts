import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './features/users/usersSlice';
import guestsReducer from './features/guests/guestsSlice';
import notificationsReducer from './features/notifications/notificationsSlice';


export const store = configureStore({
  reducer: {
    users: usersReducer,
    guests: guestsReducer,
     notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;