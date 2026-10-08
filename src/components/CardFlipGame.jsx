import { useState, useEffect, useRef, useMemo } from 'react';
import { formatCurrency } from '../utils/formatters';

const FLIP_DURATION_MS = 3200;

const CARD_THEMES = [
  { id: 0, title: 'Thần May Mắn', rune: '🪶', icon: '/bad_icon01.png', accent: 'from-amber-500/20 to-emerald-500/20' },
  { id: 1, title: 'Thần Tốc Độ', rune: '⚡', icon: '/bad_icon02.png', accent: 'from-cyan-500/20 to-blue-500/20' },
  { id: 2, title: 'Thần Cầu Lông', rune: '🏸', icon: '/bad_icon03.png', accent: 'from-purple-500/20 to-pink-500/20' },
];

const CardFlipGame = ({
  prizes = [],
  spinning = false,
  resultPrizeId = null,
  onSpinEnd,
  onPlay,
  disabled = false,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [othersFlipped, setOthersFlipped] = useState(false);
  const played = useRef(null);
  const audioRef = useRef(null);

  // Setup sound
  useEffect(() => {
    audioRef.current = new Audio('/xoso.mp3');
    audioRef.current.loop = true;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // When spinning starts or stops
  useEffect(() => {
    if (audioRef.current) {
      if (spinning) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((e) => console.log('Audio autoplay prevented:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [spinning]);

  // When result is received from server
  useEffect(() => {
    if (spinning && resultPrizeId && played.current !== resultPrizeId) {
      played.current = resultPrizeId;
      // If user hasn't selected a specific card, default to middle
      if (selectedIdx === null) {
        setSelectedIdx(1);
      }

      // Flip the chosen card
      const flipTimer = setTimeout(() => {
        setIsFlipped(true);
      }, 400);

      // Flip remaining cards for suspense
      const othersTimer = setTimeout(() => {
        setOthersFlipped(true);
      }, 1600);

      // Finish game
      const endTimer = setTimeout(() => {
        if (audioRef.current) audioRef.current.pause();
        onSpinEnd?.();
      }, FLIP_DURATION_MS);

      return () => {
        clearTimeout(flipTimer);
        clearTimeout(othersTimer);
        clearTimeout(endTimer);
      };
    }
    if (!spinning) {
      played.current = null;
    }
  }, [spinning, resultPrizeId, selectedIdx, onSpinEnd]);

  // Handle card click
  const handleCardClick = (idx) => {
    if (spinning || disabled) return;
    setSelectedIdx(idx);
    if (onPlay) {
      onPlay();
    }
  };

  // Find won prize object
  const wonPrize = useMemo(() => {
    return prizes.find((p) => p.id === resultPrizeId) || null;
  }, [prizes, resultPrizeId]);

  // Generate tease prizes for other 2 cards
  const teasedPrizes = useMemo(() => {
    if (!prizes || prizes.length === 0) return [null, null, null];
    const available = prizes.filter((p) => p.id !== resultPrizeId);
    return [
      available[0] || prizes[0],
      available[1] || prizes[1] || prizes[0],
    ];
  }, [prizes, resultPrizeId]);

  return (
    <div className="w-full max-w-[340px] flex flex-col items-center">
      <style>{`
        .card-perspective {
          perspective: 1000px;
        }
        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-style: preserve-3d;
        }
        .card-flipped {
          transform: rotateY(180deg);
        }
        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 16px;
        }
        .card-front {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Cards Row */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 w-full py-2">
        {CARD_THEMES.map((theme, idx) => {
          const isSelected = selectedIdx === idx;
          const cardFlipped = isSelected ? isFlipped : othersFlipped;
          const displayPrize = isSelected ? wonPrize : (idx === 0 ? teasedPrizes[0] : teasedPrizes[1]);
          const isWinner = displayPrize && displayPrize.kind !== 'none';

          return (
            <div
              key={theme.id}
              onClick={() => handleCardClick(idx)}
              className={`card-perspective h-[150px] sm:h-[175px] select-none ${
                !spinning && !disabled ? 'cursor-pointer hover:-translate-y-2' : ''
              } transition-transform duration-300`}
            >
              <div
                className={`card-inner ${cardFlipped ? 'card-flipped' : ''} ${
                  isSelected && spinning && !isFlipped ? 'animate-pulse scale-105' : ''
                }`}
              >
                {/* BACK OF CARD (Hidden face before flip) */}
                <div
                  className={`card-face flex flex-col items-center justify-between p-2.5 sm:p-3 bg-gradient-to-b from-[#13221c] via-[#0d1612] to-[#070d0a] border-2 ${
                    isSelected ? 'border-primary shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'border-emerald-600/30'
                  } shadow-xl text-center overflow-hidden`}
                >
                  <div className="w-full flex justify-between items-center text-[10px] text-primary/60 font-mono">
                    <span>{theme.rune}</span>
                    <span className="text-[9px] uppercase tracking-wider">LÁ {idx + 1}</span>
                    <span>{theme.rune}</span>
                  </div>

                  <div className="my-auto flex flex-col items-center justify-center">
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-primary/30 flex items-center justify-center bg-primary/10 shadow-inner group-hover:scale-110 transition-transform">
                      <img
                        src="/bad_icon01.png"
                        alt="Badminton"
                        className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-[0_2px_8px_rgba(16,185,129,0.5)]"
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] sm:text-[12px] font-bold text-main/90 m-0">
                      {theme.title}
                    </p>
                  </div>

                  <div className="w-full py-1 rounded-md bg-white/5 border border-white/5">
                    <p className="text-[9px] sm:text-[10px] font-semibold text-emerald-400 m-0 uppercase tracking-wider">
                      {isSelected && spinning ? 'Đang mở…' : 'Chạm để lật'}
                    </p>
                  </div>
                </div>

                {/* FRONT OF CARD (Revealed result) */}
                <div
                  className={`card-face card-front flex flex-col items-center justify-between p-2.5 sm:p-3 text-center overflow-hidden border-2 ${
                    isWinner
                      ? 'bg-gradient-to-b from-[#1c2e22] via-[#0f2317] to-[#07130c] border-primary shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                      : 'bg-gradient-to-b from-[#211818] via-[#161010] to-[#0d0909] border-red-500/30'
                  } ${!isSelected ? 'opacity-75' : ''}`}
                >
                  <div className="w-full flex justify-between items-center text-[10px] font-mono">
                    <span className={isWinner ? 'text-primary' : 'text-red-400'}>
                      {isWinner ? '★' : '✕'}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-muted">
                      {isSelected ? 'BẠN ĐÃ CHỌN' : 'THẺ BÍ ẨN'}
                    </span>
                    <span className={isWinner ? 'text-primary' : 'text-red-400'}>
                      {isWinner ? '★' : '✕'}
                    </span>
                  </div>

                  <div className="my-auto flex flex-col items-center justify-center">
                    {isWinner ? (
                      <>
                        <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center shadow-lg shadow-primary/30 animate-bounce">
                          <img
                            src="/bad_icon01.png"
                            alt="Prize"
                            className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                          />
                        </div>
                        <p className="mt-1 text-[13px] sm:text-[15px] font-black text-primary-light m-0 leading-tight">
                          {displayPrize?.label}
                        </p>
                        <span className="text-[9px] text-emerald-400/80 font-semibold uppercase">
                          Trúng giải!
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                          <span className="text-2xl leading-none">😭</span>
                        </div>
                        <p className="mt-1 text-[11px] sm:text-[12px] font-bold text-red-300 m-0 leading-tight">
                          Trượt rồi!
                        </p>
                        <span className="text-[9px] text-muted font-medium">
                          Hẹn lần sau
                        </span>
                      </>
                    )}
                  </div>

                  <div className="w-full">
                    <p className={`text-[9px] font-bold uppercase tracking-wider m-0 ${isWinner ? 'text-primary' : 'text-red-400'}`}>
                      {isWinner ? '🎉 MAY MẮN' : '😢 TIẾC QUÁ'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[12px] text-muted text-center mt-2 m-0">
        {!isFlipped
          ? 'Chạm vào 1 lá bài bất kỳ để kiểm tra nhân phẩm tuần này 🃏'
          : 'Lá bài định mệnh đã được hé lộ!'}
      </p>
    </div>
  );
};

export default CardFlipGame;
