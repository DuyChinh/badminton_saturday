import { useState, useEffect, useRef, useMemo } from 'react';

const BOX_DURATION_MS = 3200;

const BOX_THEMES = [
  { id: 0, name: 'Hộp Đỏ Ruby', color: 'from-rose-600 to-red-800', ribbon: 'bg-amber-400', glow: 'rgba(239,68,68,0.5)', tag: 'HỘP 1' },
  { id: 1, name: 'Hộp Vàng Kim', color: 'from-amber-500 to-yellow-700', ribbon: 'bg-emerald-400', glow: 'rgba(245,158,11,0.5)', tag: 'HỘP 2' },
  { id: 2, name: 'Hộp Lục Bảo', color: 'from-emerald-600 to-teal-800', ribbon: 'bg-amber-400', glow: 'rgba(16,185,129,0.5)', tag: 'HỘP 3' },
];

const MysteryBoxGame = ({
  prizes = [],
  spinning = false,
  resultPrizeId = null,
  onSpinEnd,
  onPlay,
  disabled = false,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isOpened, setIsOpened] = useState(false);
  const [othersOpened, setOthersOpened] = useState(false);
  const played = useRef(null);
  const audioRef = useRef(null);

  // Sound setup
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

  // Handle server draw result
  useEffect(() => {
    if (spinning && resultPrizeId && played.current !== resultPrizeId) {
      played.current = resultPrizeId;
      if (selectedIdx === null) {
        setSelectedIdx(1);
      }

      // Open selected box
      const openTimer = setTimeout(() => {
        setIsOpened(true);
      }, 700);

      // Open others
      const othersTimer = setTimeout(() => {
        setOthersOpened(true);
      }, 1800);

      // Finish game
      const endTimer = setTimeout(() => {
        if (audioRef.current) audioRef.current.pause();
        onSpinEnd?.();
      }, BOX_DURATION_MS);

      return () => {
        clearTimeout(openTimer);
        clearTimeout(othersTimer);
        clearTimeout(endTimer);
      };
    }
    if (!spinning) {
      played.current = null;
    }
  }, [spinning, resultPrizeId, selectedIdx, onSpinEnd]);

  const handleBoxClick = (idx) => {
    if (spinning || disabled) return;
    setSelectedIdx(idx);
    if (onPlay) {
      onPlay();
    }
  };

  const wonPrize = useMemo(() => {
    return prizes.find((p) => p.id === resultPrizeId) || null;
  }, [prizes, resultPrizeId]);

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
        @keyframes boxShake {
          0%, 100% { transform: rotate(0deg) scale(1.05); }
          20% { transform: rotate(-8deg) scale(1.08); }
          40% { transform: rotate(8deg) scale(1.08); }
          60% { transform: rotate(-6deg) scale(1.08); }
          80% { transform: rotate(6deg) scale(1.08); }
        }
        @keyframes floatGentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .box-floating {
          animation: floatGentle 3s ease-in-out infinite;
        }
        .box-shaking {
          animation: boxShake 0.4s ease-in-out infinite !important;
        }
        .lid-opened {
          transform: translateY(-38px) rotate(-22deg) scale(0.95);
          opacity: 0.85;
        }
        .lid-teased {
          transform: translateY(-20px) rotate(-10deg) scale(0.95);
          opacity: 0.65;
        }
        .prize-popped {
          transform: translateY(-62px) scale(1.1);
          opacity: 1;
        }
        .prize-teased {
          transform: translateY(-40px) scale(0.9);
          opacity: 0.8;
        }
      `}</style>

      {/* 3 Gift Boxes */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full pt-16 pb-4">
        {BOX_THEMES.map((box, idx) => {
          const isSelected = selectedIdx === idx;
          const boxOpened = isSelected ? isOpened : othersOpened;
          const isShaking = isSelected && spinning && !isOpened;
          const displayPrize = isSelected ? wonPrize : (idx === 0 ? teasedPrizes[0] : teasedPrizes[1]);
          const isWinner = displayPrize && displayPrize.kind !== 'none';

          return (
            <div
              key={box.id}
              onClick={() => handleBoxClick(idx)}
              className={`relative flex flex-col items-center select-none ${
                !spinning && !disabled ? 'cursor-pointer hover:scale-105' : ''
              } transition-transform duration-300 ${
                !isSelected && isOpened ? 'opacity-70' : ''
              }`}
            >
              {/* Prize Pop-out Animation */}
              <div
                className={`absolute z-30 transition-all duration-700 ease-out pointer-events-none flex flex-col items-center justify-center opacity-0 ${
                  boxOpened
                    ? isSelected
                      ? 'prize-popped'
                      : 'prize-teased'
                    : 'translate-y-0'
                }`}
              >
                {isWinner ? (
                  <div className="relative flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 border-2 border-white flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.8)] animate-bounce">
                      <img
                        src="/bad_icon01.png"
                        alt="Prize"
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded-full bg-black/80 border border-primary/50 text-primary-light font-black text-[12px] whitespace-nowrap shadow-lg">
                      {displayPrize?.label}
                    </span>
                  </div>
                ) : (
                  <div className="relative flex flex-col items-center">
                    <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center shadow-lg">
                      <span className="text-xl">😭</span>
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded-full bg-black/80 border border-red-500/40 text-red-300 font-bold text-[10px] whitespace-nowrap">
                      Hộp rỗng!
                    </span>
                  </div>
                )}
              </div>

              {/* 3D GIFT BOX CONTAINER */}
              <div
                className={`relative w-20 sm:w-24 h-20 sm:h-24 flex items-center justify-center ${
                  !spinning && !boxOpened ? 'box-floating' : ''
                } ${isShaking ? 'box-shaking' : ''}`}
                style={{
                  filter: isSelected
                    ? `drop-shadow(0 0 16px ${box.glow})`
                    : 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
                }}
              >
                {/* BOX LID (Nắp hộp) */}
                <div
                  className={`absolute top-0 z-20 w-[84px] sm:w-[98px] h-6 sm:h-7 rounded-t-lg bg-gradient-to-r ${box.color} border-t-2 border-l-2 border-r-2 border-white/30 shadow-md transition-all duration-700 ease-out flex items-center justify-center ${
                    boxOpened
                      ? isSelected
                        ? 'lid-opened'
                        : 'lid-teased'
                      : ''
                  }`}
                >
                  {/* Ribbon on lid */}
                  <div className={`w-3.5 h-full ${box.ribbon} shadow-sm`} />
                  {/* Ribbon bow on top */}
                  <div className="absolute -top-3 w-7 h-4 flex justify-center items-center pointer-events-none">
                    <span className="text-[16px] leading-none drop-shadow-sm">🎀</span>
                  </div>
                </div>

                {/* BOX BODY (Thân hộp) */}
                <div
                  className={`absolute bottom-0 z-10 w-20 sm:w-24 h-16 sm:h-19 rounded-b-xl bg-gradient-to-b ${box.color} border-2 border-white/20 shadow-2xl flex items-center justify-center overflow-hidden`}
                >
                  {/* Vertical ribbon */}
                  <div className={`w-3.5 h-full ${box.ribbon} shadow-sm`} />
                  {/* Horizontal ribbon */}
                  <div className={`absolute w-full h-3.5 ${box.ribbon} shadow-sm`} />

                  {/* Golden lock / logo in center */}
                  <div className="absolute z-20 w-6 h-6 rounded-full bg-slate-900/90 border border-amber-300/60 flex items-center justify-center shadow-inner">
                    <span className="text-[10px]">✨</span>
                  </div>
                </div>
              </div>

              {/* Label below box */}
              <div className="mt-3 text-center">
                <span className="px-2 py-0.5 rounded-full bg-surface/90 border border-border-color text-[11px] font-bold text-main">
                  {box.name}
                </span>
                <p className="text-[10px] text-muted m-0 mt-0.5 uppercase tracking-wider">
                  {isSelected && spinning ? 'Đang mở…' : box.tag}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[12px] text-muted text-center mt-1 m-0">
        {!isOpened
          ? 'Chạm vào 1 hộp quà bí mật để khám phá phần thưởng 🎁'
          : 'Hộp quà đã mở, chúc bạn may mắn!'}
      </p>
    </div>
  );
};

export default MysteryBoxGame;
