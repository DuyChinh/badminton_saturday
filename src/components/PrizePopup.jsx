import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { formatCurrency } from '../utils/formatters';

const COLORS = ['#34D399', '#5EEAD4', '#A78BFA', '#F9A8D4', '#FFB45E', '#E8C14A', '#FFFFFF'];

/**
 * Centre-of-screen result card shown when the wheel stops.
 * A win gets the club medal, a burst of confetti and light rays; a miss gets a
 * quiet card with no fanfare, so "better luck next time" does not feel like a prize.
 */
const PrizePopup = ({ open, prize, discount, newAmount, isLimitReached, isAmountTooHigh, onClose }) => {
  const won = discount > 0;

  const pieces = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        id: i,
        left: `${Math.round(Math.random() * 100)}%`,
        width: [7, 9, 12][i % 3],
        height: [12, 8, 16][i % 3],
        background: COLORS[i % COLORS.length],
        borderRadius: i % 3 === 0 ? '50%' : '2px',
        animationDelay: `${(Math.random() * 1.4).toFixed(2)}s`,
        animationDuration: `${(Math.random() * 1.8 + 2.4).toFixed(2)}s`,
      })),
    [open] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const rainDrops = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: `rain-${i}`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 1.5}s`,
        animationDuration: `${0.6 + Math.random() * 0.4}s`,
      })),
    [open]
  );

  // Esc closes it; focus lands on the primary button so Enter dismisses too
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock body scroll when popup is open so user doesn't accidentally scroll background
  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Phát nhạc kết quả
  useEffect(() => {
    if (!open) return undefined;
    
    let sound;
    if (isLimitReached || isAmountTooHigh) {
      sound = new Audio('/sad.mp3'); // can reuse sad sound or just none
    } else if (won) {
      const isHappy01 = Math.random() > 0.5;
      sound = new Audio(isHappy01 ? '/happy01.mp3' : '/happy02.mp3');
    } else {
      sound = new Audio('/sad.mp3');
    }
    
    sound.play().catch(e => console.log('Không thể phát nhạc kết quả:', e));

    return () => {
      sound.pause();
    };
  }, [open, won]);

  if (!open || (!prize && !isLimitReached && !isAmountTooHigh)) return null;

  if (isAmountTooHigh) {
    return createPortal(
      <div className="modal-overlay p-4 z-[100]" onClick={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          className="prize-card relative w-full max-w-[400px] rounded-[28px] overflow-hidden text-center"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
            zIndex: 70,
          }}
        >
          <div className="relative px-7 pt-9 pb-7">
            <div className="mx-auto w-24 h-24 flex items-center justify-center">
              <span className="text-[72px] leading-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
                🤑
              </span>
            </div>

            <p className="mt-5 text-xs font-bold tracking-[0.18em] uppercase text-warn m-0">
              Đại gia xuất hiện
            </p>

            <h2 className="font-display mt-2 text-[32px] font-extrabold text-main m-0 leading-tight">
              Bill khủng quá má!
            </h2>

            <p className="mt-3 text-sm text-muted leading-relaxed m-0 px-2">
              Hoá đơn trên 150 cành thì chịu khó thanh toán đủ nha, quỹ CLB khô máu rồi, không có tiền cho đại gia quay thưởng đâu! 🤪💸
            </p>

            <button type="button" autoFocus onClick={onClose} className="btn-primary w-full h-12 mt-6 text-[15px]">
              Vâng, tôi biết rồi
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  if (isLimitReached) {
    return createPortal(
      <div className="modal-overlay p-4 z-[100]" onClick={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          className="prize-card relative w-full max-w-[400px] rounded-[28px] overflow-hidden text-center"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
            zIndex: 70,
          }}
        >
          <div className="relative px-7 pt-9 pb-7">
            <div className="mx-auto w-24 h-24 flex items-center justify-center">
              <span className="text-[72px] leading-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
                🛑
              </span>
            </div>

            <p className="mt-5 text-xs font-bold tracking-[0.18em] uppercase text-warn m-0">
              Cảnh báo tham lam
            </p>

            <h2 className="font-display mt-2 text-[32px] font-extrabold text-main m-0 leading-tight">
              Quá giới hạn rồi!
            </h2>

            <p className="mt-3 text-sm text-muted leading-relaxed m-0 px-2">
              Mỗi tuần chỉ được thử nhân phẩm tối đa 2 lần thôi má ơi! Dành cơ hội cho người khác với, tham thì thâm đó nha 🤪
            </p>

            <button type="button" autoFocus onClick={onClose} className="btn-primary w-full h-12 mt-6 text-[15px]">
              Đã hiểu & Không dám tham nữa
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="modal-overlay p-4 z-[100]" onClick={onClose}>
      <style>{`
        @keyframes rainFall {
          0% { transform: translateY(-50px) scaleY(1); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(100vh) scaleY(2); opacity: 0; }
        }
        .rain-drop {
          position: absolute;
          top: -50px;
          width: 2px;
          height: 60px;
          background: linear-gradient(to bottom, transparent, rgba(160, 174, 192, 0.6));
          animation: rainFall linear infinite;
        }
      `}</style>
      
      {won && (
        <div className="confetti-layer fixed" aria-hidden="true" style={{ zIndex: 110 }}>
          {pieces.map(({ id, ...style }) => (
            <span key={id} style={{ ...style, top: '-24px' }} className="confetti-fall" />
          ))}
        </div>
      )}

      {!won && (
        <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={{ zIndex: 60 }}>
          {rainDrops.map(({ id, ...style }) => (
            <div key={id} className="rain-drop" style={style} />
          ))}
        </div>
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prize-title"
        className="prize-card relative w-full max-w-[400px] rounded-[28px] overflow-hidden text-center"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: won
            ? 'radial-gradient(120% 90% at 50% 0%, rgba(52,211,153,0.28), transparent 60%), var(--bg-card)'
            : 'var(--bg-card)',
          border: `1px solid ${won ? 'color-mix(in srgb, var(--primary-light) 55%, transparent)' : 'var(--border-color)'}`,
          boxShadow: won
            ? '0 40px 100px -20px rgba(16,185,129,0.55), 0 0 0 1px rgba(255,255,255,0.04)'
            : '0 30px 80px rgba(0,0,0,0.5)',
          zIndex: 70,
        }}
      >
        {won && <span className="prize-rays" aria-hidden="true" />}

        <div className="relative px-7 pt-9 pb-7">
          {won ? (
            <img
              src="/bad_icon01.png"
              alt=""
              className="prize-medal w-32 h-32 mx-auto object-contain"
              style={{ filter: 'drop-shadow(0 14px 30px rgba(232,193,74,0.55))' }}
            />
          ) : (
            <div className="mx-auto w-24 h-24 flex items-center justify-center">
              <span className="text-[72px] leading-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
                😭
              </span>
            </div>
          )}

          <p className="mt-5 text-xs font-bold tracking-[0.18em] uppercase m-0" style={{ color: won ? 'var(--gold)' : 'var(--text-muted)' }}>
            {won ? 'Chúc mừng bạn đã trúng' : 'Úi chà chà'}
          </p>

          <h2 id="prize-title" className="font-display mt-2 text-[44px] font-extrabold m-0">
            {won ? <span className="grad-text">{prize.label}</span> : <span className="text-main text-[28px]">Nhân phẩm có hạn!</span>}
          </h2>

          {won ? (
            <div className="mt-5 rounded-2xl border border-border-color bg-black/25 px-5 py-4">
              <p className="text-[13px] text-muted m-0">Đã trừ trực tiếp vào hóa đơn</p>
              <p className="mt-1 text-[15px] font-semibold text-main m-0">
                Còn phải thanh toán{' '}
                <span className="font-display text-[22px] font-extrabold text-primary-light">{formatCurrency(newAmount)}</span>
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted leading-relaxed m-0 px-2">
              Bàn tay xui xẻo này lại bốc trượt rồi! Đen thôi đỏ quên đi nha 🤣, mời bạn thanh toán đủ bill nhé!
            </p>
          )}

          <button type="button" autoFocus onClick={onClose} className="btn-primary w-full h-12 mt-6 text-[15px]">
            {won ? 'Tuyệt vời, tiếp tục thanh toán' : 'Đã hiểu'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PrizePopup;
