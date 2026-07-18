import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('badminton_token');
    const savedAdmin = localStorage.getItem('badminton_admin');

    if (token && savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch {
        localStorage.removeItem('badminton_token');
        localStorage.removeItem('badminton_admin');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const { token, admin: adminData } = response.data;

    localStorage.setItem('badminton_token', token);
    localStorage.setItem('badminton_admin', JSON.stringify(adminData));
    setAdmin(adminData);

    return adminData;
  };

  const logout = () => {
    localStorage.removeItem('badminton_token');
    localStorage.removeItem('badminton_admin');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
