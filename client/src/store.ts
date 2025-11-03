import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './features/users/usersSlice';
import guestsReducer from './features/guests/guestsSlice';
import notificationsReducer from './features/notifications/notificationsSlice';
import coursesReducer from './features/courses/coursesSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    guests: guestsReducer,
    notifications: notificationsReducer,
    courses: coursesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;