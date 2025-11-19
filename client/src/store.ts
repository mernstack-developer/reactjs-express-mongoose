import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './features/users/usersSlice';
import guestsReducer from './features/guests/guestsSlice';
import notificationsReducer from './features/notifications/notificationsSlice';
import coursesReducer from './features/courses/coursesSlice';
import userReducer from './features/auth/userSlice';
import rolePermissionsReducer from './features/rolePermissions/rolePermissionsSlice';
import categoriesReducer from './features/categories/categoriesSlice';
import cartReducer from './features/cart/cartSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    user: userReducer,
    guests: guestsReducer,
    notifications: notificationsReducer,
    courses: coursesReducer,
    categories: categoriesReducer,
    rolePermissions: rolePermissionsReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;