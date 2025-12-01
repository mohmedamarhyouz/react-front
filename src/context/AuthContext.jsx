import React, { createContext, useContext, useMemo, useState } from 'react';
import { loginApi } from '../api/authApi';
import { ROLE_LABELS } from '../utils/roles';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [role, setRole] = useState(() => localStorage.getItem('role'));
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const isAuthenticated = Boolean(token);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await loginApi(credentials);
      const tokenValue = data.token;
      const roleValue = data.role;
      const userValue = data.user || {
        email: credentials.email,
        role: roleValue,
      };

      localStorage.setItem('token', tokenValue);
      localStorage.setItem('role', roleValue);
      localStorage.setItem('user', JSON.stringify(userValue));

      setToken(tokenValue);
      setRole(roleValue);
      setUser(userValue);
      return { token: tokenValue, role: roleValue, user: userValue };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setToken(null);
    setRole(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      role,
      token,
      isAuthenticated,
      loading,
      login,
      logout,
      roleLabel: role ? ROLE_LABELS[role] : '',
    }),
    [user, role, token, isAuthenticated, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
