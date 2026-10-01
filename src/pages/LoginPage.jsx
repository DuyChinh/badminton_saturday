import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(username, password);
      toast.success('Đăng nhập thành công!');
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full animate-slide-up">
      <div className="grid lg:grid-cols-2 rounded-3xl overflow-hidden border border-border-color bg-card">
        {/* Court-side panel */}
        <div className="relative hidden lg:flex flex-col justify-between p-11 min-h-[600px] bg-[#04140F] text-[#E8F4EE]">
          <img
            src="/bad_icon04.png"
            alt=""
            className="kenburns absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: '50% 26%' }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(4,20,15,0.30) 0%, rgba(4,20,15,0.74) 55%, rgba(4,20,15,0.96) 100%)',
            }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: 'linear-gradient(120deg, rgba(16,185,129,0.30), transparent 58%)' }}
          />

          <p className="relative text-xs font-bold tracking-[0.16em] uppercase text-primary-light m-0">
            Saturday Badminton Club
          </p>

          <div className="relative max-w-[300px]">
            <p className="font-display text-[52px] font-extrabold m-0">
              Vào sân
              <br />
              <span className="grad-text">thôi!</span>
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-[#C7D8CC] m-0">
              Đăng nhập để đổi avatar, chỉ xem giao dịch của mình và theo dõi giải đấu.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <h1 className="text-[30px] font-bold text-main m-0">Đăng nhập</h1>
          <p className="mt-2 text-[14.5px] text-muted m-0">Dành cho Quản trị viên &amp; Thành viên</p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-[18px]">
            <label htmlFor="login-username" className="flex flex-col gap-2">
              <span className="text-[13.5px] font-semibold text-main">Tên đăng nhập</span>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field h-13 py-0"
                placeholder="VD: chientt"
                autoComplete="username"
                autoFocus
              />
            </label>

            <label htmlFor="login-password" className="flex flex-col gap-2">
              <span className="text-[13.5px] font-semibold text-main">Mật khẩu</span>
              <span className="relative block">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field h-13 py-0 pr-13"
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-1 top-1 w-11 h-11 rounded-xl text-muted hover:text-main flex items-center justify-center cursor-pointer"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? (
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3l18 18M10.6 10.7a2 2 0 002.8 2.8M9.4 5.9A9.4 9.4 0 0112 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 01-3.3 4M6.5 7.6A16 16 0 002.5 12S6 18.5 12 18.5c1.2 0 2.3-.2 3.3-.6" />
                    </svg>
                  ) : (
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
                      <circle cx="12" cy="12" r="3" strokeWidth={1.8} />
                    </svg>
                  )}
                </button>
              </span>
            </label>

            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="btn-primary mt-2 h-14 text-[15.5px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Đang đăng nhập…
                </>
              ) : (
                <>
                  Đăng nhập
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="mt-7 px-4 py-3.5 rounded-xl bg-surface border border-border-light text-[13.5px] leading-relaxed text-muted m-0">
            Lần đầu đăng nhập? Tên đăng nhập là tên không dấu, mật khẩu mặc định{' '}
            <code className="font-mono text-[12.5px] px-1.5 py-0.5 rounded-md bg-card text-main">12345678</code>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
