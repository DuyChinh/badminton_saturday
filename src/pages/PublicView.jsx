import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { formatCurrency } from '../utils/formatters';

const PublicView = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'guide'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/members');
      setMembers(res.data.data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((m) => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.memberCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unpaidMembers = filteredMembers.filter((m) => m.paymentStatus === 'unpaid');
  const paidMembers = filteredMembers.filter((m) => m.paymentStatus === 'paid');
  const totalDue = unpaidMembers.reduce((sum, m) => sum + m.amountDue, 0);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="text-center mb-10 animate-fade-in relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -z-10"></div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-main mb-4 tracking-tight flex items-center justify-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9 sm:w-11 sm:h-11 text-primary shrink-0">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.39 2.83-3.12 3.16z"/>
          </svg>
          Thanh toán <span className="text-primary">Sân Cầu</span>
        </h1>
        <p className="text-muted text-lg max-w-xl mx-auto mb-8">
          Tìm và chọn tên của bạn trong danh sách để nhận mã QR chuyển khoản tự động. 
        </p>

        {/* Compact Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-surface p-3 sm:px-6 sm:py-4 rounded-2xl border border-border-color shadow-sm mb-6 animate-fade-in text-sm sm:text-base">
          <div className="flex gap-4 sm:gap-8 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-muted">Tổng số:</span>
              <span className="font-bold text-main">{members.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted">Chưa đóng:</span>
              <span className="font-bold text-danger">{members.filter(m => m.paymentStatus === 'unpaid').length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted">Đã đóng:</span>
              <span className="font-bold text-success">{members.filter(m => m.paymentStatus === 'paid').length}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-bg-main px-4 py-1.5 rounded-lg border border-border-color">
            <span className="text-muted">Tổng nợ:</span>
            <span className="font-bold text-accent text-lg">{formatCurrency(members.filter(m => m.paymentStatus === 'unpaid').reduce((sum, m) => sum + m.amountDue, 0))}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 animate-fade-in">
        <div className="bg-surface p-1.5 rounded-2xl border border-border-color inline-flex gap-1.5 shadow-sm w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 sm:flex-none px-5 sm:px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'members'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted hover:text-main hover:bg-surface-hover'
            }`}
          >
            Danh sách
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 sm:flex-none px-5 sm:px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'guide'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted hover:text-main hover:bg-surface-hover'
            }`}
          >
            Hướng dẫn
          </button>
        </div>

        {activeTab === 'members' && (
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="input-field w-full"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Tìm kiếm tên hoặc mã..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-16 w-full" />
            ))}
          </div>
        ) : activeTab === 'members' ? (
          <div className="animate-slide-up space-y-8">
            {/* Unpaid Section */}
            {unpaidMembers.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center border border-danger/20">
                    <span className="w-2.5 h-2.5 bg-danger rounded-full animate-pulse"></span>
                  </div>
                  <h2 className="text-xl font-bold text-main">Chưa thanh toán</h2>
                  <span className="text-sm font-medium text-main bg-surface px-3 py-1 rounded-full border border-border-color">{unpaidMembers.length}</span>
                </div>
                
                <div className="flex flex-col gap-3">
                  {unpaidMembers.map((member) => (
                    <Link
                      key={member._id}
                      to={`/payment/${member._id}`}
                      className="glass-card p-4 sm:p-5 group flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden transition-all hover:bg-surface-hover"
                    >
                      {/* Hover gradient effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-danger/0 via-danger/5 to-danger/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                      
                      <div className="flex items-center gap-4 relative z-10 min-w-0">
                        <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center border border-border-color group-hover:border-danger/30 transition-colors shadow-sm shrink-0">
                          <span className="text-lg font-bold text-main group-hover:text-danger transition-colors">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-main text-base sm:text-lg group-hover:text-primary transition-colors truncate">
                            {member.name}
                          </p>
                          <p className="text-sm text-muted font-mono flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                            {member.memberCode}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 w-full sm:w-auto relative z-10">
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-muted mb-0.5">Cần thanh toán</p>
                          <p className="font-extrabold text-danger text-lg sm:text-xl">
                            {formatCurrency(member.amountDue)}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="btn-primary py-2.5 px-5 w-full sm:w-auto shrink-0 whitespace-nowrap shadow-lg shadow-primary/20 group-hover:shadow-primary/40"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                          Thanh toán
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Paid Section */}
            {paidMembers.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center border border-success/20">
                    <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-main">Đã thanh toán</h2>
                  <span className="text-sm font-medium text-main bg-surface px-3 py-1 rounded-full border border-border-color">{paidMembers.length}</span>
                </div>

                <div className="flex flex-col gap-3">
                  {paidMembers.map((member) => (
                    <div
                      key={member._id}
                      className="glass-card p-4 sm:p-5 opacity-75 hover:opacity-100 transition-all flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center border border-success/20 shrink-0">
                          <span className="text-lg font-bold text-success">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-main text-base sm:text-lg">{member.name}</p>
                          <p className="text-sm text-muted font-mono">#{member.memberCode}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="badge-paid flex items-center gap-1.5 shadow-sm">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="hidden sm:inline">Hoàn tất</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredMembers.length === 0 && (
              <div className="text-center py-16 glass-card border-dashed">
                <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-border-color">
                  <svg className="w-10 h-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-main mb-2">Không tìm thấy kết quả</h3>
                <p className="text-muted">Không có thành viên nào khớp với tìm kiếm của bạn.</p>
              </div>
            )}
          </div>
        ) : (
          /* Guide Tab */
          <div className="animate-slide-up max-w-3xl mx-auto">
            <div className="glass-card p-6 sm:p-10">
              <h2 className="text-2xl font-bold text-main mb-8 flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Hướng dẫn thanh toán
              </h2>
              
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-color before:to-transparent">
                
                {/* Step 1 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-bg-main bg-primary text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    1
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-surface border border-border-light shadow-sm transition-all hover:shadow-md">
                    <h3 className="font-bold text-main text-lg mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                      Chọn tên của bạn
                    </h3>
                    <p className="text-sm text-muted">Tại tab Danh sách, bấm vào Nút Thanh Toán hoặc tên của bạn trong phần "Chưa thanh toán".</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-bg-main bg-primary text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    2
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-surface border border-border-light shadow-sm transition-all hover:shadow-md">
                    <h3 className="font-bold text-main text-lg mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Mở app Ngân hàng
                    </h3>
                    <p className="text-sm text-muted">Mở ứng dụng ngân hàng hoặc ví điện tử (MoMo, ZaloPay...) trên điện thoại của bạn.</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-bg-main bg-primary text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    3
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-surface border-2 border-primary/40 shadow-lg shadow-primary/10 relative overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/20 hover:border-primary/60">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                    <h3 className="font-bold text-main text-lg mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      Quét mã QR
                    </h3>
                    <p className="text-sm text-muted mb-3">Dùng tính năng Quét QR để quét mã hiển thị trên màn hình.</p>
                    <div className="bg-danger/10 border border-danger/20 rounded-lg p-3">
                      <p className="text-sm font-bold text-danger flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        TUYỆT ĐỐI KHÔNG sửa "Nội dung CK"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-bg-main bg-primary text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    4
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-surface border border-border-light shadow-sm transition-all hover:shadow-md">
                    <h3 className="font-bold text-main text-lg mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Xác nhận
                    </h3>
                    <p className="text-sm text-muted">Kiểm tra lại số tiền và nhấn chuyển khoản. Đợi 3-5 giây hệ thống sẽ tự động gạch nợ thành công.</p>
                  </div>
                </div>

              </div>

              {/* Support info */}
              <div className="mt-12 bg-surface border border-border-color rounded-2xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 bg-bg-main rounded-full flex items-center justify-center mx-auto mb-3 border border-border-color">
                  <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-muted mb-1">Gặp lỗi khi thanh toán hoặc hệ thống không tự gạch nợ?</p>
                <p className="text-main font-bold">Vui lòng liên hệ Admin / Trưởng sân để được hỗ trợ.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicView;
