// src/components/AuthProvider.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {  AppDispatch, RootState } from '../../../src/store'; 
import { checkAuthStatus } from '../../features/auth/userSlice';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => state.user.loading);

  useEffect(() => {
    // Check authentication status once when the app mounts
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Optional: Show a loading spinner while we verify auth status
  if (loading) {
    //return <div>Verifying authentication status...</div>;
  }

  return <>{children}</>;
};

export default AuthProvider;
