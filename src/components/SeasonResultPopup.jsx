import { useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const CONFETTI_COLORS = ['#E8C14A', '#34D399', '#5EEAD4', '#A78BFA', '#F9A8D4', '#FFB45E', '#FFFFFF'];

const NEWS_URL_LABEL = 'badminton-saturday.onrender.com/news';

// Group photos shown in the free corners beside the champion card
const CDN = 'https://res.cloudinary.com/dv7w1z8si/image/upload';
const cdn = (width, path) => `${CDN}/w_${width},q_auto,f_auto/${path}`;
const PHOTOS = {
  silver: { path: 'v1794046474/edumap/posts/dqpemvdwfp7aio0tazjy.jpg', pos: '50% 42%', alt: 'Ảnh kỷ niệm Season 2 - Á quân' },
  bronze: { path: 'v1794046473/edumap/posts/rkzwhlu1x0b2p4j0tmjn.jpg', pos: '50% 26%', alt: 'Ảnh kỷ niệm Season 2 - Giải ba' },
};

const PODIUM = [
  {
    key: 'silver',
    place: 2,
    badge: 'Á quân',
    medal: '🥈',
    team: ['Nguyễn Đình Tới', 'Cao Xuân Thông'],
    rewards: [
      { type: 'bottle', qty: 2, label: 'Revive Pro' },
      { type: 'voucher', qty: 2, value: '50%', label: 'Voucher 50% tiền sân' },
    ],
  },
  {
    key: 'gold',
    place: 1,
    badge: 'Quán quân',
    medal: '🥇',
    team: ['Đoàn Duy Chinh', 'Trần Thế Chiến'],
    rewards: [
      { type: 'medal', label: 'Huy chương vàng' },
      { type: 'bottle', qty: 4, label: 'Revive Pro' },
      { type: 'voucher', qty: 1, value: '100%', label: 'Voucher 100% tiền sân' },
    ],
  },
  {
    key: 'bronze',
    place: 3,
    badge: 'Giải ba',
    medal: '🥉',
    team: ['Phạm Đức Mạnh', 'Vũ Quang Anh'],
    rewards: [{ type: 'privilege', label: 'Đặc quyền trao giải cho Quán quân & Á quân' }],
  },
];

// Match members by name regardless of case or diacritics
const norm = (s = '') =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim();

/* ---------- Reward art ---------- */

const ReviveBottle = () => {
  const uid = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 28 56" className="season-art" aria-hidden="true">
      <defs>
        <linearGradient id={`liq${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0f9f6e" />
          <stop offset="0.5" stopColor="#34d399" />
          <stop offset="1" stopColor="#0b7f58" />
        </linearGradient>
        <linearGradient id={`cap${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f3c740" />
          <stop offset="1" stopColor="#c89712" />
        </linearGradient>
      </defs>
      <rect x="9.5" y="1.5" width="9" height="7" rx="2" fill={`url(#cap${uid})`} />
      <path d="M10 8.5h8v5c0 1.6 5 3.4 5 8.5v28a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V22c0-5.100 5-6.900 5-8.500z" fill={`url(#liq${uid})`} stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
      <rect x="5.600" y="27" width="16.800" height="15" fill="#06281c" opacity="0.92" />
      <path d="M14 29.500c1.800 2.600 2.800 4 2.800 5.300a2.800 2.800 0 0 1-5.600 0c0-1.300 1-2.700 2.800-5.300z" fill="#E8C14A" />
      <text x="14" y="40.800" textAnchor="middle" fontSize="4.200" fontWeight="800" fill="#d9f7ea" fontFamily="inherit">
        REVIVE
      </text>
      <path d="M8.500 24c0 6 0 18 .4 25" stroke="rgba(255,255,255,0.45)" strokeWidth="1.400" strokeLinecap="round" fill="none" />
    </svg>
  );
};

const VoucherTicket = ({ value }) => {
  const uid = useId().replace(/:/g, '');
  const full = value === '100%';
  const [c1, c2] = full ? ['#f472b6', '#8b5cf6'] : ['#2dd4bf', '#0ea5e9'];
  return (
    <svg viewBox="0 0 76 46" className="season-art season-art-wide" aria-hidden="true">
      <defs>
        <linearGradient id={`v${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
      </defs>
      <path
        d="M5 2h66a3 3 0 0 1 3 3v10.500a7.500 7.500 0 0 0 0 15V41a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V30.500a7.500 7.500 0 0 0 0-15V5a3 3 0 0 1 3-3z"
        fill={`url(#v${uid})`}
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="1"
      />
      <path d="M56 5v36" stroke="rgba(255,255,255,0.8)" strokeWidth="1.200" strokeDasharray="2.500 2.500" />
      <text x="30" y="26" textAnchor="middle" fontSize={full ? 15 : 16} fontWeight="900" fill="#fff" fontFamily="inherit">
        {value}
      </text>
      <text x="30" y="13.500" textAnchor="middle" fontSize="5" fontWeight="800" letterSpacing="1.200" fill="rgba(255,255,255,0.92)" fontFamily="inherit">
        VOUCHER
      </text>
      <text x="30" y="36.500" textAnchor="middle" fontSize="5" fontWeight="700" fill="rgba(255,255,255,0.92)" fontFamily="inherit">
        TIỀN SÂN
      </text>
      <text x="65" y="29" textAnchor="middle" fontSize="12" fontFamily="inherit">
        🏸
      </text>
    </svg>
  );
};

const RewardArt = ({ type, value }) => {
  if (type === 'bottle') return <ReviveBottle />;
  if (type === 'voucher') return <VoucherTicket value={value} />;
  return (
    <span className="season-art season-art-emoji" aria-hidden="true">
      {type === 'medal' ? '🥇' : '🎤'}
    </span>
  );
};

const Reward = ({ r }) => (
  <li className="season-reward">
    <span className="season-art-wrap">
      <RewardArt type={r.type} value={r.value} />
      {r.qty > 1 && <span className="season-qty">×{r.qty}</span>}
    </span>
    <span className="season-reward-text">
      {r.type === 'bottle' ? (
        <>
          <b>{r.qty} chai</b> {r.label}
        </>
      ) : r.type === 'voucher' ? (
        <>
          {r.qty > 1 && <b>{r.qty} </b>}
          {r.label}
        </>
      ) : (
        r.label
      )}
    </span>
  </li>
);

const Avatar = ({ name, url }) => (
  <span className="season-avatar" title={name}>
    {url ? (
      <img src={url} alt={name} loading="lazy" />
    ) : (
      <span className="season-avatar-fallback">{name.split(' ').pop().charAt(0).toUpperCase()}</span>
    )}
  </span>
);

/**
 * Season 2 wrap-up. Opens on every page load (guests included) while the admin has it
 * switched on and the current time is inside the configured window (/popup-config;
 * the server decides `visible`). It closes with the X button, the backdrop, the footer
 * button or Esc. Dismissal is deliberately not persisted, so a refresh shows it again;
 * it lives at app level so moving between routes does not re-open it.
 * If the config cannot be fetched the popup stays hidden, except on a 404 (backend not
 * updated yet), where it falls back to always-on.
 */
const SeasonResultPopup = () => {
  const [open, setOpen] = useState(false);
  const [postId, setPostId] = useState('');
  const [avatars, setAvatars] = useState({});
  const [zoom, setZoom] = useState(null);
  const close = () => setOpen(false);

  useEffect(() => {
    let alive = true;
    api
      .get('/popup-config')
      .then((res) => {
        if (!alive || !res.data?.data?.visible) return;
        setPostId(res.data.data.postId || '');
        setOpen(true);
      })
      .catch((err) => {
        // Backend without /popup-config yet (404): keep the original always-on behaviour.
        // Any other failure (offline, 5xx) leaves the popup hidden.
        if (alive && err.response?.status === 404) setOpen(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Avatars come from the public members list; initials stand in until (or unless) it loads
  useEffect(() => {
    let alive = true;
    api
      .get('/members')
      .then((res) => {
        if (!alive) return;
        const map = {};
        (res.data?.data || []).forEach((m) => {
          if (m.avatarUrl) map[norm(m.name)] = m.avatarUrl;
        });
        setAvatars(map);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const pieces = useMemo(
    () =>
      Array.from({ length: 56 }, (_, i) => ({
        id: i,
        left: `${Math.round(Math.random() * 100)}%`,
        width: [7, 9, 12][i % 3],
        height: [12, 8, 16][i % 3],
        background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        borderRadius: i % 3 === 0 ? '50%' : '2px',
        animationDelay: `${(Math.random() * 2).toFixed(2)}s`,
        animationDuration: `${(Math.random() * 2 + 3).toFixed(2)}s`,
      })),
    []
  );

  useEffect(() => {
    if (!open) return undefined;
    // Esc peels off the photo viewer first, then the popup
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (zoom) setZoom(null);
      else setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, zoom]);

  if (!open) return null;

  return (
    <>
    {createPortal(
    <div className="modal-overlay season-overlay" style={{ zIndex: 120 }} onClick={close}>
      <div className="confetti-layer fixed" aria-hidden="true" style={{ zIndex: 121 }}>
        {pieces.map(({ id, ...style }) => (
          <span key={id} style={style} className="confetti-fall" />
        ))}
      </div>

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="season-result-title"
        className="season-card"
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 122 }}
      >
        <div className="prize-rays" aria-hidden="true" />
        <div className="sheen season-sheen" aria-hidden="true" />

        <button type="button" className="season-close" onClick={close} aria-label="Đóng">
          ✕
        </button>

        <div className="season-scroll">
          <header className="season-head">
            <span className="season-eyebrow">🏸 Chung cuộc · Season 2</span>
            <h2 id="season-result-title" className="font-display season-title">
              Chúc mừng các Siêu Anh Hùng!
            </h2>
            <p className="season-lead">
              Vậy là <strong>Season 2 – 6 anh em siêu nhân</strong> đã khép lại sau những pha cầu nảy lửa, những cú
              đập để đời và vô vàn tràng cười. Dưới đây là ba đội xuất sắc nhất mùa giải.
            </p>
          </header>

          <div className="season-podium">
            {PODIUM.map((p) => (
              <div key={p.key} className={`season-col season-col-${p.key}`}>
                {PHOTOS[p.key] && (
                  <button
                    type="button"
                    className="season-photo"
                    style={{ '--i': p.place }}
                    onClick={() => setZoom(PHOTOS[p.key])}
                    aria-label="Phóng to ảnh"
                  >
                    <img
                      src={cdn(700, PHOTOS[p.key].path)}
                      alt={PHOTOS[p.key].alt}
                      loading="lazy"
                      style={{ objectPosition: PHOTOS[p.key].pos }}
                    />
                    <span className="season-photo-zoom" aria-hidden="true">🔍</span>
                  </button>
                )}
              <article className={`season-step season-${p.key}`} style={{ '--i': p.place }}>
                <span className="season-badge">{p.badge}</span>
                {p.place === 1 && (
                  <span className="season-crown" aria-hidden="true">
                    👑
                  </span>
                )}

                <div className="season-avatars">
                  {p.team.map((name) => (
                    <Avatar key={name} name={name} url={avatars[norm(name)]} />
                  ))}
                  <span className="season-medal" aria-hidden="true">
                    {p.medal}
                  </span>
                </div>

                <h3 className="season-team">
                  <span className="season-name">{p.team[0]}</span>
                  <span className="season-amp"> & </span>
                  <span className="season-name">{p.team[1]}</span>
                </h3>

                <ul className="season-rewards">
                  {p.rewards.map((r) => (
                    <Reward key={r.label + (r.qty || '')} r={r} />
                  ))}
                </ul>
              </article>
              </div>
            ))}
          </div>

          <p className="season-note">
            🎁 Nhà đầu tư Đoàn Duy Chinh đã xé Voucher 100% thành 2 Voucher 50% nhượng lại cho Á quân.
          </p>

          <p className="season-thanks">
            🎉 Cảm ơn các nhà đầu tư vàng và tất cả anh em đã cùng tạo nên một mùa giải siêu nhân đầy tiếng cười!
          </p>

          <p className="season-detail">
            Xem chi tiết tại{' '}
            <Link to={postId ? `/news?post=${postId}` : '/news'} onClick={close}>
              {NEWS_URL_LABEL}
            </Link>
          </p>

          <div className="season-actions">
            <a href="/season2-result.png" target="_blank" rel="noreferrer" className="season-link">
              Xem ảnh tổng kết
            </a>
            <button type="button" className="btn-primary season-cta" onClick={close}>
              Tuyệt vời, vào trang thôi!
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
    )}
    {zoom &&
      createPortal(
        <div className="season-lightbox" role="dialog" aria-modal="true" aria-label={zoom.alt} onClick={() => setZoom(null)}>
          <button type="button" className="season-close season-lightbox-close" onClick={() => setZoom(null)} aria-label="Đóng ảnh">
            ✕
          </button>
          <img src={cdn(1600, zoom.path)} alt={zoom.alt} onClick={(e) => e.stopPropagation()} />
        </div>,
        document.body
      )}
    </>
  );
};

export default SeasonResultPopup;
