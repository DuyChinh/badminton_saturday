import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Can be admin or member
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('badminton_token');
    const savedUser = localStorage.getItem('badminton_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('badminton_token');
        localStorage.removeItem('badminton_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // First try to login as member
      const response = await api.post('/users/login', { username, password });
      const { token, user: userData } = response.data;
      userData.role = 'user';
      
      localStorage.setItem('badminton_token', token);
      localStorage.setItem('badminton_user', JSON.stringify(userData));
      setUser(userData);
      
      return userData;
    } catch (error) {
      // If member not found or wrong password, let's try admin login (fallback for unified login)
      // Only fallback if the error is 401 'Tài khoản không tồn tại' or something similar
      // Actually we'll just try admin login if user login fails
      try {
        const response = await api.post('/auth/login', { username, password });
        const { token, admin: adminData } = response.data;
        adminData.role = 'admin';
        
        localStorage.setItem('badminton_token', token);
        localStorage.setItem('badminton_user', JSON.stringify(adminData));
        setUser(adminData);
        
        return adminData;
      } catch (adminError) {
        // If admin login also fails, throw the original user error or admin error
        throw error;
      }
    }
  };

  const fetchUser = async () => {
    if (user && user.role === 'user') {
      try {
        const res = await api.get('/users/me');
        const userData = { ...res.data.user, role: 'user' };
        setUser(userData);
        localStorage.setItem('badminton_user', JSON.stringify(userData));
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('badminton_token');
    localStorage.removeItem('badminton_user');
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    if (user) {
      const updatedUser = { ...user, ...updatedFields };
      setUser(updatedUser);
      localStorage.setItem('badminton_user', JSON.stringify(updatedUser));
    }
  };

  const updateAvatar = (avatarUrl) => {
    updateUser({ avatarUrl });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateAvatar, updateUser, fetchUser, isAuthenticated: !!user, isAdmin: user?.role === 'admin' }}>
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
