import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    try {
      await register(name, username, password);
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center">
      <div className="w-full app-narrow animate-slide-up">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-success to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-success/20 animate-pulse-glow">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-main">Đăng ký Thành viên</h2>
          <p className="text-muted mt-2">Tham gia câu lạc bộ cầu lông</p>
        </div>

        {/* Register Form */}
        <div className="glass-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Họ và tên</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Nguyễn Văn A"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Nhập username viết liền không dấu..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-2">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Nhập mật khẩu..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Xác nhận mật khẩu</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Nhập lại mật khẩu..."
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-success hover:bg-success/90 text-white rounded-xl font-semibold shadow-lg shadow-success/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Đăng ký
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-muted text-sm mt-6">
          Đã có tài khoản?{' '}
          <button onClick={() => navigate('/login')} className="text-success hover:underline font-semibold">
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
