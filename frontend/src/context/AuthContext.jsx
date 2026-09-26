import React, { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getUser());
  const [authenticated, setAuthenticated] = useState(() => authService.isAuthenticated());

  const login = useCallback(async (email, senha) => {
    const usuario = await authService.login(email, senha);
    setUser(usuario);
    setAuthenticated(true);
    return usuario;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setAuthenticated(false);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, authenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);