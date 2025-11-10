// src/components/Can.tsx
import React from 'react';
//import { useSelector } from 'react-redux';
//import { RootState } from '../../../src/store';
import { Permission } from '../../features/users/usersSlice'; 
import { useAuth } from '../../hooks/useAuth';
interface CanProps {
  do: Permission; // The required permission
  children: React.ReactNode;
}

const Can: React.FC<CanProps> = ({ do: requiredPermission, children }) => {
    const { user } = useAuth();
  const userPermissions = user?.permissions || [];
  const hasPermission = userPermissions.includes(requiredPermission);
  return hasPermission ? <>{children}</> : null;
};

export default Can;
