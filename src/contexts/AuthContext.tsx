import React, { createContext, useContext, useState, useEffect } from 'react';
import { users, User } from '../userData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isLoggedIn: () => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
  isLoggedIn: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('logged_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, password: string) => {
    const found = users.find(u => u.email === email && u.password === password);
    const customUsers = JSON.parse(localStorage.getItem('custom_users') || '[]');
    const foundCustom = customUsers.find((u: any) => u.email === email && u.password === password);
    if (found || foundCustom) {
      const user = found || foundCustom;
      setUser(user);
      localStorage.setItem('logged_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('logged_user');
  };

  const isLoggedIn = () => !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 