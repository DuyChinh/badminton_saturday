import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * The wheel only *plays back* a result the server already drew, so the slice it
 * lands on is decided before the first frame of the animation.
 *
 * The seven wedges are drawn at equal size for legibility; the real odds live
 * on the server and are not the same as the slice areas.
 */

const SLICE = {
  cash1: { fill: '#0E4D3A', text: '#6EE7B7' },
  cash2: { fill: '#0E4A63', text: '#7DD3FC' },
  cash3: { fill: '#1E3A8A', text: '#A5B4FC' },
  cash4: { fill: '#4C1D95', text: '#D8B4FE' },
  cash5: { fill: '#831843', text: '#F9A8D4' },
  half: { fill: '#A16207', text: '#FDE68A' },
  none: { fill: '#18211D', text: '#8A9A92' },
};

const SPIN_MS = 8000;
const R = 100;

const polar = (angleDeg, radius) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [radius * Math.cos(rad), radius * Math.sin(rad)];
};

const slicePath = (start, end) => {
  const [x1, y1] = polar(start, R);
  const [x2, y2] = polar(end, R);
  const large = end - start > 180 ? 1 : 0;
  return `M 0 0 L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
};

/** Small mark drawn inside each wedge, sized in the wheel's own units. */
const PrizeIcon = ({ kind, color, x, y }) => {
  const common = {
    fill: 'none',
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  return (
    <g transform={`translate(${x - 9} ${y - 9}) scale(0.75)`}>
      {kind === 'cash' && (
        <g {...common}>
          <rect x="1.5" y="5" width="21" height="14" rx="2.5" />
          <circle cx="12" cy="12" r="3.6" />
          <path d="M5 9v.01M19 15v.01" />
        </g>
      )}
      {kind === 'percent' && (
        <g {...common}>
          <path d="M4 13.5V5a1 1 0 011-1h8.5L21 11.5 13.5 19 4 13.5z" />
          <circle cx="8.6" cy="8.6" r="1.4" />
          <path d="M10.5 15l5-5" />
        </g>
      )}
      {kind === 'none' && (
        <g {...common}>
          <circle cx="12" cy="18" r="3.2" />
          <path d="M10 15.4L6.8 3.5h10.4L14 15.4M9.4 3.5l1.3 12M14.6 3.5l-1.3 12M7.6 8h8.8" />
        </g>
      )}
    </g>
  );
};

const LuckyWheel = ({ prizes, spinning, resultPrizeId, onSpinEnd, size = 'clamp(190px, 20vw, 260px)' }) => {
  const [rotation, setRotation] = useState(0);
  const total = useRef(0);
  const played = useRef(null);

  // Equal wedges, in the order the server sends them
  const slices = useMemo(() => {
    const sweep = 360 / prizes.length;
    return prizes.map((p, i) => ({
      ...p,
      start: i * sweep,
      end: (i + 1) * sweep,
      mid: i * sweep + sweep / 2,
      sweep,
    }));
  }, [prizes]);

  // Start the animation once, as soon as the server tells us what was drawn.
  if (spinning && resultPrizeId && played.current !== resultPrizeId) {
    played.current = resultPrizeId;
    const slice = slices.find((s) => s.id === resultPrizeId);
    if (slice) {
      // Stop anywhere inside the wedge rather than always dead centre.
      const jitter = (Math.random() - 0.5) * slice.sweep * 0.62;
      const landing = 360 - slice.mid + jitter;
      const next = Math.ceil(total.current / 360) * 360 + 360 * 6 + landing;
      total.current = next;
      requestAnimationFrame(() => setRotation(next));
      setTimeout(() => onSpinEnd?.(), SPIN_MS);
    }
  }
  if (!spinning) played.current = null;

  // Xử lý âm thanh
  const audioRef = useRef(null);
  
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/xoso.mp3');
      // Phát lại liên tục nếu spin lâu hơn đoạn nhạc
      audioRef.current.loop = true;
    }
    
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
        audioRef.current.play().catch(e => console.log('Không thể auto-play âm thanh do policy của trình duyệt:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [spinning]);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* Pointer */}
      <span
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2 -top-1.5 z-20"
        style={{
          width: 0,
          height: 0,
          borderLeft: '13px solid transparent',
          borderRight: '13px solid transparent',
          borderTop: '24px solid var(--primary-light)',
          filter: 'drop-shadow(0 3px 7px rgba(0,0,0,0.65))',
        }}
      />

      <div
        className={`absolute inset-0 rounded-full ${spinning ? 'wheel-live' : ''}`}
        style={{
          padding: 7,
          background: 'conic-gradient(from 0deg, var(--primary), var(--accent), var(--violet), var(--gold), var(--primary))',
          boxShadow: '0 20px 50px -18px var(--ring-primary)',
        }}
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-[#070E0B]">
          <svg
            viewBox="-110 -110 220 220"
            className="w-full h-full"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: rotation ? `transform ${SPIN_MS}ms cubic-bezier(0.1, 0.72, 0.08, 1)` : 'none',
            }}
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="wheelDepth" cx="50%" cy="38%" r="72%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
                <stop offset="62%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
              </radialGradient>
            </defs>

            {slices.map((s) => {
              const skin = SLICE[s.id] || SLICE.none;
              const dim = s.eligible === false;
              const [lx, ly] = polar(s.mid, R * 0.55);
              const [ix, iy] = polar(s.mid, R * 0.79);
              return (
                <g key={s.id} opacity={dim ? 0.42 : 1}>
                  <path d={slicePath(s.start, s.end)} fill={skin.fill} stroke="#070E0B" strokeWidth="1.4" />
                  <PrizeIcon kind={s.kind} color={skin.text} x={ix} y={iy} />
                  <text
                    x={lx}
                    y={ly}
                    fill={skin.text}
                    fontSize={s.short.length > 6 ? 10 : 14}
                    fontWeight="800"
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                  >
                    {s.short}
                  </text>
                </g>
              );
            })}

            <circle cx="0" cy="0" r={R} fill="url(#wheelDepth)" pointerEvents="none" />
          </svg>
        </div>
      </div>

      {/* Rim lamps */}
      <span aria-hidden="true" className="absolute inset-0">
        {Array.from({ length: 20 }, (_, i) => {
          const angle = (360 / 20) * i;
          return (
            <span
              key={i}
              className="wheel-lamp absolute w-1.5 h-1.5 rounded-full bg-white"
              style={{
                left: '50%',
                top: '50%',
                transform: `rotate(${angle}deg) translateY(calc(${size} / -2 + 3.5px)) translate(-50%, -50%)`,
                animationDelay: `${(i % 10) * 0.1}s`,
              }}
            />
          );
        })}
      </span>

      {/* Hub */}
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-on-primary z-10"
        style={{
          width: '22%',
          height: '22%',
          background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
          boxShadow: '0 0 0 5px #070E0B, 0 6px 20px rgba(0,0,0,0.55)',
        }}
      >
        <svg className="w-1/2 h-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="18.5" r="2.5" />
          <path d="M10 16.4L6.5 3.5h11L14 16.4M9.6 3.5l1.3 12.6M14.4 3.5l-1.3 12.6M7.6 8h8.8" />
        </svg>
      </span>
    </div>
  );
};

export default LuckyWheel;
