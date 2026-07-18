import { useState, useEffect } from 'react';
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

  // Bulk update
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkAmount, setBulkAmount] = useState('');

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchMembers();
    fetchTransactions();
  }, []);

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
      const res = await api.get('/payments/transactions');
      setTransactions(res.data.data || []);
    } catch (error) {
      console.error('Fetch transactions error:', error);
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
        const updateData = { name: formName };
        if (formCode.trim()) updateData.memberCode = formCode;
        if (formAmount !== '') updateData.amountDue = Number(formAmount);
        
        await api.put(`/members/${editingMember._id}`, updateData);
        toast.success('Cập nhật thành công!');
      } else {
        // Create
        const createData = { name: formName };
        if (formCode.trim()) createData.memberCode = formCode;
        
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
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'members'
              ? 'bg-primary/20 text-primary-light border border-primary/30'
              : 'text-muted hover:text-main hover:bg-surface-hover'
          }`}
        >
          👥 Thành viên ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
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
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="animate-fade-in">
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
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tx.status === 'success'
                          ? 'bg-success/15 border border-success/20'
                          : 'bg-warning/15 border border-warning/20'
                      }`}>
                        <span>{tx.status === 'success' ? '✅' : '⚠️'}</span>
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
              {editingMember && (
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">
                    Số tiền cần thanh toán (đ)
                  </label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="input-field"
                    placeholder="VD: 50000"
                    min="0"
                  />
                  <p className="text-xs text-muted mt-1">
                    Nếu {'>'} 0 sẽ tự động chuyển trạng thái về "Chưa thanh toán"
                  </p>
                </div>
              )}
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
    </div>
  );
};

// ===== Member Row Component =====
const MemberRow = ({ member, onEdit, onDelete, onUpdateAmount }) => {
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
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            member.paymentStatus === 'paid'
              ? 'bg-success/15 border border-success/20'
              : 'bg-danger/15 border border-danger/20'
          }`}>
            <span className={`font-bold ${
              member.paymentStatus === 'paid' ? 'text-success' : 'text-danger'
            }`}>
              {member.name.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-main truncate">{member.name}</p>
            <p className="text-xs text-muted font-mono">#{member.memberCode}</p>
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
