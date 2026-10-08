import { useState, useEffect, useRef, useMemo } from 'react';

const SPIN_DURATION_SEC = 10;

const CARD_THEMES = [
  { id: 0, title: 'Thần May Mắn', num: 'I', rune: '✦', tag: 'THẺ 1' },
  { id: 1, title: 'Thần Tốc Độ', num: 'II', rune: '★', tag: 'THẺ 2' },
  { id: 2, title: 'Thần Cầu Lông', num: 'III', rune: '✦', tag: 'THẺ 3' },
];

const CardFlipGame = ({
  prizes = [],
  spinning = false,
  resultPrizeId = null,
  onSpinEnd,
  onPlay,
  disabled = false,
}) => {
  // Game phases: 'idle' | 'spinning' | 'stopping' | 'locked' | 'revealed'
  const [phase, setPhase] = useState('idle');
  const [selectedIdx, setSelectedIdx] = useState(1);
  const [countdown, setCountdown] = useState(SPIN_DURATION_SEC);
  const [isFlipped, setIsFlipped] = useState(false);
  const [othersFlipped, setOthersFlipped] = useState(false);

  const played = useRef(null);
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
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // When spinning starts from parent or card click
  useEffect(() => {
    if (spinning && resultPrizeId && played.current !== resultPrizeId) {
      played.current = resultPrizeId;
      startSpinSequence();
    }
    if (!spinning) {
      played.current = null;
    }
  }, [spinning, resultPrizeId]);

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
    // 0s -> 7.8s: 3D Orbit Spinning
    // 7.8s -> 8.8s: Slow down orbit & align
    const stopTimer = setTimeout(() => {
      setPhase('stopping');
    }, 7800);

    // 8.8s: Return to side-by-side spread and LOCK chosen card
    const lockTimer = setTimeout(() => {
      setPhase('locked');
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }, 8800);

    // 10.0s: EXACTLY 10s - The chosen card FLIPS open!
    const revealTimer = setTimeout(() => {
      setPhase('revealed');
      setIsFlipped(true);
    }, 10000);

    // 11.2s: Other 2 cards flip open
    const othersTimer = setTimeout(() => {
      setOthersFlipped(true);
    }, 11200);

    // 12.2s: Finish and open celebration popup
    const endTimer = setTimeout(() => {
      onSpinEnd?.();
    }, 12200);

    timerRef.current = {
      clear: () => {
        clearTimeout(stopTimer);
        clearTimeout(lockTimer);
        clearTimeout(revealTimer);
        clearTimeout(othersTimer);
        clearTimeout(endTimer);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      },
    };
  };

  const handleCardClick = (idx) => {
    if (spinning || phase !== 'idle' || disabled) return;
    setSelectedIdx(idx);
    if (onPlay) {
      onPlay();
    }
  };

  // Find won prize object
  const wonPrize = useMemo(() => {
    return prizes.find((p) => p.id === resultPrizeId) || null;
  }, [prizes, resultPrizeId]);

  // Tease prizes for the other cards
  const teasedPrizes = useMemo(() => {
    if (!prizes || prizes.length === 0) return [null, null, null];
    const available = prizes.filter((p) => p.id !== resultPrizeId);
    return [
      available[0] || prizes[0],
      available[1] || prizes[1] || prizes[0],
    ];
  }, [prizes, resultPrizeId]);

  const isOrbiting = phase === 'spinning' || phase === 'stopping';

  return (
    <div className="w-full max-w-[390px] shrink-0 flex flex-col items-center select-none py-1">
      <style>{`
        /* 3D Scene settings */
        .scene-stage {
          perspective: 1000px;
          perspective-origin: 50% 50%;
        }

        /* Continuous 3D Carousel Spin for 8 seconds */
        @keyframes orbitSpin10s {
          0% {
            transform: rotateY(0deg);
          }
          15% {
            transform: rotateY(420deg);
          }
          60% {
            transform: rotateY(2160deg);
          }
          85% {
            transform: rotateY(2880deg);
          }
          100% {
            transform: rotateY(2880deg);
          }
        }

        .carousel-orbit {
          transform-style: preserve-3d;
          animation: orbitSpin10s 7.8s cubic-bezier(0.25, 0.9, 0.45, 1) forwards;
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

      {/* STAGE CONTAINER */}
      <div className="relative w-full h-[185px] sm:h-[195px] flex items-center justify-center scene-stage">
        {/* Magical Summoning Circle on Floor during Spin */}
        {isOrbiting && (
          <div className="absolute bottom-2 flex flex-col items-center pointer-events-none z-0">
            <div className="w-56 h-10 rounded-[100%] bg-primary/20 blur-lg animate-pulse" />
            <div className="w-48 h-6 rounded-[100%] border-2 border-primary/50 bg-gradient-to-r from-emerald-500/20 via-amber-400/30 to-emerald-500/20 blur-sm" />
          </div>
        )}

        {/* ============================================================ */}
        {/* 1. ORBIT CAROUSEL VIEW (Active during 0s - 8s spinning)      */}
        {/* ============================================================ */}
        {isOrbiting ? (
          <div className="relative w-[110px] h-[168px] carousel-orbit z-10 flex items-center justify-center">
            {CARD_THEMES.map((theme, idx) => {
              const angle = idx * 120;
              return (
                <div
                  key={theme.id}
                  style={{
                    position: 'absolute',
                    width: '108px',
                    height: '165px',
                    transform: `rotateY(${angle}deg) translateZ(105px)`,
                  }}
                  className="rounded-2xl overflow-hidden border-2 border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.5)] bg-gradient-to-b from-[#0f241a] via-[#08150f] to-[#030a07] flex flex-col items-center justify-between p-3"
                >
                  <div className="w-full flex justify-between items-center text-[10px] text-primary/70 font-mono">
                    <span>{theme.rune}</span>
                    <span className="font-bold">{theme.num}</span>
                    <span>{theme.rune}</span>
                  </div>

                  <div className="flex flex-col items-center my-auto">
                    <div className="w-14 h-14 rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                      <img
                        src="/bad_icon01.png"
                        alt="Badminton"
                        className="w-9 h-9 object-contain drop-shadow"
                      />
                    </div>
                    <span className="text-[11px] font-extrabold text-main mt-1.5 whitespace-nowrap">
                      {theme.title}
                    </span>
                  </div>

                  <div className="w-full py-0.5 rounded bg-white/5 border border-white/10 text-center">
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest animate-pulse">
                      XÁO BÀI…
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ============================================================ */
          /* 2. SPREAD VIEW (Idle, Locked, or Revealed)                  */
          /* ============================================================ */
          <div className="flex items-center justify-center gap-3 sm:gap-4 z-10 w-full">
            {CARD_THEMES.map((theme, idx) => {
              const isSelected = selectedIdx === idx;
              const cardFlipped = isSelected ? isFlipped : othersFlipped;
              const displayPrize = isSelected
                ? wonPrize
                : idx === 0
                ? teasedPrizes[0]
                : teasedPrizes[1];
              const isWinner = displayPrize && displayPrize.kind !== 'none';
              const isLocked = phase === 'locked';

              return (
                <div
                  key={theme.id}
                  onClick={() => handleCardClick(idx)}
                  style={{
                    width: '108px',
                    height: '165px',
                    minWidth: '108px',
                    flexShrink: 0,
                  }}
                  className={`relative select-none transition-all duration-500 ${
                    phase === 'idle' && !disabled
                      ? 'cursor-pointer hover:-translate-y-3 hover:scale-105'
                      : ''
                  } ${
                    isLocked && isSelected
                      ? '-translate-y-3 scale-108 z-20'
                      : isLocked && !isSelected
                      ? 'opacity-40 scale-95'
                      : ''
                  } ${
                    phase === 'idle'
                      ? idx === 0
                        ? '-rotate-2'
                        : idx === 2
                        ? 'rotate-2'
                        : ''
                      : ''
                  }`}
                >
                  <div
                    className={`relative w-full h-full card-flipper ${
                      cardFlipped ? 'card-flipper-open' : ''
                    }`}
                  >
                    {/* BACK FACE (Mặt úp) */}
                    <div
                      className={`card-side absolute inset-0 rounded-2xl p-2.5 flex flex-col items-center justify-between border-2 transition-all duration-300 ${
                        isSelected && phase !== 'idle'
                          ? 'border-amber-400 bg-gradient-to-b from-[#193224] via-[#0d1d15] to-[#040c08] shadow-[0_0_25px_rgba(245,158,11,0.6)]'
                          : 'border-emerald-500/40 bg-gradient-to-b from-[#0e2117] via-[#08150f] to-[#030906] shadow-xl hover:border-primary'
                      }`}
                    >
                      <div className="w-full flex justify-between items-center text-[10px] text-primary/70 font-mono">
                        <span>{theme.rune}</span>
                        <span className="font-bold text-[9px] uppercase tracking-wider text-muted">
                          {theme.tag}
                        </span>
                        <span>{theme.rune}</span>
                      </div>

                      <div className="flex flex-col items-center my-auto">
                        <div
                          className={`w-13 h-13 rounded-full border flex items-center justify-center transition-all ${
                            isSelected && phase !== 'idle'
                              ? 'border-amber-400/60 bg-amber-400/20 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                              : 'border-primary/30 bg-primary/10 shadow-inner'
                          }`}
                        >
                          <img
                            src="/bad_icon01.png"
                            alt="Shuttlecock"
                            className="w-8 h-8 object-contain drop-shadow"
                          />
                        </div>
                        <span className="text-[11px] font-bold text-main mt-1 text-center">
                          {theme.title}
                        </span>
                      </div>

                      <div
                        className={`w-full py-0.5 rounded text-center border ${
                          isSelected && phase !== 'idle'
                            ? 'bg-amber-400/20 border-amber-400/40 text-amber-300 font-extrabold animate-pulse'
                            : 'bg-white/5 border-white/5 text-emerald-400 font-semibold'
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-wider">
                          {isLocked && isSelected
                            ? '✨ ĐÃ CHỌN'
                            : phase === 'idle'
                            ? 'CHẠM ĐỂ CHỌN'
                            : 'LÁ BÀI'}
                        </span>
                      </div>
                    </div>

                    {/* FRONT FACE (Mặt ngửa - Khi lộ giải) */}
                    <div
                      className={`card-side card-side-front absolute inset-0 rounded-2xl p-2.5 flex flex-col items-center justify-between border-2 text-center overflow-hidden ${
                        isWinner
                          ? 'border-amber-400 bg-gradient-to-b from-[#1d3525] via-[#102418] to-[#06120b] shadow-[0_0_25px_rgba(245,158,11,0.6)]'
                          : 'border-red-500/40 bg-gradient-to-b from-[#211515] via-[#150d0d] to-[#0a0606] shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                      } ${!isSelected ? 'opacity-70' : ''}`}
                    >
                      <div className="w-full flex justify-between items-center text-[9px] font-mono">
                        <span className={isWinner ? 'text-amber-400 font-bold' : 'text-red-400 font-bold'}>
                          {isWinner ? '★' : '✕'}
                        </span>
                        <span className="font-bold uppercase tracking-wider text-[8px] text-muted">
                          {isSelected ? 'BẠN CHỌN' : 'THẺ BÍ MẬT'}
                        </span>
                        <span className={isWinner ? 'text-amber-400 font-bold' : 'text-red-400 font-bold'}>
                          {isWinner ? '★' : '✕'}
                        </span>
                      </div>

                      <div className="flex flex-col items-center my-auto w-full">
                        {isWinner ? (
                          <>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500/30 to-yellow-300/20 border border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 animate-bounce">
                              <img
                                src="/bad_icon01.png"
                                alt="Prize"
                                className="w-7 h-7 object-contain drop-shadow"
                              />
                            </div>
                            <span className="mt-1 text-[15px] font-black text-amber-300 leading-tight block w-full truncate">
                              {displayPrize?.label}
                            </span>
                            <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest mt-0.5">
                              TRÚNG GIẢI!
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                              <span className="text-2xl leading-none">😭</span>
                            </div>
                            <span className="mt-1 text-[13px] font-bold text-red-300 leading-tight block">
                              Trượt rồi!
                            </span>
                            <span className="text-[9px] text-muted font-medium mt-0.5">
                              May mắn lần sau
                            </span>
                          </>
                        )}
                      </div>

                      <div className="w-full">
                        <span
                          className={`text-[8.5px] font-black uppercase tracking-wider block py-0.5 rounded ${
                            isWinner
                              ? 'bg-amber-400/15 text-amber-300'
                              : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          {isWinner ? '🎉 THẦN TÀI ĐẾN' : '😢 TIẾC QUÁ'}
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
        <div className="w-full mt-3 px-3 flex flex-col items-center animate-slide-up">
          <div className="flex items-center justify-between w-full text-xs font-bold text-main mb-1.5">
            <span className="flex items-center gap-1.5 text-primary">
              <span className="animate-spin text-sm">🌀</span>
              {phase === 'locked' ? 'Đang chốt thẻ...' : 'Đang xáo bài ma thuật...'}
            </span>
            <span className="font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30 text-[11px]">
              {countdown > 0 ? `${countdown}s` : 'Lật bài!'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-surface border border-border-color overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 transition-all duration-300 ease-linear"
              style={{
                width: `${Math.min(100, Math.max(0, ((SPIN_DURATION_SEC - countdown) / SPIN_DURATION_SEC) * 100))}%`,
              }}
            />
          </div>

          <p className="text-[11.5px] text-muted mt-1.5 m-0 text-center animate-pulse">
            {countdown > 7
              ? 'Năng lượng may mắn đang tích tụ… ⚡'
              : countdown > 4
              ? 'Lá bài thần tài đang tìm kiếm chủ nhân… 🪶'
              : countdown > 1
              ? 'Chuẩn bị chốt lá bài định mệnh… ✨'
              : '🎉 ĐÃ ĐẾN GIỜ: LẬT BÀI NGAY!'}
          </p>
        </div>
      ) : (
        <p className="text-[12px] text-muted text-center mt-2.5 m-0">
          {phase === 'revealed'
            ? 'Lá bài định mệnh đã được hé lộ!'
            : 'Chạm vào 1 lá bài bất kỳ để thử thách nhân phẩm tuần này 🃏'}
        </p>
      )}
    </div>
  );
};

export default CardFlipGame;
