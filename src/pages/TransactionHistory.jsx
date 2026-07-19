import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatCurrency, formatDate } from '../utils/formatters';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    fetchTransactions();
  }, [month, year]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments/transactions', {
        params: { search, month, year, limit: 100 }
      });
      setTransactions(res.data.data || []);
      setTotalAmount(res.data.summary?.totalAmount || 0);
    } catch (error) {
      console.error('Lỗi khi tải lịch sử giao dịch:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-10 animate-fade-in relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-accent/20 rounded-full blur-[60px] -z-10"></div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-main mb-4 tracking-tight flex items-center justify-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 text-accent animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Lịch sử <span className="text-accent">Giao dịch</span>
        </h1>
        <p className="text-muted text-lg max-w-xl mx-auto">
          Lịch sử các khoản thanh toán được hệ thống ghi nhận từ ngân hàng
        </p>
      </div>

      <div className="min-h-[400px]">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-slide-up">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="input-field w-full pl-10"
                placeholder="Tìm kiếm theo tên hoặc mã thành viên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg className="w-5 h-5 text-muted absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>
          <div className="flex gap-4">
            <select
              className="input-field"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="">Tất cả các tháng</option>
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>Tháng {i+1}</option>
              ))}
            </select>
            <select
              className="input-field"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Tất cả các năm</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-16 w-full" />
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="animate-slide-up space-y-4">
            <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-border-color shadow-sm mb-4">
              <span className="text-muted font-medium">Tổng giao dịch: <span className="text-main font-bold">{transactions.length}</span></span>
              <span className="text-muted font-medium">Tổng tiền nhận: <span className="text-success font-extrabold text-xl">{formatCurrency(totalAmount)}</span></span>
            </div>
            
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface border-b border-border-color text-muted uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Thời gian</th>
                      <th className="px-6 py-4 font-semibold">Người chuyển</th>
                      <th className="px-6 py-4 font-semibold">Số tiền</th>
                      <th className="px-6 py-4 font-semibold">Nội dung</th>
                      <th className="px-6 py-4 font-semibold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-surface-hover/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-muted font-mono">
                          {formatDate(tx.transactionDate || tx.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {tx.memberId?.avatarUrl ? (
                              <img src={tx.memberId.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-border-color shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-surface text-main flex items-center justify-center font-bold border border-border-color shrink-0">
                                {tx.memberId ? tx.memberId.name.charAt(0) : 'U'}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-main">{tx.memberId ? tx.memberId.name : tx.memberCode || 'Không xác định'}</div>
                              {tx.memberId && <div className="text-xs text-muted font-mono">#{tx.memberId.memberCode}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-success">
                          +{formatCurrency(tx.amount)}
                        </td>
                        <td className="px-6 py-4 text-muted font-mono text-xs whitespace-pre-wrap break-all">
                          {tx.transactionContent}
                        </td>
                        <td className="px-6 py-4">
                          {tx.status === 'success' ? (
                            <span className="badge-paid flex w-max items-center gap-1 text-xs">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                              Gạch nợ
                            </span>
                          ) : (
                            <span className="badge-unpaid flex w-max items-center gap-1 text-xs">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Không khớp
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 glass-card border-dashed">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-border-color">
              <svg className="w-10 h-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-main mb-2">Chưa có giao dịch nào</h3>
            <p className="text-muted">Hệ thống chưa ghi nhận được giao dịch chuyển khoản nào từ ngân hàng.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
