import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

/** Runs 0 → 1 once `start` turns true, so figures count up instead of popping in. */
const useIntro = (start) => {
  const [t, setT] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!start) return undefined;
    const begin = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - begin) / 1200);
      setT(1 - Math.pow(1 - p, 3));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [start]);

  return t;
};

const GUIDE_STEPS = [
  {
    num: '01',
    title: 'Chọn tên của bạn',
    desc: 'Tại tab Danh sách, bấm nút Thanh toán hoặc tên của bạn trong phần "Chưa thanh toán".',
  },
  {
    num: '02',
    title: 'Mở app Ngân hàng',
    desc: 'Mở ứng dụng ngân hàng hoặc ví điện tử (MoMo, ZaloPay...) trên điện thoại của bạn.',
  },
  {
    num: '03',
    title: 'Quét mã QR',
    desc: 'Dùng tính năng Quét QR để quét mã hiển thị trên màn hình.',
    warn: 'Tuyệt đối không sửa "Nội dung CK"',
  },
  {
    num: '04',
    title: 'Xác nhận',
    desc: 'Kiểm tra lại số tiền và nhấn chuyển khoản. Đợi 3–5 giây, hệ thống sẽ tự động gạch nợ.',
  },
];

const PublicView = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'guide'
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [feeConfig, setFeeConfig] = useState({ date: '', courtFee: '', shuttleFee: '' });
  const [isEditingFee, setIsEditingFee] = useState(false);
  const [editFeeForm, setEditFeeForm] = useState({ date: '', courtFee: '', shuttleFee: '' });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
    fetchFeeConfig();
  }, []);

  const fetchFeeConfig = async () => {
    try {
      const res = await api.get('/fee-config');
      if (res.data.data) {
        setFeeConfig(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching fee config:', error);
    }
  };

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

  let displayMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.memberCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (user && user.role === 'user' && !showAll) {
    displayMembers = displayMembers.filter((m) => m._id === user.id);
  }

  const unpaidMembers = displayMembers.filter((m) => m.paymentStatus === 'unpaid');
  const paidMembers = displayMembers.filter((m) => m.paymentStatus === 'paid');
  const totalDue = unpaidMembers.reduce((sum, m) => sum + m.amountDue, 0);

  // Collection progress is always club-wide, so it does not swing with the search box
  const clubPaid = members.filter((m) => m.paymentStatus === 'paid').length;
  const clubPercent = members.length ? Math.round((clubPaid / members.length) * 100) : 0;

  const t = useIntro(!loading);
  const count = (n) => Math.round(n * t);

  const handleAvatarClick = (e, memberId) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/profile/${memberId}`);
  };

  const handleEditFeeClick = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + daysUntilSaturday);
    const defaultDate = nextSaturday.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    setEditFeeForm({
      date: feeConfig.date || defaultDate,
      courtFee: feeConfig.courtFee || '100k',
      shuttleFee: feeConfig.shuttleFee || '100k',
    });
    setIsEditingFee(true);
  };

  const handleSaveFeeConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/fee-config', editFeeForm);
      setFeeConfig(res.data.data);
      setIsEditingFee(false);
      import('react-hot-toast').then((toast) => toast.default.success('Đã lưu thông báo phí'));
    } catch (error) {
      console.error('Error saving fee config:', error);
      import('react-hot-toast').then((toast) => toast.default.error('Lỗi khi lưu thông báo phí'));
    }
  };

  const stats = [
    {
      label: 'Tổng số',
      value: count(displayMembers.length),
      tone: 'text-main',
      icon: (
        <>
          <circle cx="9" cy="8" r="3.4" />
          <path d="M3 20a6 6 0 0112 0M16 5a3.4 3.4 0 010 6.8M21 20a6 6 0 00-4-5.7" />
        </>
      ),
    },
    {
      label: 'Chưa đóng',
      value: count(unpaidMembers.length),
      tone: 'text-warn',
      icon: (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </>
      ),
    },
    {
      label: 'Đã đóng',
      value: count(paidMembers.length),
      tone: 'text-accent',
      icon: (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M8.5 12.3l2.5 2.5 4.5-4.8" />
        </>
      ),
    },
    {
      label: 'Tổng nợ',
      value: formatCurrency(count(totalDue)),
      tone: 'text-main',
      icon: (
        <>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.4" />
        </>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* ---------------------------------------------------------------- Hero */}
      <section className="grid lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-8 items-stretch animate-fade-in">
        <div className="flex flex-col justify-center gap-4">
          <span className="self-start inline-flex items-center gap-2 pl-2.5 pr-3.5 py-1 rounded-full border border-border-color text-xs font-semibold text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-light ring-4 ring-primary/15" />
            {feeConfig.date ? `Buổi Thứ 7 · ${feeConfig.date}` : 'Saturday Badminton Club'}
          </span>

          <h1 className="font-display text-[clamp(2.3rem,5vw,3.9rem)] font-extrabold text-main m-0">
            Thanh toán <span className="grad-text">sân cầu</span>
          </h1>

          <p className="text-[15px] leading-relaxed text-muted max-w-[420px] m-0">
            Tìm và chọn tên của bạn trong danh sách để nhận mã QR chuyển khoản tự động.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 mt-0.5">
            <a href="#danh-sach" className="btn-primary h-12 px-5 text-sm">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="11" cy="11" r="7" strokeWidth={2} />
                <path strokeLinecap="round" strokeWidth={2} d="M20 20l-3.5-3.5" />
              </svg>
              Tìm tên của tôi
            </a>
            <button type="button" onClick={() => setActiveTab('guide')} className="btn-secondary h-12 px-5 text-sm">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="8.5" strokeWidth={1.8} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.8 9.4a2.3 2.3 0 114 1.6c-.9.7-1.8 1.1-1.8 2.3M12 16.6v.01" />
              </svg>
              Hướng dẫn thanh toán
            </button>
          </div>
        </div>

        {/* Club photo, with the fee notice sitting on it as glass */}
        <aside className="glow-border relative min-h-[240px] lg:min-h-[330px] rounded-3xl overflow-hidden bg-[#04140F] flex flex-col justify-end">
          <img
            src="/bad_icon04.png"
            alt="Vận động viên bật nhảy đập cầu trên sân"
            className="kenburns absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: '50% 22%' }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(4,20,15,0.05) 0%, rgba(4,20,15,0.60) 38%, rgba(4,20,15,0.97) 100%)',
            }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.25), transparent 52%)' }}
          />

          {/* Club crest */}
          <img
            src="/bad_icon02.png"
            alt=""
            className="art-tile hidden sm:flex absolute top-4 left-4 w-20 h-20 p-1.5 shadow-lg object-contain"
          />

          <div className="relative p-5 flex flex-col gap-3 text-[#E8F4EE]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-primary-light flex items-center gap-1.5 m-0">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="4" y="5" width="16" height="15" rx="2" strokeWidth={1.9} />
                  <path strokeLinecap="round" strokeWidth={1.9} d="M4 10h16M9 3v4M15 3v4" />
                </svg>
                Thông báo phí · {feeConfig.date || 'chưa có'}
              </p>

              {user?.role === 'admin' && (
                <button
                  onClick={handleEditFeeClick}
                  className="w-11 h-11 shrink-0 rounded-xl border border-white/20 bg-black/35 text-white flex items-center justify-center hover:bg-black/55 transition-colors cursor-pointer"
                  aria-label="Sửa thông báo phí"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 20h4L19 9l-4-4L4 16z" />
                    <path strokeLinecap="round" strokeWidth={1.8} d="M13.5 6.5l4 4" />
                  </svg>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/15 bg-black/45 backdrop-blur-md px-3.5 py-2.5">
                <p className="text-xs text-[#C7D8CC] flex items-center gap-1.5 m-0">
                  <svg className="w-3.5 h-3.5 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth={2} />
                    <path strokeWidth={2} d="M12 5v14M3 12h18" />
                  </svg>
                  Tiền sân
                </p>
                <p className="font-display text-[24px] font-bold mt-0.5 m-0">{feeConfig.courtFee || '—'}</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-black/45 backdrop-blur-md px-3.5 py-2.5">
                <p className="text-xs text-[#C7D8CC] flex items-center gap-1.5 m-0">
                  <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="18" r="3" strokeWidth={2} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.2 15.4L7 4h10l-3.2 11.4M9.6 4l1.2 11M14.4 4l-1.2 11M8 8.5h8" />
                  </svg>
                  Tiền cầu
                </p>
                <p className="font-display text-[24px] font-bold mt-0.5 m-0">{feeConfig.shuttleFee || '—'}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#C7D8CC] flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M4 19V5M4 19h16M8 15V9M12 15v-9M16 15v-5" />
                  </svg>
                  Đã thu toàn CLB
                </span>
                <span className="font-semibold">
                  {clubPaid}/{members.length} · {clubPercent}%
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="bar-fill h-full rounded-full"
                  style={{
                    width: `${clubPercent * t}%`,
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                  }}
                />
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* --------------------------------------------------------------- Stats */}
      <section className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {stats.map((s) => (
          <div key={s.label} className="glass-card lift px-4 py-3 flex items-center gap-3">
            <span className="w-9 h-9 shrink-0 rounded-xl bg-surface flex items-center justify-center text-muted">
              <svg
                className="w-4.5 h-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.9}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {s.icon}
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold tracking-[0.12em] uppercase text-muted">{s.label}</span>
              <span className={`block font-display text-[17px] sm:text-[22px] font-bold ${s.tone}`}>{s.value}</span>
            </span>
          </div>
        ))}
      </section>

      {/* ------------------------------------------------- Login tip (guests) */}
      {/* --------------------------------------------------- Fee config modal */}
      {isEditingFee && (
        <div className="modal-overlay p-4" onClick={() => setIsEditingFee(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-main m-0">Sửa thông báo phí</h2>
              <button
                onClick={() => setIsEditingFee(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-muted hover:bg-surface-hover transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeWidth={1.9} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveFeeConfig} className="flex flex-col gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-main mb-1.5">Ngày áp dụng</span>
                <input
                  type="text"
                  value={editFeeForm.date}
                  onChange={(e) => setEditFeeForm({ ...editFeeForm, date: e.target.value })}
                  className="input-field text-center font-mono"
                  placeholder="VD: 18/07/2026"
                />
                <span className="block text-[11px] text-muted mt-1.5 text-center">Gợi ý mặc định là Thứ 7 gần nhất</span>
              </label>

              <div className="flex gap-3">
                <label className="flex-1">
                  <span className="block text-sm font-semibold text-main mb-1.5">Tiền sân</span>
                  <input
                    type="text"
                    value={editFeeForm.courtFee}
                    onChange={(e) => setEditFeeForm({ ...editFeeForm, courtFee: e.target.value })}
                    className="input-field text-center"
                    placeholder="VD: 100k"
                  />
                </label>
                <label className="flex-1">
                  <span className="block text-sm font-semibold text-main mb-1.5">Tiền cầu</span>
                  <input
                    type="text"
                    value={editFeeForm.shuttleFee}
                    onChange={(e) => setEditFeeForm({ ...editFeeForm, shuttleFee: e.target.value })}
                    className="input-field text-center"
                    placeholder="VD: 100(cầu)"
                  />
                </label>
              </div>

              <button type="submit" className="btn-primary w-full mt-2">
                Lưu thay đổi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------- Tab strip */}
      <div id="danh-sach" className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 scroll-mt-24">
        <div className="self-start inline-flex gap-1 p-1 rounded-2xl bg-surface border border-border-color">
          {[
            ['members', 'Danh sách'],
            ['guide', 'Hướng dẫn'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              aria-pressed={activeTab === key}
              className={`h-10 px-5 rounded-xl text-sm transition-colors cursor-pointer ${
                activeTab === key
                  ? 'font-bold text-on-primary bg-linear-to-br from-primary to-primary-light'
                  : 'font-semibold text-muted hover:text-main'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'members' && (
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
            {user && user.role === 'user' && (
              <label className="flex items-center gap-2.5 cursor-pointer bg-surface px-4 h-12 rounded-xl border border-border-color shrink-0">
                <span className="relative">
                  <input type="checkbox" className="sr-only" checked={showAll} onChange={() => setShowAll(!showAll)} />
                  <span className={`block w-10 h-6 rounded-full transition-colors ${showAll ? 'bg-primary' : 'bg-border-color'}`} />
                  <span
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      showAll ? 'translate-x-4' : ''
                    }`}
                  />
                </span>
                <span className="text-sm font-semibold text-main">Xem tất cả</span>
              </label>
            )}

            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="11" cy="11" r="7" strokeWidth={1.8} />
                  <path strokeLinecap="round" strokeWidth={1.8} d="M20 20l-3.5-3.5" />
                </svg>
              </span>
              <input
                type="search"
                className="input-field h-12 py-0"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="Tìm tên hoặc mã thành viên…"
                aria-label="Tìm kiếm thành viên"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------ Content */}
      <div className="mt-6 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-20 w-full" />
            ))}
          </div>
        ) : activeTab === 'members' ? (
          <div className="animate-slide-up flex flex-col gap-11">
            {/* ------------------------------------------------------ Unpaid */}
            {unpaidMembers.length > 0 && (
              <section>
                <header className="flex items-center justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-warn" />
                    <h2 className="text-xl font-bold text-main m-0">Chưa thanh toán</h2>
                    <span className="badge-unpaid">{unpaidMembers.length}</span>
                  </div>
                  <p className="hidden sm:flex items-center gap-2 text-sm text-muted m-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth={1.8} />
                      <path strokeLinecap="round" strokeWidth={1.8} d="M3 10h18" />
                    </svg>
                    Còn thiếu <strong className="font-semibold text-main">{formatCurrency(totalDue)}</strong>
                  </p>
                </header>

                <div className="flex flex-col gap-2.5">
                  {unpaidMembers.map((member) => (
                    <Link
                      key={member._id}
                      to={`/payment/${member._id}`}
                      className="row-owe p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-[18px]"
                    >
                      <span
                        className="ring-owe relative w-14 h-14 shrink-0 rounded-full bg-surface overflow-hidden flex items-center justify-center cursor-pointer group"
                        onClick={(e) => handleAvatarClick(e, member._id)}
                      >
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-main">{member.name.charAt(0)}</span>
                        )}
                        <span className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 8h3l2-3h6l2 3h3v11H4z" />
                            <circle cx="12" cy="13" r="3.4" strokeWidth={1.8} />
                          </svg>
                        </span>
                      </span>

                      <span className="flex-1 min-w-0 flex flex-col gap-1">
                        <span className="flex flex-wrap items-center gap-2.5">
                          <span
                            className="text-[16.5px] font-semibold text-main truncate cursor-pointer hover:underline"
                            onClick={(e) => handleAvatarClick(e, member._id)}
                          >
                            {member.name}
                          </span>
                          {member.note && (
                            <span className="badge-violet normal-case tracking-normal text-xs inline-flex items-center gap-1.5">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12V5a1 1 0 011-1h7l8 8-8 8-8-8z" />
                                <circle cx="8.5" cy="8.5" r="1.2" strokeWidth={2} />
                              </svg>
                              {member.note}
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-[12.5px] text-muted">#{member.memberCode}</span>
                      </span>

                      <span className="flex items-center justify-between sm:justify-end gap-4 sm:gap-[18px]">
                        <span className="flex flex-col sm:items-end gap-1">
                          <span className="text-xs font-semibold" style={{ color: 'var(--owe-text)' }}>
                            Cần thanh toán
                          </span>
                          <span className="font-display text-[26px] font-extrabold text-warn">
                            {formatCurrency(member.amountDue)}
                          </span>
                        </span>

                        <span className="btn-primary btn-quiet h-11 px-4 py-0 shrink-0 text-sm">
                          <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <rect x="4" y="4" width="6" height="6" rx="1" strokeWidth={2} />
                            <rect x="14" y="4" width="6" height="6" rx="1" strokeWidth={2} />
                            <rect x="4" y="14" width="6" height="6" rx="1" strokeWidth={2} />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18v2M18 14h2" />
                          </svg>
                          Thanh toán
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* -------------------------------------------------------- Paid */}
            {paidMembers.length > 0 && (
              <section>
                <header className="flex items-center gap-3 mb-3.5">
                  <span className="w-[22px] h-[22px] rounded-full bg-primary text-on-primary flex items-center justify-center">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </span>
                  <h2 className="text-xl font-bold text-main m-0">Đã thanh toán</h2>
                  <span className="badge-paid">{paidMembers.length}</span>
                </header>

                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                  {paidMembers.map((member) => (
                    <div key={member._id} className="row-done p-3.5 px-4 flex items-center gap-3.5">
                      <span
                        className="ring-done relative w-10 h-10 shrink-0 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center cursor-pointer group"
                        onClick={(e) => handleAvatarClick(e, member._id)}
                      >
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[15px] font-bold text-primary">{member.name.charAt(0)}</span>
                        )}
                        <span className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 8h3l2-3h6l2 3h3v11H4z" />
                            <circle cx="12" cy="13" r="3.4" strokeWidth={1.8} />
                          </svg>
                        </span>
                      </span>

                      <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <span
                          className="text-[14.5px] font-semibold text-main truncate cursor-pointer hover:underline"
                          onClick={(e) => handleAvatarClick(e, member._id)}
                        >
                          {member.name}
                        </span>
                        <span className="font-mono text-xs text-muted">#{member.memberCode}</span>
                      </span>

                      <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-success shrink-0">
                        <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                        <span className="hidden sm:inline">Hoàn tất</span>
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {displayMembers.length === 0 && (
              <div className="text-center py-16 glass-card border-dashed">
                <span className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-border-color">
                  <svg className="w-10 h-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="11" cy="11" r="7" strokeWidth={1.5} />
                    <path strokeLinecap="round" strokeWidth={1.5} d="M21 21l-5-5" />
                  </svg>
                </span>
                <h3 className="text-xl font-bold text-main mb-2">Không tìm thấy kết quả</h3>
                <p className="text-muted m-0">Không có thành viên nào khớp với tìm kiếm của bạn.</p>
              </div>
            )}
          </div>
        ) : (
          /* ------------------------------------------------------- Guide tab */
          <div className="animate-slide-up">
            <div className="grid lg:grid-cols-[1fr_300px] gap-7 items-center">
              <div>
                <h2 className="font-display text-[32px] font-bold text-main m-0">Hướng dẫn thanh toán</h2>
                <p className="mt-2.5 max-w-[520px] text-[15px] text-muted m-0">
                  Bốn bước, khoảng một phút. Hệ thống tự gạch nợ khi nhận được chuyển khoản.
                </p>
              </div>
              <div className="art-tile lift hidden lg:flex p-2">
                <img src="/bad_icon03.png" alt="Hình minh hoạ vận động viên đập cầu" className="w-full h-[190px] object-contain" />
              </div>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-4 gap-3.5 stagger">
              {GUIDE_STEPS.map((step) => (
                <div key={step.num} className="glass-card lift p-6 flex flex-col">
                  <span className="font-display text-[60px] font-extrabold text-primary-light leading-none">{step.num}</span>
                  <h3 className="mt-5 mb-2 text-[17px] font-bold text-main">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted m-0">{step.desc}</p>
                  {step.warn && (
                    <p className="mt-3.5 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-warn/10 text-warn text-[12.5px] font-semibold m-0">
                      <svg className="w-[15px] h-[15px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l9.5 17h-19z" />
                        <path strokeLinecap="round" strokeWidth={2} d="M12 10v4M12 17.5v.01" />
                      </svg>
                      {step.warn}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 rounded-2xl border border-dashed border-border-color">
              <p className="text-[15px] font-semibold text-main m-0">
                Gặp lỗi khi thanh toán hoặc hệ thống không tự gạch nợ?
              </p>
              <p className="text-sm text-muted m-0">
                Liên hệ <strong className="font-semibold text-main">chinhdd</strong> hoặc{' '}
                <a href="mailto:doanchinhit21@gmail.com" className="font-semibold text-primary hover:underline">
                  doanchinhit21@gmail.com
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
      {!user && (
        <div className="mt-8 glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-4 text-sm leading-relaxed text-muted">
          <span className="w-10 h-10 shrink-0 rounded-full bg-primary/12 text-primary flex items-center justify-center">
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="8" r="4" strokeWidth={1.8} />
              <path strokeLinecap="round" strokeWidth={1.8} d="M4 20a8 8 0 0116 0" />
            </svg>
          </span>
          <p className="flex-1 m-0">
            <strong className="font-semibold text-main">Mẹo đăng nhập:</strong> đăng nhập để đổi avatar và chỉ thấy giao
            dịch của mình. Tên đăng nhập là tên không dấu (VD: Trần Thế Chiến →{' '}
            <code className="font-mono text-[13px] px-1.5 py-0.5 rounded-md bg-surface text-main">chientt</code>), mật
            khẩu mặc định{' '}
            <code className="font-mono text-[13px] px-1.5 py-0.5 rounded-md bg-surface text-main">12345678</code>.
          </p>
          <Link to="/login" className="font-semibold text-primary whitespace-nowrap hover:underline">
            Đăng nhập →
          </Link>
        </div>
      )}
    </div>
  );
};

export default PublicView;
