import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ChangePasswordModal from '../components/ChangePasswordModal';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateAvatar } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Edit Note
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState('');

  // Edit Member Code
  const [isEditingMemberCode, setIsEditingMemberCode] = useState(false);
  const [memberCodeValue, setMemberCodeValue] = useState('');

  // Image Zoom Modal
  const [showImageModal, setShowImageModal] = useState(false);

  // Change Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (id) {
          const res = await api.get(`/members/${id}`);
          setProfileData(res.data.data);
          setNoteValue(res.data.data.note || '');
          setMemberCodeValue(res.data.data.memberCode || '');
        } else if (user) {
          const res = await api.get('/users/me');
          setProfileData(res.data.user);
          setNoteValue(res.data.user.note || '');
          setMemberCodeValue(res.data.user.memberCode || '');
        } else {
          // not logged in and no id
          navigate('/');
        }
      } catch (error) {
        toast.error('Không thể tải thông tin hồ sơ');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id, user, navigate]);

  const canEdit = user && (user.role === 'admin' || profileData?._id === user.id);

  const handleAvatarClick = () => {
    if (profileData?.avatarUrl) {
      setShowImageModal(true);
    }
  };

  const handleUploadClick = (e) => {
    e.stopPropagation();
    if (canEdit) fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Ảnh không được vượt quá 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    if (id) {
      formData.append('memberId', id);
    }

    try {
      const response = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // if editing own avatar, update context
      if (!id || id === user?.id) {
        updateAvatar(response.data.avatarUrl);
      }
      setProfileData(prev => ({ ...prev, avatarUrl: response.data.avatarUrl }));
      toast.success('Cập nhật avatar thành công!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật avatar');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveNote = async () => {
    try {
      await api.put(`/members/${profileData._id}`, { note: noteValue });
      setProfileData(prev => ({ ...prev, note: noteValue }));
      setIsEditingNote(false);
      toast.success('Cập nhật ghi chú thành công!');
    } catch (error) {
      toast.error('Lỗi khi cập nhật ghi chú');
    }
  };

  const hasAccents = (str) => {
    const accents = /[áàảãạâấầẩẫậăắằẳẵặéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ]/i;
    return accents.test(str);
  };

  const handleSaveMemberCode = async () => {
    if (!memberCodeValue || !memberCodeValue.trim()) {
      toast.error('Mã thành viên không được để trống');
      return;
    }
    if (hasAccents(memberCodeValue)) {
      toast.error('Mã thành viên phải viết không dấu');
      return;
    }
    
    try {
      const code = memberCodeValue.toUpperCase().replace(/\s/g, '');
      await api.put(`/members/${profileData._id}`, { memberCode: code });
      setProfileData(prev => ({ ...prev, memberCode: code }));
      setIsEditingMemberCode(false);
      toast.success('Cập nhật mã thành viên thành công!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật mã thành viên');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profileData) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      <div className="glass-card p-6 sm:p-10 relative overflow-hidden">
        {/* Background decorative blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

        <h2 className="text-2xl sm:text-3xl font-bold text-main mb-8 text-center md:text-left relative z-10">Hồ sơ cá nhân</h2>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
          
          {/* Avatar Section (Left) */}
          <div className="flex flex-col items-center shrink-0">
            <div className={`relative group mb-4 ${profileData.avatarUrl ? 'cursor-pointer' : ''}`} onClick={handleAvatarClick}>
              <div className={`w-48 h-48 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-4 border-surface shadow-xl ${isUploading ? 'opacity-50' : (profileData.avatarUrl ? 'group-hover:opacity-95' : '')} transition-all`}>
                {profileData.avatarUrl ? (
                  <img src={profileData.avatarUrl} alt={profileData.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center text-6xl font-bold">
                    {profileData.name?.charAt(0) || profileData.username?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              
              {/* Zoom Overlay (if image exists) */}
              {profileData.avatarUrl && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              )}

              {/* Edit Camera Button */}
              {canEdit && (
                <button 
                  onClick={handleUploadClick}
                  className="absolute bottom-4 right-4 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-hover transition-colors border-4 border-surface z-20 cursor-pointer"
                  title="Thay đổi ảnh đại diện"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}

              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/20 z-10">
                  <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin shadow-md" />
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            {canEdit && <p className="text-sm text-muted mb-4 text-center">Bấm vào biểu tượng máy ảnh<br/>để cập nhật ảnh</p>}
          </div>

          {/* Info Section (Right) */}
          <div className="w-full flex-1 space-y-4">
            <div className="bg-surface p-4 rounded-xl border border-border-color">
              <p className="text-xs text-muted mb-1 font-semibold uppercase tracking-wider">Họ và tên</p>
              <p className="text-lg font-medium text-main">{profileData.name}</p>
            </div>
            
            {/* Note / Ghi chú */}
            <div className="bg-surface p-4 rounded-xl border border-border-color">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-xs text-muted mb-1 font-semibold uppercase tracking-wider">Ghi chú</p>
                  {isEditingNote ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input 
                        type="text" 
                        value={noteValue} 
                        onChange={(e) => setNoteValue(e.target.value)} 
                        className="input-field w-full text-sm py-1.5 px-3"
                        placeholder="Thêm ghi chú..."
                        autoFocus
                      />
                      <button onClick={handleSaveNote} className="btn-primary py-1.5 px-3 text-sm shrink-0">Lưu</button>
                      <button onClick={() => { setIsEditingNote(false); setNoteValue(profileData.note || ''); }} className="btn-secondary py-1.5 px-3 text-sm shrink-0">Hủy</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      {profileData.note ? (
                        <p className="text-lg font-medium text-main">{profileData.note}</p>
                      ) : (
                        <p className="text-muted italic">Chưa có ghi chú</p>
                      )}
                      {user?.role === 'admin' && (
                        <button onClick={() => setIsEditingNote(true)} className="text-primary hover:text-primary-light ml-2 p-1" title="Chỉnh sửa">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {profileData.username && (
              <div className="bg-surface p-4 rounded-xl border border-border-color">
                <p className="text-xs text-muted mb-1 font-semibold uppercase tracking-wider">Tên đăng nhập</p>
                <p className="text-lg font-medium text-main">{profileData.username}</p>
              </div>
            )}
            
            {/* Member Code */}
            <div className="bg-surface p-4 rounded-xl border border-border-color">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-xs text-muted mb-1 font-semibold uppercase tracking-wider">Mã thành viên</p>
                  {isEditingMemberCode ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input 
                        type="text" 
                        value={memberCodeValue} 
                        onChange={(e) => setMemberCodeValue(e.target.value.toUpperCase())} 
                        className="input-field w-full text-sm py-1.5 px-3 uppercase"
                        placeholder="Mã không dấu..."
                        autoFocus
                      />
                      <button onClick={handleSaveMemberCode} className="btn-primary py-1.5 px-3 text-sm shrink-0">Lưu</button>
                      <button onClick={() => { setIsEditingMemberCode(false); setMemberCodeValue(profileData.memberCode || ''); }} className="btn-secondary py-1.5 px-3 text-sm shrink-0">Hủy</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      {profileData.memberCode ? (
                        <p className="text-lg font-medium text-main">{profileData.memberCode}</p>
                      ) : (
                        <p className="text-muted italic">Chưa có mã</p>
                      )}
                      {canEdit && (
                        <button onClick={() => setIsEditingMemberCode(true)} className="text-primary hover:text-primary-light ml-2 p-1" title="Chỉnh sửa">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-border-color">
              <p className="text-xs text-muted mb-1 font-semibold uppercase tracking-wider">Vai trò</p>
              <p className="text-lg font-medium text-main">
                {profileData.username === 'admin' ? (
                  <span className="badge-unpaid">Quản trị viên</span>
                ) : (
                  <span className="badge-paid">Thành viên</span>
                )}
              </p>
            </div>
            
            {/* Change Password Button */}
            {canEdit && profileData._id === user?.id && (
              <div className="pt-4">
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Đổi mật khẩu
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {showImageModal && profileData.avatarUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
            <button 
              className="absolute top-4 right-4 text-white hover:text-danger bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); setShowImageModal(false); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={profileData.avatarUrl} 
              alt={profileData.name} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking the image itself
            />
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        isFirstLogin={false}
      />
    </div>
  );
};

export default ProfilePage;
