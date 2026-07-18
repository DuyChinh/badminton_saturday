import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import ChangePasswordModal from './ChangePasswordModal';

const Layout = ({ children }) => {
  const { isAuthenticated, logout, user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (user && user.isFirstLogin && user.role === 'user') {
      setShowPasswordModal(true);
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="app-container h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold transform group-hover:rotate-12 transition-transform shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-extrabold leading-none tracking-tight text-main">PAYMENT</h1>
              <p className="text-[10px] text-muted tracking-widest uppercase font-semibold mt-0.5">Badminton Club</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-muted hover:text-main cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <nav className="flex gap-1.5 sm:gap-2 text-sm font-semibold">
              <Link
                to="/"
                className={`hidden sm:block px-4 py-2 rounded-xl transition-all ${
                  location.pathname === '/' 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'text-muted hover:text-primary hover:bg-primary/10'
                }`}
              >
                Trang chủ
              </Link>
              
              <Link
                to="/news"
                className={`hidden sm:block px-4 py-2 rounded-xl transition-all ${
                  location.pathname === '/news' 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'text-muted hover:text-primary hover:bg-primary/10'
                }`}
              >
                Bảng tin
              </Link>
              
              <Link
                to="/history"
                className={`hidden sm:block px-4 py-2 rounded-xl transition-all ${
                  location.pathname === '/history' 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'text-muted hover:text-primary hover:bg-primary/10'
                }`}
              >
                Lịch sử GD
              </Link>
              
              {isAuthenticated ? (
                <div className="flex items-center gap-3 ml-1 sm:ml-2 border-l border-border-color pl-2 sm:pl-3">
                  <Link to={isAdmin ? "/admin" : "/profile"} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-border-color" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="text-sm font-bold text-main hidden md:block">
                      {user?.name || user?.username}
                    </span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={`hidden sm:block px-3 py-1.5 rounded-lg transition-all text-xs font-bold ${
                        location.pathname.includes('/admin') 
                          ? 'bg-primary text-white shadow-md shadow-primary/20' 
                          : 'text-muted hover:text-primary hover:bg-primary/10'
                      }`}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="p-1.5 rounded-lg text-danger hover:text-white hover:bg-danger transition-all shadow-sm cursor-pointer"
                    title="Đăng xuất"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-xl transition-all ${
                    location.pathname === '/login' 
                      ? 'bg-primary text-white shadow-md shadow-primary/20' 
                      : 'text-muted hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  Đăng nhập
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 w-full">
        <div className="app-container py-6 sm:py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-color py-6 text-center mt-auto z-10 relative">
        <div className="app-container flex flex-col items-center justify-center">
          <p className="text-sm font-medium mb-1 text-main flex items-center gap-1.5">
            Made by <span className="text-primary font-bold">Duy Chinh</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-danger animate-pulse" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </p>
          <p className="text-xs text-muted/70">
            © {new Date().getFullYear()} Badminton Club Payment
          </p>
        </div>
      </footer>

      {/* Change Password Modal for First Login */}
      <ChangePasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)}
        isFirstLogin={user?.isFirstLogin}
      />
    </div>
  );
};

export default Layout;
