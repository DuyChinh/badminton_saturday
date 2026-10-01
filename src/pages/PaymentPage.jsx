import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { formatCurrency } from '../utils/formatters';
import LuckyWheel from '../components/LuckyWheel';
import PrizePopup from '../components/PrizePopup';
import toast from 'react-hot-toast';

const CopyIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <rect x="9" y="9" width="11" height="11" rx="2" strokeWidth={1.8} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 15V6a2 2 0 012-2h8" />
  </svg>
);

const BackLink = () => (
  <Link to="/" className="inline-flex items-center gap-1.5 py-1 text-xs sm:text-sm font-medium text-muted hover:text-main transition-colors mb-1">
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
    Quay lại danh sách
  </Link>
);

const CONFETTI_COLORS = ['#34D399', '#5EEAD4', '#A78BFA', '#FFB45E', '#E8C14A', '#FFFFFF'];

const PaymentPage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imgLoaded, setImgLoaded] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [spinning, setSpinning] = useState(false);
  const [pendingPrize, setPendingPrize] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const pendingSpin = useRef(null);
  const [popup, setPopup] = useState(null);
  const [showOdds, setShowOdds] = useState(false);

  // Fixed per mount so the pieces do not reshuffle on every re-render
  const confetti = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: `${Math.round(Math.random() * 94 + 2)}%`,
        width: [6, 8, 10][i % 3],
        height: [10, 14, 6][i % 3],
        background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        borderRadius: i % 2 ? '50%' : '2px',
        animationDelay: `${(Math.random() * 3).toFixed(2)}s`,
        animationDuration: `${(Math.random() * 1.6 + 2.6).toFixed(2)}s`,
      })),
    []
  );

  useEffect(() => {
    fetchQR();
  }, [memberId]);

  useEffect(() => {
    if (!memberId) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await api.get(`/members/${memberId}`);
        const currentMember = res.data.data;
        if (currentMember.paymentStatus === 'paid') {
          clearInterval(intervalId);
          setPaymentSuccess(true);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [memberId]);

  useEffect(() => {
    let timer;
    if (paymentSuccess && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (paymentSuccess && countdown <= 0) {
      navigate('/');
    }
    return () => clearInterval(timer);
  }, [paymentSuccess, countdown, navigate]);

  const fetchQR = async () => {
    try {
      const res = await api.get(`/payments/qr/${memberId}`);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã copy ${label}`);
  };

  const handleSpin = async () => {
    if (spinning) return;
    setSpinning(true);
    try {
      const res = await api.post(`/payments/lucky-spin/${memberId}`);
      if (res.data.data.outOfTurns) {
        setSpinning(false);
        setPopup({
          isLimitReached: true
        });
        return;
      }
      if (res.data.data.amountTooHigh) {
        setSpinning(false);
        setPopup({
          isAmountTooHigh: true
        });
        return;
      }
      pendingSpin.current = res.data.data;
      setPendingPrize(res.data.data.prizeId);
    } catch (err) {
      setSpinning(false);
      setPendingPrize(null);
      toast.error(err.response?.data?.message || 'Chưa quay được, thử lại nhé');
    }
  };

  // Fired by the wheel once it has come to rest on the drawn slice
  const handleSpinEnd = () => {
    const payload = pendingSpin.current;
    pendingSpin.current = null;
    setSpinning(false);
    setPendingPrize(null);
    if (!payload) return;

    if (payload.discount > 0) setImgLoaded(false); // the QR encodes the amount
    setData((prev) => ({
      ...prev,
      member: { ...prev.member, amountDue: payload.member.amountDue },
      payment: payload.payment,
      lucky: {
        ...prev.lucky,
        spun: true,
        cancelled: false,
        result: {
          prizeId: payload.prizeId,
          discount: payload.discount,
          originalAmountDue: payload.originalAmountDue,
        },
      },
    }));

    setPopup({
      label: payload.prizeLabel,
      discount: payload.discount,
      newAmount: payload.member.amountDue,
    });
  };

  const handleCancelLucky = async () => {
    setCancelling(true);
    try {
      const res = await api.post(`/payments/lucky-cancel/${memberId}`);
      if (discount > 0) setImgLoaded(false);
      setData((prev) => ({
        ...prev,
        member: { ...prev.member, amountDue: res.data.data.member.amountDue },
        payment: res.data.data.payment,
        // The turn stays used up — only the money goes back.
        lucky: { ...prev.lucky, spun: true, cancelled: true, result: null },
      }));
      toast.success('Đã hoàn lại số tiền ban đầu');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không hoàn lại được');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="app-narrow">
        <div className="glass-card p-8 text-center min-h-[360px] flex flex-col justify-center">
          <span className="w-12 h-12 border-[3px] border-primary/25 border-t-primary rounded-full animate-spin mx-auto mb-5" />
          <p className="text-muted text-sm m-0">Đang tạo mã thanh toán…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-narrow">
        <BackLink />
        <div className="glass-card p-8 text-center animate-fade-in mt-2">
          <span className="w-14 h-14 bg-primary/12 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          <h2 className="text-xl font-bold text-main mb-2">{error}</h2>
          <p className="text-muted mb-6 text-sm">Bạn không có khoản nợ nào cần thanh toán lúc này.</p>
          <Link to="/" className="btn-secondary text-sm py-2.5 px-5">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="max-w-lg mx-auto w-full">
        <div className="glass-card relative overflow-hidden p-8 pt-12 text-center animate-fade-in border-success/30">
          <div className="confetti-layer" aria-hidden="true">
            {confetti.map(({ id, ...style }) => (
              <span key={id} style={style} />
            ))}
          </div>

          <div className="relative">
            <span
              className="halo w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-10 text-on-primary"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))' }}
            >
              <svg className="w-13 h-13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.6} d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>

            <h2 className="font-display text-[42px] font-extrabold text-main m-0">
              Thanh toán
              <br />
              <span className="grad-text">thành công!</span>
            </h2>
            <p className="text-muted mt-3 mb-8 leading-relaxed text-[15px]">
              Đã ghi nhận khoản thanh toán của bạn. Cảm ơn bạn, chúc bạn một ngày vui vẻ và đầy ý nghĩa.
            </p>

            <Link to="/" className="btn-primary w-full py-3.5">
              Về trang chủ ngay
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <p className="text-xs text-muted mt-4 m-0">Tự động chuyển về trang chủ sau {countdown} giây…</p>
          </div>
        </div>
      </div>
    );
  }

  const { member, payment, lucky } = data;
  const discount = lucky?.result?.discount ?? 0;
  const spinUsed = Boolean(lucky?.spun);
  const wonPrize = lucky?.result ? lucky.prizes.find((p) => p.id === lucky.result.prizeId) : null;

  return (
    <div className="w-full animate-slide-up">
      <BackLink />

      {/* Name, status and the wheel share one band so the wheel can be large */}
      <div className="mt-0 grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-8 gap-y-3">
        <div className="lg:self-start lg:pt-1">
          <p className="text-xs font-bold tracking-[0.16em] uppercase text-primary m-0">Hóa đơn thanh toán</p>
          <h1 className="font-display text-[clamp(1.4rem,2.4vw,1.9rem)] font-extrabold text-main mt-1.5 m-0">
            {member.name}
          </h1>
          <p className="font-mono text-[13px] text-muted mt-1 m-0">#{member.memberCode}</p>
          <span className="mt-3 inline-flex items-center gap-2 h-8 px-3 rounded-full bg-warn/12 text-warn text-[12.5px] font-semibold">
            <span className="live w-2 h-2 rounded-full bg-warn" />
            Đang chờ chuyển khoản
          </span>
        </div>

        {lucky && (
          <div className="flex flex-col items-center gap-2.5 justify-self-center">
            <div className="relative">
              <LuckyWheel
                prizes={lucky.prizes}
                spinning={spinning}
                resultPrizeId={pendingPrize}
                onSpinEnd={handleSpinEnd}
                size="clamp(190px, 20vw, 260px)"
              />
              {/* Humorous Message Bubble */}
              <div className="hidden sm:block absolute top-1/2 -right-16 translate-x-full -translate-y-1/2 w-[180px] pointer-events-none">
                <div className="relative bg-surface/80 backdrop-blur-md border border-primary/30 p-3.5 rounded-2xl shadow-xl text-center">
                  {/* Bubble tail pointing left */}
                  <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-surface/90 border-l border-b border-primary/30 rotate-45"></div>
                  <p className="text-[13.5px] font-medium text-main m-0 leading-relaxed">
                    Hãy tham gia vòng quay may mắn để <span className="text-primary font-bold">test nhân phẩm</span>, biết đâu gỡ lại được tiền cước! 🤪🏸
                  </p>
                </div>
              </div>
            </div>

            {!spinUsed ? (
              <button
                type="button"
                onClick={handleSpin}
                disabled={spinning}
                className="btn-primary h-11 px-7 text-[14.5px] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              >
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12a8 8 0 11-2.4-5.7M20 4v5h-5" />
                </svg>
                {spinning ? 'Đang quay…' : 'Quay để thử vận may'}
              </button>
            ) : lucky.cancelled ? (
              <div className="flex flex-col items-center gap-1.5 text-center">
                <p className="text-[12.5px] text-muted m-0">
                  Đã hoàn lại số tiền ban đầu
                </p>
                <button
                  type="button"
                  onClick={handleSpin}
                  disabled={spinning}
                  className="btn-primary h-9 px-5 text-sm disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 12a8 8 0 11-2.4-5.7M20 4v5h-5" />
                  </svg>
                  {spinning ? 'Đang quay…' : 'Cay quá, phục thù!'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-center">
                <p className={`text-sm font-bold m-0 ${wonPrize?.kind === 'none' ? 'text-muted' : 'text-primary-light'}`}>
                  {wonPrize?.label}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleSpin}
                    disabled={spinning}
                    className="btn-primary h-9 px-5 text-[13.5px] disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 12a8 8 0 11-2.4-5.7M20 4v5h-5" />
                    </svg>
                    {spinning ? 'Đang quay…' : 'Quay để thử vận may'}
                  </button>
                  {discount > 0 && (
                    <button
                      type="button"
                      onClick={handleCancelLucky}
                      disabled={cancelling || spinning}
                      className="h-9 px-4 text-[13px] font-semibold text-white bg-[#ef4444] hover:bg-[#dc2626] rounded-xl shadow-md transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      {cancelling ? 'Đang hoàn lại…' : 'Chê, không thèm lấy!'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div aria-hidden="true" className="hidden lg:block" />
      </div>

      {/* The ticket: details on the left, QR on the right */}
      <div className="glow-border mt-4 sm:mt-5 grid lg:grid-cols-[1.1fr_1fr] rounded-3xl overflow-hidden border border-border-color bg-card">
        <div className="p-7 sm:p-9 flex flex-col gap-7">
          <div>
            <p className="text-[13px] text-muted m-0">Số tiền cần thanh toán</p>
            <p className="font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.18] font-extrabold grad-text mt-1 m-0">
              {formatCurrency(member.amountDue)}
            </p>
            {discount > 0 && (
              <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] m-0">
                <span className="text-muted line-through">{formatCurrency(lucky.result.originalAmountDue)}</span>
                <span className="badge-paid inline-flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12V5a1 1 0 011-1h7l8 8-8 8-8-8z" />
                    <circle cx="8.5" cy="8.5" r="1.2" strokeWidth={2} />
                  </svg>
                  Vòng quay may mắn −{formatCurrency(discount)}
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => copyToClipboard(payment.bankAccount, 'số tài khoản')}
              className="flex items-center justify-between gap-4 py-3.5 border-t border-border-color text-left group cursor-pointer"
            >
              <span className="text-sm text-muted shrink-0">Số tài khoản</span>
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono text-base font-semibold text-main truncate">{payment.bankAccount}</span>
                <span className="w-9 h-9 shrink-0 rounded-lg border border-border-color flex items-center justify-center text-muted group-hover:text-primary group-hover:border-primary/40 transition-colors">
                  <CopyIcon className="w-4 h-4" />
                </span>
              </span>
            </button>

            <div className="flex items-center justify-between gap-4 py-4 border-t border-border-color">
              <span className="text-sm text-muted">Ngân hàng</span>
              <span className="text-[15px] font-semibold text-main">{payment.bankName}</span>
            </div>

            <div className="flex items-center justify-between gap-4 py-4 border-y border-border-color">
              <span className="text-sm text-muted shrink-0">Chủ tài khoản</span>
              <span className="text-[15px] font-semibold text-main text-right truncate">{payment.accountName}</span>
            </div>
          </div>

          <div className="rounded-2xl p-5 border border-primary/35 bg-primary/6">
            <p className="text-xs font-bold tracking-[0.12em] uppercase text-primary m-0">Nội dung CK · bắt buộc</p>
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <code className="font-mono text-lg font-semibold text-main break-all">{payment.transferDescription}</code>
              <button
                type="button"
                onClick={() => copyToClipboard(payment.transferDescription, 'nội dung CK')}
                className="btn-primary btn-quiet h-11 px-4 py-0 text-sm shrink-0"
              >
                <CopyIcon className="w-4 h-4" />
                Sao chép
              </button>
            </div>
          </div>
        </div>

        {/* Perforated edge, then the code itself */}
        <div className="ticket-cutout relative p-7 sm:p-9 bg-bg-main border-t lg:border-t-0 lg:border-l-2 border-dashed border-border-color flex flex-col items-center justify-center gap-5">
          <p className="text-sm font-semibold text-muted flex items-center gap-2.5 m-0">
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="7" y="2.5" width="10" height="19" rx="2.5" strokeWidth={1.8} />
              <path strokeLinecap="round" strokeWidth={1.8} d="M11 18.5h2" />
            </svg>
            Quét mã bằng app Ngân hàng
          </p>

          <div className="relative bg-white p-5 rounded-3xl shadow-xl">
            {!imgLoaded && <div className="w-[260px] h-[260px] skeleton rounded-xl" />}
            <img
              src={payment.qrUrl}
              alt="Mã QR thanh toán"
              className={`w-[260px] h-[260px] rounded-xl object-contain ${imgLoaded ? 'block' : 'hidden'}`}
              onLoad={() => setImgLoaded(true)}
            />
            {imgLoaded && <span className="scanline" aria-hidden="true" />}
          </div>

          <p className="flex items-center gap-3 px-4 py-3 rounded-xl glass-card text-[13.5px] text-muted m-0">
            <span className="w-4 h-4 shrink-0 rounded-full border-2 border-border-color border-t-primary animate-spin" />
            Đang chờ giao dịch · tự xác nhận sau 3–5 giây
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-4 px-6 py-5 rounded-2xl border border-warn/30 bg-warn/8">
        <span className="w-10 h-10 shrink-0 rounded-full bg-warn/15 text-warn flex items-center justify-center">
          <svg className="w-[19px] h-[19px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M12 3l9.5 17h-19z" />
            <path strokeLinecap="round" strokeWidth={1.9} d="M12 10v4M12 17.5v.01" />
          </svg>
        </span>
        <div className="flex flex-col gap-1.5 text-[14.5px] leading-relaxed text-muted">
          <strong className="text-[15px] text-warn">Lưu ý quan trọng</strong>
          <span>
            Sau khi thanh toán xong, vui lòng <strong className="text-main">chờ 3–5 giây</strong> để thông báo thành công
            hiện lên trên màn hình này.
          </span>
          <span>
            Vui lòng <strong className="text-main">KHÔNG</strong> thay đổi nội dung chuyển khoản để hệ thống có thể ghi
            nhận tự động.
          </span>
        </div>
      </div>

      <PrizePopup
        open={Boolean(popup)}
        prize={popup && !popup.isLimitReached && !popup.isAmountTooHigh ? { label: popup.label } : null}
        discount={popup?.discount ?? 0}
        newAmount={popup?.newAmount ?? 0}
        isLimitReached={popup?.isLimitReached}
        isAmountTooHigh={popup?.isAmountTooHigh}
        onClose={() => setPopup(null)}
      />

      {showOdds && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowOdds(false)}>
          <div
            className="relative w-full max-w-[340px] max-h-[90vh] overflow-y-auto p-7 rounded-[28px] text-center animate-scale-up scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
            }}
          >
            <div className="mx-auto w-14 h-14 bg-primary/15 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl drop-shadow-sm">📊</span>
            </div>
            
            <h3 className="font-display font-extrabold text-[22px] text-main m-0 mb-6">
              Tỉ lệ trúng thưởng
            </h3>
            
            <div className="flex flex-col gap-3.5 text-left">
              {lucky?.prizes.map((p) => {
                const percent = p.eligible && p.odds > 0 ? (p.odds * 100).toFixed(1) : '0.0';
                return (
                  <div key={p.id} className={`flex flex-col pb-3.5 border-b border-border-light last:border-0 last:pb-0 ${!p.eligible ? 'opacity-40 grayscale' : ''}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[15.5px] font-semibold text-main">{p.label}</span>
                      <span className="text-[16px] font-black text-primary">{percent}%</span>
                    </div>
                    {p.id === 'half' && (
                      <span className="text-[12px] text-warn mt-1 font-medium">
                        * Chỉ xuất hiện nếu Bill ≤ 40.000đ
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <button type="button" onClick={() => setShowOdds(false)} className="btn-primary w-full h-11 mt-7 text-[15px]">
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
