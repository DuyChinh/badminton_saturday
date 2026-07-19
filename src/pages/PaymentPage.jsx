import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

const CopyIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const PaymentPage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imgLoaded, setImgLoaded] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [countdown, setCountdown] = useState(15);

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

  if (loading) {
    return (
      <div className="app-narrow py-2">
        <div className="glass-card p-6 text-center min-h-[360px] flex flex-col justify-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted animate-pulse text-sm">Đang tạo mã thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-narrow py-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-main transition-colors mb-3 font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </Link>
        <div className="glass-card p-8 text-center animate-fade-in">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-main mb-2">{error}</h2>
          <p className="text-muted mb-6 text-sm">Bạn không có khoản nợ nào cần thanh toán lúc này.</p>
          <Link to="/" className="btn-secondary text-sm py-2.5 px-4">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="app-narrow py-2">
        <div className="glass-card p-8 text-center animate-fade-in shadow-xl shadow-success/10 border-success/30">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-[pulseGlow_2s_ease-in-out_infinite]">
            <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-success mb-3">Thanh toán thành công!</h2>
          <p className="text-muted mb-8 leading-relaxed text-sm sm:text-base">Đã thanh toán thành công. Cảm ơn bạn, chúc bạn 1 ngày vui vẻ và đầy ý nghĩa.</p>
          <div className="space-y-4">
            <Link to="/" className="btn-primary w-full py-3">
              Về trang chủ ngay
            </Link>
            <p className="text-xs text-muted animate-pulse">Tự động chuyển về trang chủ sau {countdown} giây...</p>
          </div>
        </div>
      </div>
    );
  }

  const { member, payment } = data;

  return (
    <div className="w-full -mt-2 sm:-mt-4 animate-slide-up">
      {/* Back: trái toàn trang, không chiếm giữa cột */}
      <div className="mb-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-main transition-colors group"
        >
          <span className="w-7 h-7 rounded-lg bg-surface border border-border-color flex items-center justify-center group-hover:bg-surface-hover group-hover:border-primary/30 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </span>
          Quay lại
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 w-full flex flex-col md:flex-row gap-6 items-start justify-center">
        {/* Left: QR Card */}
        <div className="w-full max-w-sm glass-card overflow-hidden shadow-xl shadow-primary/5 hover:border-border-color shrink-0">
          {/* Header gọn */}
          <div className="bg-surface px-4 py-3.5 text-center border-b border-border-color">
            <p className="text-[11px] font-semibold text-primary uppercase tracking-widest mb-0.5">
              Hóa đơn thanh toán
            </p>
            <h2 className="text-xl font-bold text-main leading-tight">{member.name}</h2>
            <p className="text-muted font-mono text-xs mt-0.5">#{member.memberCode}</p>
          </div>

          {/* QR + số tiền */}
          <div className="ticket-cutout bg-bg-main px-4 py-4 text-center relative border-b border-dashed border-border-color">
            <p className="text-xs text-muted mb-0.5">Số tiền cần thanh toán</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-primary mb-3 tracking-tight">
              {formatCurrency(member.amountDue)}
            </p>
            {/* QR Wrapper */}
            <div className="relative inline-block mt-4">
              <div className="absolute inset-0 bg-primary rounded-[2rem] blur-xl opacity-20 animate-pulse-glow"></div>
              <div className="relative bg-white p-6 rounded-[2rem] shadow-xl">
                {!imgLoaded && (
                  <div className="w-[300px] h-[300px] skeleton rounded-xl" />
                )}
                <img
                  src={payment.qrUrl}
                  alt="QR Thanh toán"
                  className={`w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] rounded-xl object-contain ${imgLoaded ? 'block' : 'hidden'}`}
                  onLoad={() => setImgLoaded(true)}
                />
                
                {/* Scan indicator overlay */}
                {imgLoaded && (
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-primary/50 blur-[2px] shadow-[0_0_15px_rgba(16,185,129,0.8)] -translate-y-1/2 animate-[slideUp_3s_ease-in-out_infinite_alternate]" style={{animationName: 'scanline'}} />
                )}
              </div>
            </div>

            <p className="mt-3 text-xs font-medium text-muted flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Quét mã bằng app Ngân hàng
            </p>
          </div>

          {/* Chi tiết CK */}
          <div className="px-4 py-3.5 bg-surface space-y-3">
            <button
              type="button"
              onClick={() => copyToClipboard(payment.bankAccount, 'số tài khoản')}
              className="w-full flex justify-between items-center gap-3 text-left group"
            >
              <span className="text-xs text-muted shrink-0">Số tài khoản</span>
              <span className="flex items-center gap-2 min-w-0">
                <span className="font-mono font-bold text-sm text-main tracking-wide truncate">
                  {payment.bankAccount}
                </span>
                <CopyIcon className="w-3.5 h-3.5 text-muted group-hover:text-primary transition-colors shrink-0" />
              </span>
            </button>

            <div className="flex justify-between items-center gap-3">
              <span className="text-xs text-muted">Ngân hàng</span>
              <span className="font-semibold text-sm text-main">{payment.bankName}</span>
            </div>

            <div className="flex justify-between items-center gap-3">
              <span className="text-xs text-muted shrink-0">Chủ TK</span>
              <span className="font-semibold text-sm text-main text-right truncate">{payment.accountName}</span>
            </div>

            <div>
              <span className="text-xs text-muted block mb-1.5">Nội dung CK (bắt buộc)</span>
              <button
                type="button"
                onClick={() => copyToClipboard(payment.transferDescription, 'nội dung CK')}
                className="w-full bg-bg-main rounded-xl px-3 py-2.5 border border-border-color flex items-start gap-2.5 text-left hover:border-primary/40 transition-colors group"
              >
                <code className="text-primary font-mono text-xs break-all font-semibold flex-1 leading-relaxed">
                  {payment.transferDescription}
                </code>
                <span className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 shrink-0">
                  <CopyIcon className="w-3.5 h-3.5 text-primary" />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Notes Section */}
        <div className="w-full max-w-sm glass-card p-6 border-l-4 border-l-warning bg-warning/5 mt-0 md:mt-4">
          <h3 className="font-bold text-warning mb-4 flex items-center gap-2">
            <span>⚠️</span> Lưu ý quan trọng
          </h3>
          <ul className="space-y-4 text-sm text-muted">
            <li className="flex items-start gap-3">
              <span className="text-warning shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="leading-relaxed">
                Sau khi thanh toán xong, vui lòng <strong className="text-main">chờ 3-5s</strong> để thông báo thành công hiện lên trên màn hình này.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-warning shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </span>
              <span className="leading-relaxed">
                Vui lòng <strong className="text-danger">KHÔNG</strong> thay đổi nội dung chuyển khoản để hệ thống có thể ghi nhận tự động.
              </span>
            </li>
          </ul>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scanline {
            0% { top: 12%; }
            100% { top: 88%; }
          }
        `,
      }} />
    </div>
  );
};

export default PaymentPage;
