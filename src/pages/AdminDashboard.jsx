import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');

  // Bulk update
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkAmount, setBulkAmount] = useState('');

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Avatar update
  const fileInputRef = useRef(null);
  const [avatarTarget, setAvatarTarget] = useState(null);

  // Transaction Filters
  const [txSearch, setTxSearch] = useState('');
  const [txMonth, setTxMonth] = useState('');
  const [txYear, setTxYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [txMonth, txYear]);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/members');
      setMembers(res.data.data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách thành viên');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/payments/transactions', {
        params: { search: txSearch, month: txMonth, year: txYear, limit: 100 }
      });
      setTransactions(res.data.data || []);
    } catch (error) {
      console.error('Fetch transactions error:', error);
    }
  };

  const handleTxSearch = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleAvatarClick = (member) => {
    setAvatarTarget(member);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !avatarTarget) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh không được vượt quá 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('memberId', avatarTarget._id);

    try {
      toast.loading('Đang tải ảnh lên...', { id: 'uploadAvatar' });
      await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Cập nhật avatar cho ${avatarTarget.name} thành công!`, { id: 'uploadAvatar' });
      fetchMembers();
    } catch (error) {
      toast.error('Lỗi khi cập nhật avatar', { id: 'uploadAvatar' });
    } finally {
      setAvatarTarget(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ===== CRUD Operations =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Tên thành viên là bắt buộc');
      return;
    }

    try {
      if (editingMember) {
        // Update
        const updateData = { name: formName, note: formNote };
        if (formCode.trim()) updateData.memberCode = formCode;
        if (formAmount !== '') updateData.amountDue = Number(formAmount);
        if (formUsername.trim() !== '') updateData.username = formUsername;
        if (formPassword.trim()) updateData.password = formPassword;
        
        await api.put(`/members/${editingMember._id}`, updateData);
        toast.success('Cập nhật thành công!');
      } else {
        // Create
        const createData = { name: formName, note: formNote };
        if (formCode.trim()) createData.memberCode = formCode;
        if (formAmount !== '') createData.amountDue = Number(formAmount);
        if (formUsername.trim()) createData.username = formUsername;
        if (formPassword.trim()) createData.password = formPassword;
        
        await api.post('/members', createData);
        toast.success('Thêm thành viên thành công!');
      }
      resetForm();
      fetchMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormCode(member.memberCode);
    setFormAmount(member.amountDue.toString());
    setFormNote(member.note || '');
    setFormUsername(member.username || '');
    setFormPassword(''); // don't load password
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/members/${deleteTarget._id}`);
      toast.success('Đã xóa thành viên');
      setDeleteTarget(null);
      fetchMembers();
    } catch (error) {
      toast.error('Không thể xóa');
    }
  };

  const handleUpdateAmount = async (memberId, amount) => {
    try {
      await api.put(`/members/${memberId}`, { amountDue: Number(amount) });
      toast.success('Đã cập nhật số tiền');
      fetchMembers();
    } catch (error) {
      toast.error('Lỗi cập nhật');
    }
  };

  const handleBulkUpdate = async (e) => {
    e.preventDefault();
    if (bulkAmount === '') {
      toast.error('Vui lòng nhập số tiền');
      return;
    }
    try {
      await api.put('/members/bulk-update', {
        amountDue: Number(bulkAmount)
      });
      toast.success(`Đã cập nhật tất cả thành viên: ${formatCurrency(Number(bulkAmount))}`);
      setShowBulkForm(false);
      setBulkAmount('');
      fetchMembers();
    } catch (error) {
      toast.error('Lỗi cập nhật hàng loạt');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingMember(null);
    setFormName('');
    setFormCode('');
    setFormAmount('');
    setFormNote('');
    setFormUsername('');
    setFormPassword('');
  };

  const unpaidCount = members.filter((m) => m.paymentStatus === 'unpaid').length;
  const paidCount = members.filter((m) => m.paymentStatus === 'paid').length;
  const totalDue = members.reduce((sum, m) => sum + m.amountDue, 0);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-main">Quản trị viên</h1>
          <p className="text-muted mt-1">Quản lý thành viên và thanh toán</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => { setShowBulkForm(true); }}
            className="btn-secondary text-sm py-2.5 px-4"
          >
            Gán tiền tất cả
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="btn-primary text-sm py-2.5 px-4"
          >
            + Thêm thành viên
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-slide-up">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-main">{members.length}</p>
          <p className="text-xs text-muted mt-1">Tổng TV</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-danger">{unpaidCount}</p>
          <p className="text-xs text-muted mt-1">Chưa TT</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-success">{paidCount}</p>
          <p className="text-xs text-muted mt-1">Đã TT</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xl font-bold text-accent">{formatCurrency(totalDue)}</p>
          <p className="text-xs text-muted mt-1">Cần thu</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'members'
              ? 'bg-primary/20 text-primary-light border border-primary/30'
              : 'text-muted hover:text-main hover:bg-surface-hover'
          }`}
        >
          👥 Thành viên ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'transactions'
              ? 'bg-primary/20 text-primary-light border border-primary/30'
              : 'text-muted hover:text-main hover:bg-surface-hover'
          }`}
        >
          📜 Lịch sử GD ({transactions.length})
        </button>
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="animate-fade-in">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-20 w-full" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <span className="text-5xl mb-4 block">👤</span>
              <p className="text-muted">Chưa có thành viên nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <MemberRow
                  key={member._id}
                  member={member}
                  onEdit={() => handleEdit(member)}
                  onDelete={() => setDeleteTarget(member)}
                  onUpdateAmount={handleUpdateAmount}
                  onUpdateAvatar={() => handleAvatarClick(member)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="animate-fade-in">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form onSubmit={handleTxSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  className="input-field w-full pl-10"
                  placeholder="Tìm kiếm giao dịch..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                />
                <svg className="w-5 h-5 text-muted absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
            <div className="flex gap-4">
              <select
                className="input-field"
                value={txMonth}
                onChange={(e) => setTxMonth(e.target.value)}
              >
                <option value="">Tất cả các tháng</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1}>Tháng {i+1}</option>
                ))}
              </select>
              <select
                className="input-field"
                value={txYear}
                onChange={(e) => setTxYear(e.target.value)}
              >
                <option value="">Tất cả các năm</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <span className="text-5xl mb-4 block">📜</span>
              <p className="text-muted">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx._id} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        tx.status === 'success'
                          ? 'bg-success/15 border border-success/20 text-success'
                          : 'bg-warning/15 border border-warning/20 text-warning'
                      }`}>
                        {tx.memberId?.avatarUrl ? (
                          <img src={tx.memberId.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span>{tx.status === 'success' ? '✅' : '⚠️'}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-main text-sm">
                          {tx.memberId?.name || tx.memberCode || 'Không xác định'}
                        </p>
                        <p className="text-xs text-muted">#{tx.memberCode || '—'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success">{formatCurrency(tx.amount)}</p>
                      <p className="text-xs text-muted">{formatDate(tx.transactionDate || tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className="bg-dark/40 rounded-lg p-2 mt-2">
                    <p className="text-xs text-muted font-mono break-all">{tx.transactionContent}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== Add/Edit Form Modal ===== */}
      {showForm && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-main mb-5">
              {editingMember ? '✏️ Sửa thành viên' : '➕ Thêm thành viên mới'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Tên thành viên *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="input-field"
                  placeholder="VD: Nguyễn Văn A"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">
                  Mã thành viên <span className="text-muted">(tự tạo nếu bỏ trống)</span>
                </label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  className="input-field font-mono"
                  placeholder="VD: NGUYENVANA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">
                  Số tiền nợ ban đầu (đ)
                </label>
                <input
                  type="number"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="input-field"
                  placeholder="VD: 50000 (Bỏ trống = 0)"
                  min="0"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="input-field"
                    placeholder="VD: nguyenvana"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="input-field"
                    placeholder={editingMember ? "(Bỏ trống để giữ nguyên)" : "Mật khẩu cho user..."}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">
                  Ghi chú
                </label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="input-field"
                  placeholder="VD: Khách của A..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingMember ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Bulk Update Modal ===== */}
      {showBulkForm && (
        <div className="modal-overlay" onClick={() => setShowBulkForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-main mb-2">💰 Gán tiền cho tất cả</h3>
            <p className="text-sm text-muted mb-5">
              Cập nhật số tiền cần thanh toán cho <span className="text-main font-semibold">{members.length}</span> thành viên
            </p>
            <form onSubmit={handleBulkUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Số tiền (đ)</label>
                <input
                  type="number"
                  value={bulkAmount}
                  onChange={(e) => setBulkAmount(e.target.value)}
                  className="input-field text-lg"
                  placeholder="VD: 50000"
                  min="0"
                  autoFocus
                />
                {bulkAmount && (
                  <p className="text-sm text-primary-light mt-2">
                    = {formatCurrency(Number(bulkAmount))} / người
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Gán cho tất cả
                </button>
                <button type="button" onClick={() => setShowBulkForm(false)} className="btn-secondary flex-1">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Delete Confirm Modal ===== */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-main mb-3">⚠️ Xác nhận xóa</h3>
            <p className="text-muted mb-6">
              Bạn chắc chắn muốn xóa <span className="text-main font-semibold">{deleteTarget.name}</span>?
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="btn-danger flex-1 py-3">
                Xóa
              </button>
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1 py-3">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

// ===== Member Row Component =====
const MemberRow = ({ member, onEdit, onDelete, onUpdateAmount, onUpdateAvatar }) => {
  const [amount, setAmount] = useState(member.amountDue.toString());
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveAmount = () => {
    if (amount !== member.amountDue.toString()) {
      onUpdateAmount(member._id, amount);
    }
    setIsEditing(false);
  };

  return (
    <div className="glass-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div 
            className="relative w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0 group cursor-pointer border-2 border-border-color hover:border-primary transition-colors"
            onClick={onUpdateAvatar}
            title="Đổi avatar"
          >
            {member.avatarUrl ? (
              <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center font-bold text-lg ${
                member.paymentStatus === 'paid' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
              }`}>
                {member.name.charAt(0)}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <p className="font-semibold text-main truncate">{member.name}</p>
              {member.note && (
                <span className="text-xs sm:text-sm font-medium bg-amber-500/15 text-amber-500 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                  {member.note}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-xs text-muted font-mono">#{member.memberCode}</p>
              {member.username && (
                <span className="text-xs font-medium bg-primary/10 text-primary-light px-2 py-0.5 rounded border border-primary/20">
                  👤 {member.username}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Inline amount edit */}
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field w-28 text-sm py-1.5 px-2"
                min="0"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveAmount();
                  if (e.key === 'Escape') { setIsEditing(false); setAmount(member.amountDue.toString()); }
                }}
              />
              <button onClick={handleSaveAmount} className="text-success hover:text-success/80 p-1">✓</button>
              <button onClick={() => { setIsEditing(false); setAmount(member.amountDue.toString()); }} className="text-muted hover:text-main p-1">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className={`font-bold text-sm px-3 py-1.5 rounded-lg transition-colors ${
                member.paymentStatus === 'paid'
                  ? 'text-success bg-success/10 hover:bg-success/20'
                  : 'text-danger bg-danger/10 hover:bg-danger/20'
              }`}
              title="Click để sửa số tiền"
            >
              {formatCurrency(member.amountDue)}
            </button>
          )}

          <span className={member.paymentStatus === 'paid' ? 'badge-paid' : 'badge-unpaid'}>
            {member.paymentStatus === 'paid' ? '✓ Đã TT' : 'Chưa TT'}
          </span>

          {/* Actions */}
          <button onClick={onEdit} className="p-2 text-muted hover:text-primary-light transition-colors" title="Sửa">
            ✏️
          </button>
          <button onClick={onDelete} className="p-2 text-muted hover:text-danger transition-colors" title="Xóa">
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
