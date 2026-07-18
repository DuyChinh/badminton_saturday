import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { formatCurrency } from '../utils/formatters';

const PaymentPage = () => {
  const { memberId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    fetchQR();
  }, [memberId]);

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

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="glass-card p-8 text-center">
          <div className="skeleton w-64 h-64 mx-auto mb-4" />
          <div className="skeleton w-48 h-6 mx-auto mb-2" />
          <div className="skeleton w-32 h-4 mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="glass-card p-8 text-center animate-fade-in">
          <span className="text-6xl mb-4 block">✅</span>
          <h2 className="text-xl font-bold text-white mb-2">{error}</h2>
          <p className="text-gray-400 mb-6">Thành viên này không cần thanh toán</p>
          <Link to="/" className="btn-primary inline-block">
            ← Quay lại
          </Link>
        </div>
      </div>
    );
  }

  const { member, payment } = data;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="animate-slide-up">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary-light transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại danh sách
        </Link>

        {/* Payment Card */}
        <div className="glass-card p-6 sm:p-8 text-center">
          {/* Member Info */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/20">
              <span className="text-2xl font-bold text-white">{member.name.charAt(0)}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{member.name}</h2>
            <p className="text-gray-400 text-sm">#{member.memberCode}</p>
          </div>

          {/* Amount */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-5 mb-6">
            <p className="text-sm text-gray-400 mb-1">Số tiền cần thanh toán</p>
            <p className="text-4xl font-bold text-primary-light">{formatCurrency(member.amountDue)}</p>
          </div>

          {/* QR Code */}
          <div className="mb-6">
            <div className="qr-container inline-block">
              {!imgLoaded && (
                <div className="w-[280px] h-[280px] skeleton rounded-lg" />
              )}
              <img
                src={payment.qrUrl}
                alt="QR Thanh toán"
                className={`w-[280px] h-auto rounded-lg ${imgLoaded ? 'block' : 'hidden'}`}
                onLoad={() => setImgLoaded(true)}
              />
            </div>
          </div>

          {/* Bank Info */}
          <div className="space-y-3 text-left bg-dark/40 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Ngân hàng</span>
              <span className="font-semibold text-white">{payment.bankName}</span>
            </div>
            <div className="border-t border-dark-border" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Số tài khoản</span>
              <span className="font-mono text-white">{payment.bankAccount}</span>
            </div>
            <div className="border-t border-dark-border" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Chủ TK</span>
              <span className="font-semibold text-white">{payment.accountName}</span>
            </div>
            <div className="border-t border-dark-border" />
            <div>
              <span className="text-sm text-gray-400 block mb-1">Nội dung CK</span>
              <div className="bg-dark rounded-lg p-3 border border-primary/20">
                <code className="text-primary-light text-sm font-mono break-all">
                  {payment.transferDescription}
                </code>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-6 bg-accent/10 border border-accent/20 rounded-xl p-4">
            <p className="text-sm text-accent flex items-start gap-2">
              <span className="text-lg leading-none">⚠️</span>
              <span>Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống tự động xác nhận thanh toán.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
