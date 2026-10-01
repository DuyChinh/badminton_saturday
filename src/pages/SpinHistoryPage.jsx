import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

const SpinHistoryPage = () => {
  const { isAdmin } = useAuth();
  const [history, setHistory] = useState([]);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [prizeId, setPrizeId] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [day, month, year, prizeId]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments/spin-history', {
        params: { search, day, month, year, prizeId, limit: 100 }
      });
      setHistory(res.data.data || []);
      setTotalDiscount(res.data.summary?.totalDiscount || 0);
    } catch (error) {
      console.error('Lỗi khi tải lịch sử quay thưởng:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá lịch sử quay này?')) return;
    try {
      await api.delete(`/payments/spin-history/${id}`);
      toast.success('Đã xoá lịch sử quay');
      fetchHistory();
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xoá lịch sử quay');
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-10 animate-fade-in relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -z-10"></div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-main mb-4 tracking-tight flex items-center justify-center gap-3">
          <span className="text-primary text-[42px] leading-none">🎁</span>
          Lịch sử <span className="text-primary">Quay Thưởng</span>
        </h1>
        <p className="text-muted text-lg max-w-xl mx-auto">
          Danh sách các thành viên đã may mắn trúng thưởng từ vòng quay
        </p>
      </div>

      <div className="min-h-[400px]">
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6 animate-slide-up">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <input
                type="text"
                className="input-field w-full !pl-11"
                placeholder="Tìm kiếm theo tên hoặc mã thành viên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg className="w-5 h-5 text-muted absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              className="input-field w-full"
              value={prizeId}
              onChange={(e) => setPrizeId(e.target.value)}
            >
              <option value="">Tất cả phần thưởng</option>
              <option value="cash1">10.000đ</option>
              <option value="cash2">2.000đ</option>
              <option value="cash3">15.000đ</option>
              <option value="cash4">4.000đ</option>
              <option value="cash5">5.000đ</option>
              <option value="half">Giảm 50%</option>
            </select>
            <select
              className="input-field w-full"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            >
              <option value="">Tất cả ngày</option>
              {[...Array(31)].map((_, i) => (
                <option key={i+1} value={i+1}>Ngày {i+1}</option>
              ))}
            </select>
            <select
              className="input-field w-full"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="">Tất cả tháng</option>
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>Tháng {i+1}</option>
              ))}
            </select>
            <select
              className="input-field w-full"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Tất cả năm</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </div>

        {!loading && (
          <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-surface p-5 rounded-2xl border border-border-color shadow-sm mb-6 animate-slide-up gap-4">
            <span className="text-muted font-medium text-lg">Tổng số lượt trúng: <span className="text-main font-bold">{history.length}</span></span>
            <span className="text-muted font-medium text-lg">Tổng tiền đã trúng: <span className="text-primary font-extrabold text-2xl">{formatCurrency(totalDiscount)}</span></span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : history.length > 0 ? (
          <div className="animate-slide-up space-y-4">
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface border-b border-border-color text-muted uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Thời gian</th>
                      <th className="px-6 py-4 font-semibold">Thành viên</th>
                      <th className="px-6 py-4 font-semibold">Phần thưởng</th>
                      <th className="px-6 py-4 font-semibold">Giảm giá thực tế</th>
                      <th className="px-6 py-4 font-semibold">Trạng thái</th>
                      {isAdmin && <th className="px-6 py-4 font-semibold text-right">Thao tác</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {history.map((record) => (
                      <tr key={record._id} className="hover:bg-surface-hover/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-muted font-mono">
                          {formatDate(record.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0 overflow-hidden border border-border-color">
                              {record.memberId?.avatarUrl ? (
                                <img src={record.memberId.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span>{record.memberName ? record.memberName.charAt(0).toUpperCase() : '?'}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-main">{record.memberName}</div>
                              <div className="text-xs text-muted font-mono">#{record.memberCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-main">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${record.discount > 0 ? 'bg-primary/10 text-primary' : 'bg-surface text-muted'}`}>
                            {record.discount > 0 ? '🎁' : '😢'} {record.prizeLabel}
                          </span>
                        </td>
                        <td className={`px-6 py-4 font-extrabold ${record.discount > 0 ? 'text-success' : 'text-muted'}`}>
                          {record.discount > 0 ? formatCurrency(record.discount) : '0đ'}
                        </td>
                        <td className="px-6 py-4">
                          {record.status === 'applied' ? (
                            <span className="badge-paid flex w-max items-center gap-1.5 text-xs">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                              Đã nhận
                            </span>
                          ) : (
                            <span className="badge-unpaid flex w-max items-center gap-1.5 text-xs">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Đã huỷ
                            </span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDelete(record._id)}
                              className="text-muted hover:text-danger p-2 rounded-lg hover:bg-danger/10 transition-colors"
                              title="Xoá lịch sử"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 glass-card border-dashed">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-5 border border-border-color">
              <span className="text-[40px] leading-none opacity-50">😢</span>
            </div>
            <h3 className="text-xl font-bold text-main mb-2">Chưa có ai trúng thưởng</h3>
            <p className="text-muted max-w-sm mx-auto">Chưa có dữ liệu nào khớp với bộ lọc của bạn. Hãy thử thay đổi ngày tháng hoặc phần thưởng xem sao.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpinHistoryPage;
