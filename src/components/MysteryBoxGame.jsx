import { useState, useEffect, useRef, useMemo } from 'react';

const SHAKE_DURATION_SEC = 10;

const BOX_THEMES = [
  { id: 0, name: 'Hộp Đỏ Ruby', color: 'from-rose-600 to-red-800', ribbon: 'bg-amber-400', glow: 'rgba(239,68,68,0.6)', tag: 'HỘP 1' },
  { id: 1, name: 'Hộp Vàng Kim', color: 'from-amber-500 to-yellow-700', ribbon: 'bg-emerald-400', glow: 'rgba(245,158,11,0.6)', tag: 'HỘP 2' },
  { id: 2, name: 'Hộp Lục Bảo', color: 'from-emerald-600 to-teal-800', ribbon: 'bg-amber-400', glow: 'rgba(16,185,129,0.6)', tag: 'HỘP 3' },
];

const MysteryBoxGame = ({
  prizes = [],
  spinning = false,
  spinId = 0,
  resultPrizeId = null,
  onSpinEnd,
  onPlay,
  disabled = false,
}) => {
  // Game phases: 'idle' | 'shaking' | 'locked' | 'revealed'
  const [phase, setPhase] = useState('idle');
  const [selectedIdx, setSelectedIdx] = useState(1);
  const [countdown, setCountdown] = useState(SHAKE_DURATION_SEC);
  const [isOpened, setIsOpened] = useState(false);
  const [othersOpened, setOthersOpened] = useState(false);

  const lastPlayedSpinId = useRef(0);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Sound setup
  useEffect(() => {
    audioRef.current = new Audio('/xoso.mp3');
    audioRef.current.loop = true;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timerRef.current) timerRef.current.clear?.();
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Triggered every time a new spinId is received
  useEffect(() => {
    if (spinId > 0 && spinId !== lastPlayedSpinId.current) {
      lastPlayedSpinId.current = spinId;
      startShakeSequence();
    }
  }, [spinId]);

  const startShakeSequence = () => {
    setPhase('shaking');
    setIsOpened(false);
    setOthersOpened(false);
    setCountdown(SHAKE_DURATION_SEC);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => console.log('Audio autoplay prevented:', e));
    }

    // Countdown interval 10 to 1
    let remaining = SHAKE_DURATION_SEC;
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(Math.max(0, remaining));
      if (remaining <= 0) {
        clearInterval(countdownIntervalRef.current);
      }
    }, 1000);

    // Timeline:
    // 0s - 8.8s: Intense shaking & vibration
    // 8.8s: Stop shake, pause audio, suspense silence & gold pulse
    const lockTimer = setTimeout(() => {
      setPhase('locked');
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }, 8800);

    // 10.0s: EXACTLY 10s - LID FLIES OPEN!
    const openTimer = setTimeout(() => {
      setPhase('revealed');
      setIsOpened(true);
    }, 10000);

    // 11.2s: Open remaining boxes
    const othersTimer = setTimeout(() => {
      setOthersOpened(true);
    }, 11200);

    // 12.2s: Call end callback to open modal
    const endTimer = setTimeout(() => {
      onSpinEnd?.();
    }, 12200);

    timerRef.current = {
      clear: () => {
        clearTimeout(lockTimer);
        clearTimeout(openTimer);
        clearTimeout(othersTimer);
        clearTimeout(endTimer);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      },
    };
  };

  const handleBoxClick = (idx) => {
    if (spinning || phase !== 'idle' || disabled) return;
    setSelectedIdx(idx);
    if (onPlay) {
      onPlay(idx);
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

  const isShaking = phase === 'shaking';
  const isLocked = phase === 'locked';

  return (
    <div className="w-full max-w-[390px] shrink-0 flex flex-col items-center select-none py-1">
      <style>{`
        /* Intense anticipation shake for 10 seconds */
        @keyframes boxIntenseRumble {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1.04); }
          15% { transform: translate(-3px, 2px) rotate(-6deg) scale(1.06); }
          30% { transform: translate(3px, -2px) rotate(6deg) scale(1.06); }
          45% { transform: translate(-2px, -3px) rotate(-4deg) scale(1.06); }
          60% { transform: translate(2px, 3px) rotate(5deg) scale(1.06); }
          75% { transform: translate(-3px, 1px) rotate(-5deg) scale(1.06); }
          90% { transform: translate(3px, -1px) rotate(4deg) scale(1.06); }
        }

        @keyframes boxGentleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .box-floating {
          animation: boxGentleFloat 3s ease-in-out infinite;
        }

        .box-rumbling {
          animation: boxIntenseRumble 0.28s ease-in-out infinite !important;
        }

        .lid-opened {
          transform: translateY(-42px) rotate(-22deg) scale(0.95);
          opacity: 0.9;
        }
        .lid-teased {
          transform: translateY(-22px) rotate(-10deg) scale(0.95);
          opacity: 0.75;
        }

        .prize-burst {
          transform: translateY(-68px) scale(1.15);
          opacity: 1;
        }
        .prize-teased-burst {
          transform: translateY(-45px) scale(0.9);
          opacity: 0.85;
        }
      `}</style>

      {/* 3 GIFT BOXES CONTAINER */}
      <div className="relative w-full h-[185px] sm:h-[195px] flex items-center justify-center pt-8">
        <div className="flex items-center justify-center gap-3 sm:gap-4.5 w-full">
          {BOX_THEMES.map((box, idx) => {
            const isSelected = selectedIdx === idx;
            const boxOpened = isSelected ? isOpened : othersOpened;
            const displayPrize = isSelected
              ? wonPrize
              : idx === 0
              ? teasedPrizes[0]
              : teasedPrizes[1];
            const isWinner = displayPrize && displayPrize.kind !== 'none';

            return (
              <div
                key={box.id}
                onClick={() => handleBoxClick(idx)}
                style={{
                  width: '104px',
                  height: '115px',
                  minWidth: '104px',
                  flexShrink: 0,
                }}
                className={`relative flex flex-col items-center select-none transition-all duration-300 ${
                  phase === 'idle' && !disabled
                    ? 'cursor-pointer hover:scale-108 hover:-translate-y-2'
                    : ''
                } ${
                  isLocked && isSelected
                    ? '-translate-y-3 scale-110 z-20'
                    : isLocked && !isSelected
                    ? 'opacity-40 scale-95'
                    : ''
                } ${
                  phase === 'revealed' && !isSelected ? 'opacity-70' : ''
                }`}
              >
                {/* Prize Burst Out Animation */}
                <div
                  className={`absolute z-30 transition-all duration-700 ease-out pointer-events-none flex flex-col items-center justify-center opacity-0 ${
                    boxOpened
                      ? isSelected
                        ? 'prize-burst'
                        : 'prize-teased-burst'
                      : 'translate-y-0'
                  }`}
                >
                  {isWinner ? (
                    <div className="relative flex flex-col items-center">
                      <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 border-2 border-white flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.9)] animate-bounce">
                        <img
                          src="/bad_icon01.png"
                          alt="Prize"
                          className="w-8 h-8 object-contain drop-shadow"
                        />
                      </div>
                      <span className="mt-1 px-2.5 py-0.5 rounded-full bg-black/85 border border-amber-400 text-amber-300 font-black text-[13px] whitespace-nowrap shadow-xl">
                        {displayPrize?.label}
                      </span>
                      <span className="text-[8px] font-black uppercase text-emerald-400 tracking-wider mt-0.5 bg-black/60 px-1.5 rounded">
                        TRÚNG GIẢI!
                      </span>
                    </div>
                  ) : (
                    <div className="relative flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-red-500/50 flex items-center justify-center shadow-lg">
                        <span className="text-2xl leading-none">😭</span>
                      </div>
                      <span className="mt-1 px-2 py-0.5 rounded-full bg-black/85 border border-red-500/40 text-red-300 font-bold text-[11px] whitespace-nowrap">
                        Hộp rỗng!
                      </span>
                      <span className="text-[8px] text-muted font-medium mt-0.5">
                        Lần sau nhé
                      </span>
                    </div>
                  )}
                </div>

                {/* 3D GIFT BOX BODY & LID */}
                <div
                  className={`relative w-[96px] sm:w-[104px] h-[92px] sm:h-[98px] flex items-center justify-center ${
                    phase === 'idle' && !boxOpened ? 'box-floating' : ''
                  } ${isShaking && (isSelected || true) ? 'box-rumbling' : ''}`}
                  style={{
                    filter:
                      isSelected && (isShaking || isLocked)
                        ? `drop-shadow(0 0 20px ${box.glow})`
                        : isSelected
                        ? `drop-shadow(0 0 14px ${box.glow})`
                        : 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
                  }}
                >
                  {/* LID (Nắp hộp) */}
                  <div
                    className={`absolute top-0 z-20 w-[100px] sm:w-[108px] h-6 sm:h-7 rounded-t-xl bg-gradient-to-r ${box.color} border-t-2 border-l-2 border-r-2 border-white/30 shadow-md transition-all duration-700 ease-out flex items-center justify-center ${
                      boxOpened
                        ? isSelected
                          ? 'lid-opened'
                          : 'lid-teased'
                        : ''
                    }`}
                  >
                    {/* Ribbon */}
                    <div className={`w-3.5 h-full ${box.ribbon} shadow-sm`} />
                    {/* Bow */}
                    <div className="absolute -top-3 w-8 h-4 flex justify-center items-center pointer-events-none">
                      <span className="text-[17px] leading-none drop-shadow">🎀</span>
                    </div>
                  </div>

                  {/* BODY (Thân hộp) */}
                  <div
                    className={`absolute bottom-0 z-10 w-[94px] sm:w-[102px] h-[72px] sm:h-[78px] rounded-b-2xl bg-gradient-to-b ${box.color} border-2 border-white/20 shadow-2xl flex items-center justify-center overflow-hidden`}
                  >
                    {/* Vertical Ribbon */}
                    <div className={`w-3.5 h-full ${box.ribbon} shadow-sm`} />
                    {/* Horizontal Ribbon */}
                    <div className={`absolute w-full h-3.5 ${box.ribbon} shadow-sm`} />

                    {/* Golden emblem in center */}
                    <div className="absolute z-20 w-6 h-6 rounded-full bg-slate-900/90 border border-amber-300/80 flex items-center justify-center shadow-inner">
                      <span className="text-[10px]">✨</span>
                    </div>
                  </div>
                </div>

                {/* Box labels */}
                <div className="mt-2.5 text-center w-full">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold block truncate border ${
                      isSelected && (isShaking || isLocked)
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-md animate-pulse'
                        : 'bg-surface/90 border-border-color text-main'
                    }`}
                  >
                    {isShaking && isSelected
                      ? '⚡ ĐANG RUNG'
                      : isLocked && isSelected
                      ? '✨ ĐÃ CHỌN'
                      : box.name}
                  </span>
                  <p className="text-[9.5px] text-muted m-0 mt-0.5 uppercase tracking-wider">
                    {box.tag}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* COUNTDOWN & SUSPENSE BAR                                     */}
      {/* ============================================================ */}
      {isShaking || isLocked ? (
        <div className="w-full mt-3 px-3 flex flex-col items-center animate-slide-up">
          <div className="flex items-center justify-between w-full text-xs font-bold text-main mb-1.5">
            <span className="flex items-center gap-1.5 text-primary">
              <span className="animate-spin text-sm">🌀</span>
              {isLocked ? 'Đang bật tung nắp...' : 'Đang rung chuyển hộp quà...'}
            </span>
            <span className="font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30 text-[11px]">
              {countdown > 0 ? `${countdown}s` : 'Mở hộp!'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-surface border border-border-color overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-300 ease-linear"
              style={{
                width: `${Math.min(100, Math.max(0, ((SHAKE_DURATION_SEC - countdown) / SHAKE_DURATION_SEC) * 100))}%`,
              }}
            />
          </div>

          <p className="text-[11.5px] text-muted mt-1.5 m-0 text-center animate-pulse">
            {countdown > 7
              ? '🎁 Hộp quà đang rung lên dữ dội…'
              : countdown > 4
              ? '⚡ Năng lượng may mắn sắp giải phóng…'
              : countdown > 1
              ? '✨ Nắp hộp sắp bật tung sau 2s… 1s…'
              : '🎉 BÙM! MỞ HỘP NGAY BÂY GIỜ!'}
          </p>
        </div>
      ) : (
        <p className="text-[12px] text-muted text-center mt-2.5 m-0">
          {phase === 'revealed'
            ? 'Hộp quà đã mở, chúc bạn may mắn!'
            : 'Chạm trực tiếp vào 1 hộp quà bất kỳ để mở 🎁'}
        </p>
      )}
    </div>
  );
};

export default MysteryBoxGame;
