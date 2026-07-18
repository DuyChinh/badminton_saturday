import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { formatCurrency } from '../utils/formatters';

const PublicView = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const unpaidMembers = members.filter((m) => m.paymentStatus === 'unpaid');
  const paidMembers = members.filter((m) => m.paymentStatus === 'paid');
  const totalDue = unpaidMembers.reduce((sum, m) => sum + m.amountDue, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          ⚡ Thanh toán sân cầu lông
        </h1>
        <p className="text-gray-400 text-lg">Thứ 7 hàng tuần • Chọn tên để thanh toán</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 animate-slide-up">
        <div className="glass-card p-5 text-center">
          <p className="text-3xl font-bold text-white">{members.length}</p>
          <p className="text-sm text-gray-400 mt-1">Thành viên</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-3xl font-bold text-danger">{unpaidMembers.length}</p>
          <p className="text-sm text-gray-400 mt-1">Chưa thanh toán</p>
        </div>
        <div className="glass-card p-5 text-center col-span-2 sm:col-span-1">
          <p className="text-2xl font-bold text-accent">{formatCurrency(totalDue)}</p>
          <p className="text-sm text-gray-400 mt-1">Tổng cần thu</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-20 w-full" />
          ))}
        </div>
      )}

      {/* Unpaid Members */}
      {!loading && unpaidMembers.length > 0 && (
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-danger rounded-full animate-pulse" />
            Chưa thanh toán ({unpaidMembers.length})
          </h2>
          <div className="space-y-3">
            {unpaidMembers.map((member, index) => (
              <Link
                key={member._id}
                to={`/payment/${member._id}`}
                className="glass-card p-5 flex items-center justify-between cursor-pointer group block"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-danger/20 to-danger/5 border border-danger/20 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-danger">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover:text-primary-light transition-colors">
                      {member.name}
                    </p>
                    <p className="text-sm text-gray-500">#{member.memberCode}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-bold text-danger text-lg">
                      {formatCurrency(member.amountDue)}
                    </p>
                    <span className="badge-unpaid text-xs">Chưa TT</span>
                  </div>
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <svg className="w-4 h-4 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Paid Members */}
      {!loading && paidMembers.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-success rounded-full" />
            Đã thanh toán ({paidMembers.length})
          </h2>
          <div className="space-y-3">
            {paidMembers.map((member) => (
              <div
                key={member._id}
                className="glass-card p-5 flex items-center justify-between opacity-70"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-success/20 to-success/5 border border-success/20 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-success">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{member.name}</p>
                    <p className="text-sm text-gray-500">#{member.memberCode}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="badge-paid">✓ Đã TT</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && members.length === 0 && (
        <div className="text-center py-20 glass-card animate-fade-in">
          <span className="text-6xl mb-4 block">🏸</span>
          <h3 className="text-xl font-semibold text-white mb-2">Chưa có thành viên</h3>
          <p className="text-gray-400">Admin vui lòng thêm thành viên vào hệ thống</p>
        </div>
      )}
    </div>
  );
};

export default PublicView;
