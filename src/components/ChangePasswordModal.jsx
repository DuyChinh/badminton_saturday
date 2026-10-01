import React, { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const ChangePasswordModal = ({ isOpen, onClose, isFirstLogin }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { fetchUser } = useAuth(); // Need to fetch user to update isFirstLogin

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setLoading(true);
      await api.put('/users/change-password', { oldPassword, newPassword });
      toast.success('Đổi mật khẩu thành công!');
      
      // Update user context so isFirstLogin becomes false
      if (fetchUser) await fetchUser();
      
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border-color">
        <div className="p-6 border-b border-border-color bg-surface relative">
          <h2 className="text-xl font-bold text-main">
            {isFirstLogin ? 'Yêu cầu Đổi Mật Khẩu' : 'Đổi Mật Khẩu'}
          </h2>
          {isFirstLogin && (
            <p className="text-sm text-warn mt-1">
              Bạn cần đổi mật khẩu trong lần đăng nhập đầu tiên để bảo mật tài khoản.
            </p>
          )}
          {!isFirstLogin && (
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-muted hover:text-danger transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              required
              className="input-field bg-bg-main"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Mật khẩu mới</label>
            <input
              type="password"
              required
              className="input-field bg-bg-main"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ít nhất 6 ký tự"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              required
              className="input-field bg-bg-main"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          <div className="pt-4 flex gap-3">
            {!isFirstLogin && (
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1 py-2.5"
                disabled={loading}
              >
                Hủy
              </button>
            )}
            <button
              type="submit"
              className="btn-primary flex-1 py-2.5"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : 'Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
