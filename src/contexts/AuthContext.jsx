import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { isTokenExpired, clearAuthStorage } from '../utils/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Can be admin or member
  const [loading, setLoading] = useState(true);
  const lastToastTimeRef = useRef(0);

  // Initialize auth state
  useEffect(() => {
    const token = localStorage.getItem('badminton_token');
    const savedUser = localStorage.getItem('badminton_user');

    if (token && savedUser) {
      if (isTokenExpired(token)) {
        clearAuthStorage();
        setUser(null);
      } else {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);

          // Silently verify token with backend to keep user fresh & catch invalidated tokens
          const verifyUrl = parsed.role === 'admin' ? '/auth/me' : '/users/me';
          api.get(verifyUrl).catch((err) => {
            if (err.response?.status === 401) {
              clearAuthStorage();
              setUser(null);
            }
          });
        } catch {
          clearAuthStorage();
          setUser(null);
        }
      }
    } else {
      clearAuthStorage();
      setUser(null);
    }
    setLoading(false);
  }, []);

  // Listen for unauthorized events dispatched by axios interceptor
  useEffect(() => {
    const handleUnauthorized = (event) => {
      setUser(null);
      clearAuthStorage();

      const now = Date.now();
      if (now - lastToastTimeRef.current > 3000) {
        lastToastTimeRef.current = now;
        toast.error(event.detail?.message || 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
    };

    window.addEventListener('badminton:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('badminton:unauthorized', handleUnauthorized);
    };
  }, []);

  // Periodic and on-focus token expiration check
  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = localStorage.getItem('badminton_token');
      if (token && isTokenExpired(token)) {
        clearAuthStorage();
        setUser(null);
        const now = Date.now();
        if (now - lastToastTimeRef.current > 3000) {
          lastToastTimeRef.current = now;
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
      }
    };

    // Check periodically every 30 seconds
    const interval = setInterval(checkTokenExpiry, 30000);

    // Check when user returns to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkTokenExpiry();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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
      // If member not found or wrong password, try admin login
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
    clearAuthStorage();
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
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateAvatar,
        updateUser,
        fetchUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
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

