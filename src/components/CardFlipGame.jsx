import { useState, useEffect, useRef, useMemo } from 'react';

const SPIN_DURATION_SEC = 10;

const CARD_THEMES = [
  {
    id: 0,
    title: 'Thần May Mắn',
    sub: 'Hoàng Kim',
    num: 'I',
    rune: '✦',
    tag: 'LÁ 1',
    element: 'Kim',
    icon: '/bad_icon01.png',
    cardBorder: 'border-amber-400',
    cardGlow: 'rgba(245, 158, 11, 0.75)',
    bgDark: 'from-[#2e1d03] via-[#1a1002] to-[#0a0600]',
    accentText: 'text-amber-400',
    badge: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    iconCircle: 'border-amber-400/50 bg-amber-400/15 text-amber-300',
    winGlow: 'shadow-[0_0_24px_rgba(245,158,11,0.7)]',
  },
  {
    id: 1,
    title: 'Thần Tốc Độ',
    sub: 'Phong Mộc',
    num: 'II',
    rune: '★',
    tag: 'LÁ 2',
    element: 'Mộc',
    icon: '/bad_icon02.png',
    cardBorder: 'border-emerald-400',
    cardGlow: 'rgba(16, 185, 129, 0.75)',
    bgDark: 'from-[#062c19] via-[#03180e] to-[#010a06]',
    accentText: 'text-emerald-400',
    badge: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40',
    iconCircle: 'border-emerald-400/50 bg-emerald-400/15 text-emerald-300',
    winGlow: 'shadow-[0_0_24px_rgba(16,185,129,0.7)]',
  },
  {
    id: 2,
    title: 'Thần Cầu Lông',
    sub: 'Hải Thủy',
    num: 'III',
    rune: '👑',
    tag: 'LÁ 3',
    element: 'Thủy',
    icon: '/bad_icon03.png',
    cardBorder: 'border-cyan-400',
    cardGlow: 'rgba(6, 182, 212, 0.75)',
    bgDark: 'from-[#072438] via-[#041521] to-[#01090f]',
    accentText: 'text-cyan-400',
    badge: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40',
    iconCircle: 'border-cyan-400/50 bg-cyan-400/15 text-cyan-300',
    winGlow: 'shadow-[0_0_24px_rgba(6,182,212,0.7)]',
  },
  {
    id: 3,
    title: 'Thần Smash',
    sub: 'Liệt Hỏa',
    num: 'IV',
    rune: '⚡',
    tag: 'LÁ 4',
    element: 'Hỏa',
    icon: '/bad_icon04.png',
    cardBorder: 'border-rose-500',
    cardGlow: 'rgba(244, 63, 94, 0.75)',
    bgDark: 'from-[#380b14] via-[#20060b] to-[#0d0204]',
    accentText: 'text-rose-400',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    iconCircle: 'border-rose-500/50 bg-rose-500/15 text-rose-300',
    winGlow: 'shadow-[0_0_24px_rgba(244,63,94,0.7)]',
  },
  {
    id: 4,
    title: 'Thần Thủ Cầu',
    sub: 'Huyền Bí',
    num: 'V',
    rune: '🛡️',
    tag: 'LÁ 5',
    element: 'Thổ',
    icon: '/bad_icon05.png',
    cardBorder: 'border-purple-400',
    cardGlow: 'rgba(168, 85, 247, 0.75)',
    bgDark: 'from-[#290d38] via-[#170720] to-[#0a020e]',
    accentText: 'text-purple-400',
    badge: 'bg-purple-400/20 text-purple-300 border-purple-400/40',
    iconCircle: 'border-purple-400/50 bg-purple-400/15 text-purple-300',
    winGlow: 'shadow-[0_0_24px_rgba(168,85,247,0.7)]',
  },
];

const CardFlipGame = ({
  prizes = [],
  spinning = false,
  spinId = 0,
  resultPrizeId = null,
  onSpinEnd,
  onPlay,
  disabled = false,
}) => {
  // Game phases: 'idle' | 'spinning' | 'stopping' | 'locked' | 'revealed'
  const [phase, setPhase] = useState(() => (resultPrizeId ? 'revealed' : 'idle'));
  const [selectedIdx, setSelectedIdx] = useState(2); // default to middle (card 3)
  const [countdown, setCountdown] = useState(SPIN_DURATION_SEC);
  const [isFlipped, setIsFlipped] = useState(() => Boolean(resultPrizeId));
  const [othersFlipped, setOthersFlipped] = useState(() => Boolean(resultPrizeId));

  const savedPrizeIdRef = useRef(resultPrizeId);
  useEffect(() => {
    if (resultPrizeId) {
      savedPrizeIdRef.current = resultPrizeId;
      if (phase === 'idle' && !isFlipped) {
        setPhase('revealed');
        setIsFlipped(true);
        setOthersFlipped(true);
      }
    }
  }, [resultPrizeId]);

  const lastPlayedSpinId = useRef(0);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Setup sound
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

  // When new spinId is received from parent
  useEffect(() => {
    if (spinId > 0 && spinId !== lastPlayedSpinId.current) {
      lastPlayedSpinId.current = spinId;
      startSpinSequence();
    }
  }, [spinId]);

  const startSpinSequence = () => {
    setPhase('spinning');
    setIsFlipped(false);
    setOthersFlipped(false);
    setCountdown(SPIN_DURATION_SEC);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => console.log('Audio autoplay prevented:', e));
    }

    // 1-second interval countdown from 10 to 1
    let remaining = SPIN_DURATION_SEC;
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(Math.max(0, remaining));
      if (remaining <= 0) {
        clearInterval(countdownIntervalRef.current);
      }
    }, 1000);

    // Timeline:
    // 0s -> 9.5s: 3D Orbit Carousel spins continuously (fast initially, slowing down smoothly in the last 3s)
    // 9.5s: Cards slow into docked alignment and lock chosen card with suspense
    const lockTimer = setTimeout(() => {
      setPhase('locked');
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }, 9500);

    // 10.0s: EXACTLY 10s - The chosen card FLIPS open!
    const revealTimer = setTimeout(() => {
      setPhase('revealed');
      setIsFlipped(true);
    }, 10000);

    // 11.2s: Other 4 cards flip open
    const othersTimer = setTimeout(() => {
      setOthersFlipped(true);
    }, 11200);

    // 12.2s: Finish and open celebration popup
    const endTimer = setTimeout(() => {
      onSpinEnd?.();
    }, 12200);

    timerRef.current = {
      clear: () => {
        clearTimeout(lockTimer);
        clearTimeout(revealTimer);
        clearTimeout(othersTimer);
        clearTimeout(endTimer);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      },
    };
  };

  const isBusy = spinning || phase === 'spinning' || phase === 'locked';

  const handleCardClick = (idx) => {
    if (isBusy || disabled) return;
    setSelectedIdx(idx);
    setIsFlipped(false);
    setOthersFlipped(false);
    setPhase('idle');
    if (onPlay) {
      onPlay(idx);
    }
  };

  // Find won prize object using effectivePrizeId so it never resets to null
  const effectivePrizeId = resultPrizeId || savedPrizeIdRef.current;
  const wonPrize = useMemo(() => {
    return prizes.find((p) => p.id === effectivePrizeId) || null;
  }, [prizes, effectivePrizeId]);

  // Tease prizes for the other 4 cards
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

  const isOrbiting = phase === 'spinning';

  return (
    <div className="w-full max-w-[860px] shrink-0 flex flex-col items-center select-none py-1">
      <style>{`
        /* 3D Scene settings */
        .scene-stage {
          perspective: 1100px;
          perspective-origin: 50% 50%;
        }

        /* Continuous 3D 5-Card Carousel Spin for 9.5s:
           - 0s - 6.5s: Quay nhanh cuồng nhiệt
           - 6.5s - 9.5s (còn 3s): Quay chậm dần đều mượt mà, lướt từng lá qua trước mắt
           - 9.5s: Dừng nhẹ nhàng ngay ngắn chính diện
        */
        @keyframes orbitSpin10s {
          0% {
            transform: rotateY(0deg);
          }
          30% {
            transform: rotateY(1296deg);
          }
          60% {
            transform: rotateY(2520deg);
          }
          72% {
            transform: rotateY(2880deg);
          }
          85% {
            transform: rotateY(3132deg);
          }
          95% {
            transform: rotateY(3225deg);
          }
          100% {
            transform: rotateY(3240deg);
          }
        }

        .carousel-orbit-5 {
          transform-style: preserve-3d;
          animation: orbitSpin10s 9.5s cubic-bezier(0.2, 0.82, 0.35, 1) forwards;
        }

        /* 3D Card flip mechanics */
        .card-flipper {
          transform-style: preserve-3d;
          transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .card-flipper-open {
          transform: rotateY(180deg);
        }
        .card-side {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        .card-side-front {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* STAGE CONTAINER - Expanded height for larger cards (150px x 238px) */}
      <div className="relative w-full h-[255px] sm:h-[280px] flex items-center justify-center scene-stage">
        {/* Magical Summoning Circle on Floor during Spin */}
        {isOrbiting && (
          <div className="absolute bottom-1 flex flex-col items-center pointer-events-none z-0">
            <div className="w-80 h-16 rounded-[100%] bg-primary/25 blur-lg animate-pulse" />
            <div className="w-72 h-10 rounded-[100%] border-2 border-primary/60 bg-gradient-to-r from-emerald-500/20 via-amber-400/30 to-purple-500/20 blur-sm" />
          </div>
        )}

        {/* ============================================================ */}
        {/* 1. ORBIT CAROUSEL VIEW (Active during 0s - 9.5s spinning)   */}
        {/* ============================================================ */}
        {isOrbiting ? (
          <div className="relative w-[150px] h-[235px] carousel-orbit-5 z-10 flex items-center justify-center">
            {CARD_THEMES.map((theme, idx) => {
              const angle = idx * 72; // 360 / 5 = 72 deg
              return (
                <div
                  key={theme.id}
                  style={{
                    position: 'absolute',
                    width: '150px',
                    height: '235px',
                    transform: `rotateY(${angle}deg) translateZ(165px)`,
                  }}
                  className={`rounded-2xl overflow-hidden border-2 ${theme.cardBorder} shadow-2xl bg-gradient-to-b ${theme.bgDark} flex flex-col items-center justify-between p-3`}
                >
                  <div className={`w-full flex justify-between items-center text-[11px] ${theme.accentText} font-mono`}>
                    <span>{theme.rune}</span>
                    <span className="font-bold">{theme.num}</span>
                    <span>{theme.rune}</span>
                  </div>

                  <div className="flex flex-col items-center my-auto">
                    <div className={`w-14 h-14 rounded-full border ${theme.iconCircle} flex items-center justify-center shadow-lg`}>
                      <img
                        src={theme.icon}
                        alt={theme.title}
                        className="w-8 h-8 object-contain drop-shadow"
                      />
                    </div>
                    <span className={`text-[13px] font-black ${theme.accentText} mt-2 whitespace-nowrap`}>
                      {theme.title}
                    </span>
                    <span className="text-[9.5px] text-muted uppercase tracking-wider font-semibold">
                      {theme.sub}
                    </span>
                  </div>

                  <div className="w-full py-1 rounded-lg bg-white/5 border border-white/10 text-center">
                    <span className={`text-[9.5px] font-bold ${theme.accentText} uppercase tracking-widest animate-pulse`}>
                      XÁO BÀI…
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ============================================================ */
          /* 2. SPREAD VIEW (5 Standalone Cards - Zero Overlap, Gaps)   */
          /* ============================================================ */
          <div className="flex items-center justify-center gap-1.5 min-[400px]:gap-2 sm:gap-2.5 md:gap-3 lg:gap-3.5 z-10 w-full px-1">
            {CARD_THEMES.map((theme, idx) => {
              const isSelected = selectedIdx === idx;
              const cardFlipped = isSelected ? isFlipped : othersFlipped;

              // Map tease prizes for non-selected cards
              let teaseIndex = idx;
              if (idx > selectedIdx) teaseIndex -= 1;
              const displayPrize = isSelected
                ? wonPrize
                : teasedPrizes[teaseIndex] || teasedPrizes[0];
              const isWinner = displayPrize && displayPrize.kind !== 'none';
              const isLocked = phase === 'locked';

              return (
                <div
                  key={theme.id}
                  onClick={() => handleCardClick(idx)}
                  className={`relative select-none transition-all duration-300 w-[64px] min-[390px]:w-[72px] min-[480px]:w-[88px] sm:w-[120px] md:w-[135px] lg:w-[150px] h-[155px] min-[390px]:h-[170px] min-[480px]:h-[190px] sm:h-[215px] lg:h-[238px] shrink-0 ${
                    isSelected ? 'z-30' : 'z-10'
                  } ${
                    !isBusy && !disabled
                      ? 'cursor-pointer hover:-translate-y-3 hover:scale-[1.03] active:scale-95'
                      : ''
                  } ${
                    isLocked && isSelected
                      ? '-translate-y-4 scale-105 z-30 shadow-2xl'
                      : isLocked && !isSelected
                      ? 'opacity-40 scale-95'
                      : phase === 'revealed' && isSelected
                      ? '-translate-y-2 scale-[1.02] z-30 shadow-2xl'
                      : phase === 'revealed' && !isSelected
                      ? 'opacity-75'
                      : ''
                  }`}
                >
                  <div
                    className={`relative w-full h-full card-flipper ${
                      cardFlipped ? 'card-flipper-open' : ''
                    }`}
                  >
                    {/* BACK FACE (Mặt úp - Mỗi lá bài một màu sắc đặc trưng) */}
                    <div
                      className={`card-side absolute inset-0 rounded-2xl p-1.5 min-[390px]:p-2 sm:p-3 flex flex-col items-center justify-between border-2 transition-all duration-300 bg-gradient-to-b ${theme.bgDark} ${
                        isSelected && phase !== 'idle'
                          ? `${theme.cardBorder} shadow-2xl`
                          : isSelected && !isBusy
                          ? `${theme.cardBorder} shadow-lg`
                          : `${theme.cardBorder}/50 hover:${theme.cardBorder} shadow-md`
                      }`}
                      style={{
                        boxShadow: isSelected
                          ? `0 0 24px ${theme.cardGlow}`
                          : `0 4px 12px rgba(0,0,0,0.5)`,
                      }}
                    >
                      <div className={`w-full flex justify-between items-center text-[8px] min-[390px]:text-[9.5px] sm:text-[11px] ${theme.accentText} font-mono`}>
                        <span>{theme.rune}</span>
                        <span className={`font-extrabold text-[6.5px] min-[390px]:text-[7.5px] sm:text-[9.5px] uppercase tracking-wider px-1 sm:px-1.5 py-0.5 rounded border ${theme.badge}`}>
                          {theme.tag}
                        </span>
                        <span>{theme.rune}</span>
                      </div>

                      <div className="flex flex-col items-center my-auto">
                        <div
                          className={`w-9 min-[390px]:w-10 sm:w-13 lg:w-14 h-9 min-[390px]:h-10 sm:h-13 lg:h-14 rounded-full border flex items-center justify-center transition-all ${theme.iconCircle}`}
                          style={{
                            boxShadow: `0 0 12px ${theme.cardGlow}`,
                          }}
                        >
                          <img
                            src={theme.icon}
                            alt={theme.title}
                            className="w-5 min-[390px]:w-6 sm:w-8 lg:w-9 h-5 min-[390px]:h-6 sm:h-8 lg:h-9 object-contain drop-shadow"
                          />
                        </div>
                        <span className={`text-[9.5px] min-[390px]:text-[11px] sm:text-[13px] lg:text-[14px] font-black ${theme.accentText} mt-1 sm:mt-1.5 text-center leading-tight whitespace-nowrap`}>
                          {theme.title}
                        </span>
                        <span className="text-[6.5px] min-[390px]:text-[7.5px] sm:text-[9px] lg:text-[9.5px] text-muted uppercase tracking-wider font-semibold">
                          {theme.sub}
                        </span>
                      </div>

                      <div
                        className={`w-full py-0.5 sm:py-1 rounded-lg text-center border ${
                          isSelected && phase !== 'idle'
                            ? `${theme.badge} font-black animate-pulse`
                            : isSelected && !isBusy
                            ? `${theme.badge} font-bold`
                            : 'bg-white/5 border-white/10 text-muted font-medium'
                        }`}
                      >
                        <span className="text-[7px] min-[390px]:text-[8px] sm:text-[9.5px] lg:text-[10px] uppercase tracking-wider font-extrabold block truncate">
                          {isLocked && isSelected
                            ? '✨ ĐÃ CHỌN'
                            : !isBusy
                            ? 'CHỌN LÁ'
                            : 'LÁ BÀI'}
                        </span>
                      </div>
                    </div>

                    {/* FRONT FACE (Mặt ngửa - Khi hé lộ giải thưởng) */}
                    <div
                      className={`card-side card-side-front absolute inset-0 rounded-2xl p-1.5 min-[390px]:p-2 sm:p-3 flex flex-col items-center justify-between border-2 text-center overflow-hidden bg-gradient-to-b ${theme.bgDark} ${
                        isWinner
                          ? `${theme.cardBorder} ${theme.winGlow}`
                          : 'border-white/20 shadow-md'
                      } ${!isSelected ? 'opacity-75' : ''}`}
                    >
                      <div className="w-full flex justify-between items-center text-[7.5px] min-[390px]:text-[8.5px] sm:text-[10px] font-mono">
                        <span className={isWinner ? `${theme.accentText} font-bold` : 'text-muted font-bold'}>
                          {isWinner ? '★' : '•'}
                        </span>
                        <span className="font-extrabold uppercase tracking-wider text-[6.5px] min-[390px]:text-[7.5px] sm:text-[9px] text-muted truncate">
                          {isSelected ? 'BẠN CHỌN' : 'BÍ MẬT'}
                        </span>
                        <span className={isWinner ? `${theme.accentText} font-bold` : 'text-muted font-bold'}>
                          {isWinner ? '★' : '•'}
                        </span>
                      </div>

                      <div className="flex flex-col items-center my-auto w-full">
                        {isWinner ? (
                          <>
                            <div className="w-9 min-[390px]:w-10 sm:w-13 lg:w-14 h-9 min-[390px]:h-10 sm:h-13 lg:h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 border-2 border-white flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce">
                              <img
                                src={theme.icon}
                                alt="Prize"
                                className="w-5 min-[390px]:w-6 sm:w-8 lg:w-9 h-5 min-[390px]:h-6 sm:h-8 lg:h-9 object-contain drop-shadow"
                              />
                            </div>
                            <span className="mt-1 sm:mt-1.5 text-[10.5px] min-[390px]:text-[12px] sm:text-[16px] lg:text-[18px] font-black text-amber-300 leading-tight block w-full truncate">
                              {displayPrize?.label}
                            </span>
                            <span className="text-[6.5px] min-[390px]:text-[7.5px] sm:text-[9px] lg:text-[9.5px] font-extrabold text-emerald-400 uppercase tracking-widest mt-0.5 bg-black/60 px-1 sm:px-2 py-0.5 rounded-full border border-emerald-400/30">
                              {displayPrize?.kind === 'turn' ? 'THÊM LƯỢT!' : 'TRÚNG!'}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-8 min-[390px]:w-9 sm:w-12 lg:w-13 h-8 min-[390px]:h-9 sm:h-12 lg:h-13 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center shadow-inner">
                              <span className="text-lg min-[390px]:text-xl sm:text-2xl lg:text-3xl leading-none">🍀</span>
                            </div>
                            <span className="mt-1 sm:mt-1.5 text-[8px] min-[390px]:text-[9px] sm:text-[11px] lg:text-[12.5px] font-bold text-muted leading-tight block px-0.5 text-center">
                              Chúc bạn may mắn lần sau
                            </span>
                          </>
                        )}
                      </div>

                      <div className="w-full">
                        <span
                          className={`text-[7px] min-[390px]:text-[8px] sm:text-[9px] lg:text-[9.5px] font-black uppercase tracking-wider block py-0.5 sm:py-1 rounded-lg truncate border ${
                            isWinner
                              ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                              : 'bg-white/5 text-muted border-white/10'
                          }`}
                        >
                          {isWinner ? `🎉 ${theme.title}` : '🍀 LẦN SAU'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. SUSPENSE COUNTDOWN & PROGRESS BAR                         */}
      {/* ============================================================ */}
      {isOrbiting || phase === 'locked' ? (
        <div className="w-full max-w-[340px] sm:max-w-[380px] mx-auto mt-3 px-1 flex flex-col items-center animate-slide-up">
          <div className="flex items-center justify-between w-full text-xs font-bold text-main mb-1.5">
            <span className="flex items-center gap-1.5 text-primary">
              <span className="animate-spin text-sm">🌀</span>
              {phase === 'locked' ? 'Đang chốt lá bài...' : 'Đang xáo bài ma thuật 5 lá...'}
            </span>
            <span className="font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30 text-[11px]">
              {countdown > 0 ? `${countdown}s` : 'Lật bài!'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-surface border border-border-color overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-purple-500 transition-all duration-300 ease-linear"
              style={{
                width: `${Math.min(100, Math.max(0, ((SPIN_DURATION_SEC - countdown) / SPIN_DURATION_SEC) * 100))}%`,
              }}
            />
          </div>

          <p className="text-[11.5px] text-muted mt-1.5 m-0 text-center animate-pulse">
            {countdown > 7
              ? 'Năng lượng 5 phương đang hội tụ… ⚡'
              : countdown > 4
              ? 'Lá bài thần tài đang tìm kiếm chủ nhân… 🪶'
              : countdown > 1
              ? `Lá bài số ${selectedIdx + 1} bạn chọn đang phát sáng… ✨`
              : '🎉 ĐÃ ĐẾN GIỜ: LẬT BÀI NGAY!'}
          </p>
        </div>
      ) : (
        <p className="text-[12px] text-muted text-center mt-2.5 m-0">
          {phase === 'revealed'
            ? 'Lá bài định mệnh đã được hé lộ!'
            : 'Chạm vào 1 trong 5 lá bài thần tài để thử thách vận may 🃏'}
        </p>
      )}
    </div>
  );
};

export default CardFlipGame;
