import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const STATUS = {
  live: { label: 'Đang hiển thị cho mọi người', cls: 'bg-primary/15 text-primary border-primary/30', dot: '🟢' },
  disabled: { label: 'Đang tắt', cls: 'bg-surface text-muted border-border-color', dot: '⚫' },
  scheduled: { label: 'Chưa đến giờ bắt đầu', cls: 'bg-warn/15 text-warn border-warn/30', dot: '🟡' },
  expired: { label: 'Đã hết hạn', cls: 'bg-danger/15 text-danger border-danger/30', dot: '🔴' },
};

// <input type="datetime-local"> works in local time without a zone
const toInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const toIso = (value) => (value ? new Date(value).toISOString() : null);

const PopupSettingsPanel = () => {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('live');
  const [isActive, setIsActive] = useState(true);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [postId, setPostId] = useState('');

  const apply = (data) => {
    setStatus(data.status || 'live');
    setIsActive(Boolean(data.isActive));
    setStartAt(toInput(data.startAt));
    setEndAt(toInput(data.endAt));
    setPostId(data.postId || '');
  };

  useEffect(() => {
    let alive = true;
    api
      .get('/popup-config')
      .then((res) => alive && apply(res.data.data))
      .catch(() => toast.error('Không tải được cấu hình popup'))
      .finally(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, []);

  const handleSave = async () => {
    if (startAt && endAt && new Date(endAt) <= new Date(startAt)) {
      toast.error('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }
    setSaving(true);
    try {
      const res = await api.put('/popup-config', {
        isActive,
        startAt: toIso(startAt),
        endAt: toIso(endAt),
        postId,
      });
      apply(res.data.data);
      toast.success('Đã lưu cấu hình popup');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu cấu hình popup');
    } finally {
      setSaving(false);
    }
  };

  const st = STATUS[status] || STATUS.live;
  const fieldCls =
    'w-full h-11 px-3 rounded-xl bg-surface border border-border-color text-main text-sm focus:outline-none focus:border-primary';

  return (
    <div className="animate-fade-in space-y-6">
      <div className="glass-card p-6 border-l-4 border-l-primary flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-main m-0 flex items-center gap-2">
            <span>🎉</span> Popup chúc mừng kết quả giải
          </h3>
          <p className="text-sm text-muted mt-1 m-0">
            Hiện mỗi lần mở trang (kể cả khách chưa đăng nhập) khi đang bật và nằm trong khoảng thời gian bên dưới.
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap ${st.cls}`}>
          {st.dot} {st.label}
        </span>
      </div>

      <div className="glass-card p-6 space-y-6">
        {/* On / off */}
        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <span>
            <span className="block font-bold text-main">Bật popup</span>
            <span className="block text-xs text-muted mt-0.5">Tắt là ẩn ngay với tất cả mọi người, bất kể thời gian.</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setIsActive((v) => !v)}
            disabled={!loaded}
            className={`relative w-14 h-8 rounded-full transition-colors cursor-pointer shrink-0 ${
              isActive ? 'bg-primary' : 'bg-surface-hover border border-border-color'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                isActive ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </label>

        {/* Window */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-main mb-1.5">Bắt đầu hiển thị</label>
            <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className={fieldCls} />
            <div className="flex items-center justify-between mt-1.5 text-xs text-muted">
              <span>Để trống = hiển thị ngay</span>
              {startAt && (
                <button type="button" onClick={() => setStartAt('')} className="text-primary hover:underline cursor-pointer">
                  Xóa
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-main mb-1.5">Tự động tắt lúc</label>
            <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className={fieldCls} />
            <div className="flex items-center justify-between mt-1.5 text-xs text-muted">
              <span>Để trống = không giới hạn</span>
              {endAt && (
                <button type="button" onClick={() => setEndAt('')} className="text-primary hover:underline cursor-pointer">
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Link target */}
        <div>
          <label className="block text-sm font-semibold text-main mb-1.5">Bài viết "Xem chi tiết"</label>
          <input
            type="text"
            value={postId}
            onChange={(e) => setPostId(e.target.value)}
            placeholder="Dán ID bài viết hoặc link dạng .../news?post=..."
            className={fieldCls}
          />
          <p className="text-xs text-muted mt-1.5 m-0">
            Ở Bảng tin, bấm nút 🔗 trên bài viết để lấy link, rồi dán vào đây. Để trống = chỉ mở trang Bảng tin.
          </p>
        </div>

        <button type="button" onClick={handleSave} disabled={saving || !loaded} className="btn-primary py-2.5 px-6 text-sm">
          {saving ? 'Đang lưu…' : 'Lưu cấu hình popup'}
        </button>
      </div>
    </div>
  );
};

export default PopupSettingsPanel;
