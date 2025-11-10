import React, { createContext,  useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextValue {
  token: string | null;
  user: any | null;
  login: (token: string, user: any) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null }
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token]);
  // Memoize the context value to avoid unnecessary re-renders
 

  const login = (t: string, u: any) => {
    setToken(t);
    setUser(u);
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };
 const value = useMemo(
    () => ({ token, user, login, logout }),
    [token, user]
  );
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
