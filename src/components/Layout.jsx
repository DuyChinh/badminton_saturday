import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { isAuthenticated, admin, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-shadow">
                <span className="text-xl">🏸</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">Cầu Lông</h1>
                <p className="text-xs text-gray-400 leading-tight">Thanh toán</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-2">
              <Link
                to="/"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === '/'
                    ? 'bg-primary/20 text-primary-light border border-primary/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Trang chủ
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/admin"
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      location.pathname === '/admin'
                        ? 'bg-primary/20 text-primary-light border border-primary/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Quản trị
                  </Link>
                  <div className="w-px h-6 bg-dark-border mx-1" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {admin?.name?.charAt(0) || 'A'}
                      </span>
                    </div>
                    <button
                      onClick={logout}
                      className="text-sm text-gray-400 hover:text-danger transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === '/login'
                      ? 'bg-primary/20 text-primary-light border border-primary/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Đăng nhập
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-border py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            🏸 Badminton Payment • Thứ 7 hàng tuần • © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
