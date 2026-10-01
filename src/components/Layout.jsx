import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import ChangePasswordModal from './ChangePasswordModal';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Trang chủ',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 10.5L12 4l8 6.5V19a1 1 0 01-1 1h-4v-5h-6v5H5a1 1 0 01-1-1v-8.5z" />
    ),
  },
  {
    to: '/news',
    label: 'Bảng tin',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5h12v14H5a1 1 0 01-1-1V5zm12 3h3a1 1 0 011 1v9a1 1 0 01-1 1h-3M7 8h6M7 12h6M7 16h3" />
    ),
  },
  {
    to: '/tournament',
    label: 'Lịch thi đấu & BXH',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 4h8v5a4 4 0 01-8 0V4zM8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4M12 13v4M8 20h8M9 17h6" />
    ),
  },
  {
    to: '/history',
    label: 'Lịch sử GD',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 12a8 8 0 108-8 8 8 0 00-6.9 4M4 5v3.5h3.5M12 8v4.5l3 1.8" />
    ),
  },
  {
    to: '/spin-history',
    label: 'Lịch sử quay thưởng',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
];

const Layout = ({ children }) => {
  const { isAuthenticated, logout, user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user && user.isFirstLogin && user.role === 'user') {
      setShowPasswordModal(true);
    }
  }, [user]);

  const isActive = (to) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Drifting colour fields behind the top of every page */}
      <div className="app-aurora" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
        <span className="gridlines" />
      </div>

      <header className="glass-header sticky top-0 z-50">
        <div className="app-container h-[72px] flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <span className="logo-tile w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 transition-transform group-hover:-rotate-6">
              <img src="/badminton-player.png" alt="" className="logo-mark w-6 h-6 object-contain" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-[23px] font-extrabold uppercase tracking-tight text-main">Saturday</span>
              <span className="mt-1 text-[10px] font-semibold tracking-[0.26em] text-muted">BADMINTON CLUB</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl border border-border-color text-muted hover:text-main hover:bg-surface-hover transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Đổi giao diện sáng / tối"
            >
              {theme === 'dark' ? (
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" />
                </svg>
              )}
            </button>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-stretch h-[72px]" aria-label="Điều hướng chính">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={isActive(item.to) ? 'page' : undefined}
                  className={`flex items-center px-[14px] text-sm transition-colors ${
                    isActive(item.to) ? 'nav-active font-bold text-main' : 'font-medium text-muted hover:text-main'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2 ml-1">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`h-7 px-2.5 rounded-md text-[11px] font-bold tracking-[0.12em] flex items-center transition-colors ${
                      location.pathname.includes('/admin')
                        ? 'bg-violet/25 text-violet-soft'
                        : 'bg-violet/15 text-violet-soft hover:bg-violet/25'
                    }`}
                  >
                    ADMIN
                  </Link>
                )}
                <Link
                  to={isAdmin ? '/admin' : '/profile'}
                  className="h-10 pl-1 pr-3.5 rounded-full border border-border-color hover:bg-surface-hover transition-colors flex items-center gap-2.5"
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[13px] font-bold">
                      {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </span>
                  )}
                  <span className="hidden lg:block text-[13.5px] font-semibold text-main">
                    {user?.name || user?.username}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="w-10 h-10 rounded-xl border border-border-color text-danger hover:bg-danger/10 transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Đăng xuất"
                >
                  <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 4H6a2 2 0 00-2 2v12a2 2 0 002 2h3M16 16l4-4-4-4M20 12H10" />
                  </svg>
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary hidden md:inline-flex h-10 px-[18px] py-0 text-sm">
                Đăng nhập
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-xl border border-border-color text-main flex items-center justify-center cursor-pointer"
              aria-label="Menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMobileMenuOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 top-[72px] bg-black/60 backdrop-blur-xs z-40 animate-fade-in"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="md:hidden absolute top-[72px] left-0 w-full bg-card border-b border-border-color shadow-2xl z-50 animate-fade-in">
              <nav className="flex flex-col p-4 gap-1.5">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-4 py-3 rounded-xl flex items-center gap-3 font-semibold transition-colors ${
                      isActive(item.to)
                        ? 'bg-primary/15 text-primary'
                        : 'text-main hover:bg-surface-hover'
                    }`}
                  >
                    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {item.icon}
                    </svg>
                    <span>{item.label}</span>
                  </Link>
                ))}

                <div className="h-px bg-border-color my-1.5" />

                {isAuthenticated ? (
                  <>
                    <Link
                      to={isAdmin ? '/admin' : '/profile'}
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border-color"
                    >
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <span className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-lg">
                          {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-main text-sm truncate">{user?.name || user?.username}</span>
                        <span className="block text-xs text-muted font-medium">
                          {user?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                        </span>
                      </span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="px-4 py-3 rounded-xl flex items-center gap-3 font-semibold text-main hover:bg-surface-hover transition-colors"
                      >
                        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.3 4h3.4l.4 2.3 2 1.1 2.1-.9 1.7 3-1.6 1.6v2.2l1.6 1.6-1.7 3-2.1-.9-2 1.1-.4 2.3h-3.4l-.4-2.3-2-1.1-2.1.9-1.7-3L5.7 14v-2.2L4.1 10.2l1.7-3 2.1.9 2-1.1L10.3 4z" />
                          <circle cx="12" cy="12" r="2.4" strokeWidth={1.8} />
                        </svg>
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="mt-1 px-4 py-3 rounded-xl flex items-center justify-center gap-2.5 w-full font-bold text-danger bg-danger/10 border border-danger/25 hover:bg-danger/20 transition-colors cursor-pointer"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 4H6a2 2 0 00-2 2v12a2 2 0 002 2h3M16 16l4-4-4-4M20 12H10" />
                      </svg>
                      <span>Đăng xuất</span>
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="btn-primary w-full">
                    Đăng nhập
                  </Link>
                )}
              </nav>
            </div>
          </>
        )}
      </header>

      <main className="flex-1 relative z-10 w-full">
        <div className={`app-container ${location.pathname.startsWith('/payment') ? 'pt-2.5 pb-6 sm:pt-3 sm:pb-8' : 'py-6 sm:py-8'}`}>{children}</div>
      </main>

      <footer className="relative z-10 border-t border-border-light mt-auto">
        <div className="app-container py-7 flex flex-col sm:flex-row items-center justify-between gap-2 text-[13px] text-muted">
          <span>© {new Date().getFullYear()} Saturday Badminton Club</span>
          <span>
            Made by <span className="font-semibold text-main">Duy Chinh</span>
          </span>
        </div>
      </footer>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        isFirstLogin={user?.isFirstLogin}
      />
    </div>
  );
};

export default Layout;
