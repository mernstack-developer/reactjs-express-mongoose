import React, { createContext, useContext, useMemo } from "react";
import { useAppSelector } from "../hooks";
import { selectPermissions } from "../features/auth/userSlice";

type AuthContextShape = {
  permissions: string[];
  hasPermission: (perm: string) => boolean;
};

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const permissions = useAppSelector(selectPermissions) || [];

  const value = useMemo(
    () => ({
      permissions,
      hasPermission: (perm: string) => permissions.includes(perm),
    }),
    [permissions]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
