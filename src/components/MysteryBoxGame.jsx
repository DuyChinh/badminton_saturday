import { useState, useEffect, useRef, useMemo } from 'react';

const SHAKE_DURATION_SEC = 10;

const BOX_THEMES = [
  { id: 0, name: 'Hộp Đỏ Ruby', color: 'from-rose-600 to-red-800', ribbon: 'bg-amber-400', glow: 'rgba(239,68,68,0.6)', tag: 'HỘP 1', icon: '/bad_icon01.png' },
  { id: 1, name: 'Hộp Vàng Kim', color: 'from-amber-500 to-yellow-700', ribbon: 'bg-emerald-400', glow: 'rgba(245,158,11,0.6)', tag: 'HỘP 2', icon: '/bad_icon02.png' },
  { id: 2, name: 'Hộp Lục Bảo', color: 'from-emerald-600 to-teal-800', ribbon: 'bg-amber-400', glow: 'rgba(16,185,129,0.6)', tag: 'HỘP 3', icon: '/bad_icon03.png' },
  { id: 3, name: 'Hộp Lam Ngọc', color: 'from-sky-500 to-blue-700', ribbon: 'bg-amber-300', glow: 'rgba(56,189,248,0.6)', tag: 'HỘP 4', icon: '/bad_icon04.png' },
  { id: 4, name: 'Hộp Tím Mộng', color: 'from-purple-600 to-indigo-800', ribbon: 'bg-pink-400', glow: 'rgba(168,85,247,0.6)', tag: 'HỘP 5', icon: '/bad_icon05.png' },
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
  const [phase, setPhase] = useState(() => (resultPrizeId ? 'revealed' : 'idle'));
  const [selectedIdx, setSelectedIdx] = useState(2); // default to center box (box 3)
  const [countdown, setCountdown] = useState(SHAKE_DURATION_SEC);
  const [isOpened, setIsOpened] = useState(() => Boolean(resultPrizeId));
  const [othersOpened, setOthersOpened] = useState(() => Boolean(resultPrizeId));

  const savedPrizeIdRef = useRef(resultPrizeId);
  useEffect(() => {
    if (resultPrizeId) {
      savedPrizeIdRef.current = resultPrizeId;
      if (phase === 'idle' && !isOpened) {
        setPhase('revealed');
        setIsOpened(true);
        setOthersOpened(true);
      }
    }
  }, [resultPrizeId]);

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
    // 0s - 9.5s: Shaking & vibration on 5 boxes
    // 9.5s: Stop shake, pause audio, suspense silence & gold pulse on chosen box
    const lockTimer = setTimeout(() => {
      setPhase('locked');
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }, 9500);

    // 10.0s: EXACTLY 10s - LID FLIES OPEN!
    const openTimer = setTimeout(() => {
      setPhase('revealed');
      setIsOpened(true);
    }, 10000);

    // 11.2s: Open remaining 4 boxes
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

  const isBusy = spinning || phase === 'shaking' || phase === 'locked';

  const handleBoxClick = (idx) => {
    if (isBusy || disabled) return;
    setSelectedIdx(idx);
    setIsOpened(false);
    setOthersOpened(false);
    setPhase('idle');
    if (onPlay) {
      onPlay(idx);
    }
  };

  const effectivePrizeId = resultPrizeId || savedPrizeIdRef.current;
  const wonPrize = useMemo(() => {
    return prizes.find((p) => p.id === effectivePrizeId) || null;
  }, [prizes, effectivePrizeId]);

  // Tease prizes for the other 4 boxes
  const teasedPrizes = useMemo(() => {
    if (!prizes || prizes.length === 0) return [null, null, null, null, null];
    const available = prizes.filter((p) => p.id !== effectivePrizeId);
    return [
      available[0] || prizes[0],
      available[1] || prizes[1] || prizes[0],
      available[2] || prizes[2] || prizes[0],
      available[3] || prizes[3] || prizes[0],
    ];
  }, [prizes, effectivePrizeId]);

  const isShaking = phase === 'shaking';
  const isLocked = phase === 'locked';

  return (
    <div className="w-full max-w-[480px] shrink-0 flex flex-col items-center select-none py-1">
      <style>{`
        /* Intense anticipation shake for 10 seconds */
        @keyframes boxIntenseRumble {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1.03); }
          15% { transform: translate(-3px, 2px) rotate(-6deg) scale(1.05); }
          30% { transform: translate(3px, -2px) rotate(6deg) scale(1.05); }
          45% { transform: translate(-2px, -3px) rotate(-4deg) scale(1.05); }
          60% { transform: translate(2px, 3px) rotate(5deg) scale(1.05); }
          75% { transform: translate(-3px, 1px) rotate(-5deg) scale(1.05); }
          90% { transform: translate(3px, -1px) rotate(4deg) scale(1.05); }
        }

        @keyframes boxGentleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }

        .box-floating {
          animation: boxGentleFloat 3s ease-in-out infinite;
        }

        .box-rumbling {
          animation: boxIntenseRumble 0.28s ease-in-out infinite !important;
        }

        .lid-opened {
          transform: translateY(-38px) rotate(-22deg) scale(0.95);
          opacity: 0.9;
        }
        .lid-teased {
          transform: translateY(-20px) rotate(-10deg) scale(0.95);
          opacity: 0.75;
        }

        .prize-burst {
          transform: translateY(-62px) scale(1.12);
          opacity: 1;
        }
        .prize-teased-burst {
          transform: translateY(-40px) scale(0.88);
          opacity: 0.85;
        }
      `}</style>

      {/* 5 GIFT BOXES CONTAINER */}
      <div className="relative w-full h-[175px] sm:h-[190px] flex items-center justify-center pt-8">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 w-full px-1">
          {BOX_THEMES.map((box, idx) => {
            const isSelected = selectedIdx === idx;
            const boxOpened = isSelected ? isOpened : othersOpened;

            let teaseIndex = idx;
            if (idx > selectedIdx) teaseIndex -= 1;
            const displayPrize = isSelected
              ? wonPrize
              : teasedPrizes[teaseIndex] || teasedPrizes[0];
            const isWinner = displayPrize && displayPrize.kind !== 'none';

            return (
              <div
                key={box.id}
                onClick={() => handleBoxClick(idx)}
                className={`relative flex flex-col items-center select-none transition-all duration-300 w-[64px] sm:w-[78px] min-w-[58px] shrink-0 ${
                  !isBusy && !disabled
                    ? 'cursor-pointer hover:scale-110 hover:-translate-y-2 active:scale-95'
                    : ''
                } ${
                  isLocked && isSelected
                    ? '-translate-y-3.5 scale-110 z-20'
                    : isLocked && !isSelected
                    ? 'opacity-35 scale-90'
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
                      <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 border-2 border-white flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.9)] animate-bounce">
                        <img
                          src={box.icon}
                          alt="Prize"
                          className="w-6 sm:w-7 h-6 sm:h-7 object-contain drop-shadow"
                        />
                      </div>
                      <span className="mt-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-black/85 border border-amber-400 text-amber-300 font-black text-[11px] sm:text-[12px] whitespace-nowrap shadow-xl">
                        {displayPrize?.label}
                      </span>
                      <span className="text-[7.5px] font-black uppercase text-emerald-400 tracking-wider mt-0.5 bg-black/60 px-1 rounded">
                        {displayPrize?.kind === 'turn' ? 'THÊM LƯỢT!' : 'TRÚNG!'}
                      </span>
                    </div>
                  ) : (
                    <div className="relative flex flex-col items-center">
                      <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center shadow-lg">
                        <span className="text-base sm:text-lg leading-none">🍀</span>
                      </div>
                      <span className="mt-1 px-1.5 py-0.5 rounded-full bg-black/85 border border-white/10 text-muted font-bold text-[8.5px] sm:text-[9.5px] text-center max-w-[85px] leading-tight">
                        Chúc bạn may mắn lần sau
                      </span>
                    </div>
                  )}
                </div>

                {/* 3D GIFT BOX BODY & LID */}
                <div
                  className={`relative w-[62px] sm:w-[74px] h-[68px] sm:h-[80px] flex items-center justify-center ${
                    phase === 'idle' && !boxOpened ? 'box-floating' : ''
                  } ${isShaking ? 'box-rumbling' : ''}`}
                  style={{
                    filter:
                      isSelected && (isShaking || isLocked)
                        ? `drop-shadow(0 0 16px ${box.glow})`
                        : isSelected
                        ? `drop-shadow(0 0 10px ${box.glow})`
                        : 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))',
                    animationDelay: `${idx * 0.2}s`,
                  }}
                >
                  {/* LID (Nắp hộp) */}
                  <div
                    className={`absolute top-0 z-20 w-[66px] sm:w-[78px] h-4 sm:h-5 rounded-t-lg bg-gradient-to-r ${box.color} border-t-2 border-l-2 border-r-2 border-white/30 shadow-md transition-all duration-700 ease-out flex items-center justify-center ${
                      boxOpened
                        ? isSelected
                          ? 'lid-opened'
                          : 'lid-teased'
                        : ''
                    }`}
                  >
                    {/* Ribbon */}
                    <div className={`w-2.5 sm:w-3 h-full ${box.ribbon} shadow-sm`} />
                    {/* Bow */}
                    <div className="absolute -top-2.5 w-6 h-3 flex justify-center items-center pointer-events-none">
                      <span className="text-[13px] sm:text-[14px] leading-none drop-shadow">🎀</span>
                    </div>
                  </div>

                  {/* BODY (Thân hộp) */}
                  <div
                    className={`absolute bottom-0 z-10 w-[62px] sm:w-[74px] h-[54px] sm:h-[64px] rounded-b-xl bg-gradient-to-b ${box.color} border-2 border-white/20 shadow-2xl flex items-center justify-center overflow-hidden`}
                  >
                    {/* Vertical Ribbon */}
                    <div className={`w-2.5 sm:w-3 h-full ${box.ribbon} shadow-sm`} />
                    {/* Horizontal Ribbon */}
                    <div className={`absolute w-full h-2.5 sm:h-3 ${box.ribbon} shadow-sm`} />

                    {/* Emblem with unique badminton icon for each box */}
                    <div className="absolute z-20 w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-slate-900/90 border border-amber-300/80 flex items-center justify-center shadow-inner overflow-hidden p-0.5">
                      <img src={box.icon} alt={box.name} className="w-full h-full object-contain drop-shadow" />
                    </div>
                  </div>
                </div>

                {/* Box labels */}
                <div className="mt-2 text-center w-full">
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold block truncate border ${
                      isSelected && (isShaking || isLocked)
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-md animate-pulse'
                        : isSelected && !isBusy
                        ? 'bg-primary/20 border-primary text-primary font-bold'
                        : 'bg-surface/90 border-border-color text-main'
                    }`}
                  >
                    {isShaking && isSelected
                      ? '⚡ ĐANG RUNG'
                      : isLocked && isSelected
                      ? '✨ ĐÃ CHỌN'
                      : !isBusy
                      ? box.tag
                      : box.tag}
                  </span>
                  <p className="text-[8.5px] text-muted m-0 mt-0.5 truncate uppercase tracking-wider">
                    {box.name}
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
        <div className="w-full max-w-[340px] sm:max-w-[380px] mx-auto mt-3 px-1 flex flex-col items-center animate-slide-up">
          <div className="flex items-center justify-between w-full text-xs font-bold text-main mb-1.5">
            <span className="flex items-center gap-1.5 text-primary">
              <span className="animate-spin text-sm">🌀</span>
              {isLocked ? 'Đang bật tung nắp...' : 'Đang rung chuyển 5 hộp quà...'}
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
              ? '🎁 Cả 5 hộp quà đang rung lên dữ dội…'
              : countdown > 4
              ? '⚡ Năng lượng may mắn sắp giải phóng…'
              : countdown > 1
              ? `Hộp số ${selectedIdx + 1} sắp bật tung nắp sau 2s… 1s…`
              : '🎉 BÙM! MỞ HỘP NGAY BÂY GIỜ!'}
          </p>
        </div>
      ) : (
        <p className="text-[12px] text-muted text-center mt-2.5 m-0">
          {phase === 'revealed'
            ? 'Hộp quà đã mở, chúc bạn may mắn!'
            : 'Chạm trực tiếp vào 1 trong 5 hộp quà bất kỳ để mở 🎁'}
        </p>
      )}
    </div>
  );
};

export default MysteryBoxGame;
