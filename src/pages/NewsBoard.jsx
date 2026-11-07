import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/formatters';
import CommentSection from '../components/CommentSection';
import PostReaction from '../components/PostReaction';
import { getGuestId, getGuestName } from '../utils/guest';

const NewsBoard = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSeason, setSelectedSeason] = useState('Tất cả');
  const [sortOrder, setSortOrder] = useState('newest');
  const [availableSeasons, setAvailableSeasons] = useState(['Tất cả']);

  // Form state
  const [season, setSeason] = useState('Season Mới');
  const [isPosting, setIsPosting] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [showComposer, setShowComposer] = useState(false);

  // Block Builder State
  const [blocks, setBlocks] = useState([
    { type: 'text', content: '', isBold: true, fontSize: 'text-lg', file: null, previewUrl: '' },
  ]);

  const [selectedImage, setSelectedImage] = useState(null);

  // Deep link: /news?post=<id> scrolls to that post and highlights it once
  const [searchParams] = useSearchParams();
  const targetPostId = searchParams.get('post');
  const [highlightId, setHighlightId] = useState(null);
  const handledTarget = useRef(null);

  useEffect(() => {
    if (!targetPostId || loading || handledTarget.current === targetPostId) return undefined;
    const el = document.getElementById(`post-${targetPostId}`);
    if (!el) return undefined;
    handledTarget.current = targetPostId;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setHighlightId(targetPostId);
    const t = setTimeout(() => setHighlightId(null), 3500);
    return () => clearTimeout(t);
  }, [targetPostId, loading, posts]);

  const handleCopyLink = async (postId) => {
    const url = `${window.location.origin}/news?post=${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Đã sao chép liên kết bài viết');
    } catch {
      window.prompt('Sao chép liên kết bài viết:', url);
    }
  };

  useEffect(() => {
    fetchPosts(true);
  }, [selectedSeason, sortOrder]);

  const fetchPosts = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await api.get('/posts', {
        params: { season: selectedSeason, sort: sortOrder },
      });
      setPosts(res.data.data);

      if (selectedSeason === 'Tất cả') {
        const uniqueSeasons = ['Tất cả', ...new Set(res.data.data.map((p) => p.season))].filter(Boolean);
        setAvailableSeasons(uniqueSeasons);
      }
    } catch (error) {
      toast.error('Không thể tải bảng tin');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const addTextBlock = () => {
    setBlocks([
      ...blocks,
      { type: 'text', content: '', isBold: false, fontSize: 'text-base', file: null, previewUrl: '' },
    ]);
  };

  const addImageBlock = () => {
    setBlocks([...blocks, { type: 'image', file: null, content: '', previewUrl: '' }]);
  };

  const removeBlock = (index) => {
    const newBlocks = [...blocks];
    newBlocks.splice(index, 1);
    setBlocks(newBlocks);
  };

  const updateBlock = (index, field, value) => {
    const newBlocks = [...blocks];
    newBlocks[index][field] = value;
    setBlocks(newBlocks);
  };

  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh không được vượt quá 5MB');
      return;
    }

    const newBlocks = [...blocks];
    newBlocks[index].file = file;
    newBlocks[index].previewUrl = URL.createObjectURL(file);
    setBlocks(newBlocks);
  };

  const handleEdit = (post) => {
    setEditingPostId(post._id);
    setSeason(post.season);
    setShowComposer(true);
    const editBlocks = post.blocks.map((b) => ({
      type: b.type,
      content: b.content || '',
      isBold: b.isBold || false,
      fontSize: b.fontSize || 'text-base',
      file: null,
      previewUrl: b.type === 'image' ? b.content : '',
    }));
    setBlocks(editBlocks);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setShowComposer(false);
    setSeason('Season Mới');
    setBlocks([{ type: 'text', content: '', isBold: true, fontSize: 'text-lg', file: null, previewUrl: '' }]);
  };

  const handlePost = async (e) => {
    e.preventDefault();

    const hasContent = blocks.some(
      (b) => (b.type === 'text' && b.content.trim()) || (b.type === 'image' && (b.file || b.content))
    );

    if (!hasContent) {
      toast.error('Vui lòng nhập nội dung bài viết hoặc thêm ảnh');
      return;
    }

    setIsPosting(true);
    const formData = new FormData();
    formData.append('season', season);

    let blocksData = [];
    let fileIndex = 0;

    blocks.forEach((b) => {
      if (b.type === 'text') {
        if (b.content.trim()) {
          blocksData.push({ type: 'text', content: b.content, isBold: b.isBold, fontSize: b.fontSize });
        }
      } else if (b.type === 'image') {
        if (b.file) {
          blocksData.push({ type: 'image', fileIndex });
          formData.append('images', b.file);
          fileIndex++;
        } else if (b.content) {
          blocksData.push({ type: 'image', content: b.content });
        }
      }
    });

    formData.append('blocks', JSON.stringify(blocksData));

    try {
      if (editingPostId) {
        await api.put(`/posts/${editingPostId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Sửa bài viết thành công!');
      } else {
        await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Đăng bài thành công!');
      }
      handleCancelEdit();
      fetchPosts(false);
    } catch (error) {
      toast.error('Lỗi khi lưu bài viết');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa bài này?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      toast.success('Xóa bài thành công');
      fetchPosts(false);
    } catch (error) {
      toast.error('Lỗi khi xóa bài');
    }
  };

  const handleReactPost = async (postId, type) => {
    try {
      const guestId = user ? undefined : getGuestId();
      const guestName = user ? undefined : getGuestName();
      await api.post(`/posts/${postId}/react`, { type, guestId, guestName });
      fetchPosts(false);
    } catch (error) {
      toast.error('Lỗi thả cảm xúc');
    }
  };

  const totalReactions = posts.reduce((sum, p) => sum + (p.reactions?.length || 0), 0);

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-slide-up">
      {/* ====================================================================
          HERO BANNER
          ==================================================================== */}
      <section className="glow-border glass-card p-6 sm:p-8 lg:p-10 relative overflow-hidden">
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-25"
          style={{ background: 'var(--accent)' }}
        />
        <div
          className="absolute -bottom-24 -left-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: 'var(--primary)' }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 pl-2.5 pr-3.5 py-1 rounded-full bg-accent/12 border border-accent/30 text-accent text-xs font-extrabold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Saturday Badminton Feed
            </div>

            <h1 className="font-display text-[clamp(1.85rem,4vw,3rem)] font-extrabold text-main m-0 leading-tight">
              Bảng tin <span className="grad-text">Câu Lạc Bộ & Giải Đấu</span>
            </h1>

            <p className="text-sm sm:text-[15px] text-muted leading-relaxed m-0">
              Cập nhật thông báo mới nhất, thể lệ thi đấu, hình ảnh highlight trên sân và bình luận giao lưu cùng anh em{' '}
              <strong className="text-main font-semibold">Saturday Badminton Club</strong>.
            </p>
          </div>

          {/* Right Quick Stats & Action */}
          <div className="w-full lg:w-auto flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-4 bg-surface/80 backdrop-blur-md border border-border-color rounded-2xl px-4 py-3 flex-1 sm:flex-initial">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">Bài đăng</span>
                <span className="font-display text-xl font-black text-main">{posts.length}</span>
              </div>
              <div className="w-px h-8 bg-border-color" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">Tương tác</span>
                <span className="font-display text-xl font-black text-primary">{totalReactions}</span>
              </div>
            </div>

            <Link to="/tournament" className="btn-secondary py-3 px-4 text-xs sm:text-sm shrink-0">
              🏆 Xem BXH Giải đấu
            </Link>

            {user?.role === 'admin' && (
              <button
                type="button"
                onClick={() => setShowComposer((prev) => !prev)}
                className="btn-primary py-3 px-5 text-xs sm:text-sm cursor-pointer shrink-0"
              >
                ✍️ {showComposer ? 'Đóng khung đăng' : 'Đăng bài mới'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ====================================================================
          MAIN LAYOUT: SIDEBAR + FEED
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr] gap-6 lg:gap-8 items-start">
        {/* Left Sticky Filter Panel */}
        <aside className="lg:sticky lg:top-24 space-y-5">
          {/* Season Filter Card */}
          <div className="glass-card p-5">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-muted mb-3.5 flex items-center gap-2 m-0">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Chuyên mục / Season</span>
            </h3>

            <div className="flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              {availableSeasons.map((s) => {
                const active = selectedSeason === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSeason(s)}
                    className={`px-3.5 py-2.5 rounded-xl transition-all text-xs sm:text-sm font-bold cursor-pointer flex items-center justify-between gap-2 whitespace-nowrap ${
                      active
                        ? 'bg-linear-to-r from-primary to-primary-light text-on-primary shadow-md shadow-primary/20'
                        : 'bg-surface/60 hover:bg-surface-hover text-muted hover:text-main border border-transparent'
                    }`}
                  >
                    <span>{s}</span>
                    {active && <span className="w-2 h-2 rounded-full bg-on-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort Order Card */}
          <div className="glass-card p-5">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-muted mb-3.5 flex items-center gap-2 m-0">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <span>Thứ tự hiển thị</span>
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {[
                { id: 'newest', label: 'Mới nhất trước', desc: 'Bài vừa đăng lên đầu' },
                { id: 'oldest', label: 'Cũ nhất trước', desc: 'Theo dòng thời gian' },
              ].map((opt) => {
                const active = sortOrder === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSortOrder(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-primary/12 border-primary/40 text-main'
                        : 'bg-surface/50 border-border-color text-muted hover:text-main'
                    }`}
                  >
                    <span className="block text-xs sm:text-sm font-bold">{opt.label}</span>
                    <span className="block text-[11px] text-muted mt-0.5">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Main Feed Column */}
        <div className="space-y-6 pb-12 min-w-0">
          {/* Admin Post Composer */}
          {user?.role === 'admin' && (showComposer || editingPostId) && (
            <div
              className={`glass-card p-5 sm:p-7 border-t-4 animate-fade-in ${
                editingPostId ? 'border-t-warn' : 'border-t-primary'
              }`}
            >
              <div className="flex items-center justify-between mb-5 border-b border-border-color pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                    Quản trị viên
                  </span>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-main m-0">
                    {editingPostId ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs font-bold text-danger bg-danger/10 hover:bg-danger/20 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
                >
                  ✕ Đóng
                </button>
              </div>

              <form onSubmit={handlePost} className="space-y-5">
                {/* Blocks Container */}
                <div className="space-y-4">
                  {blocks.map((block, index) => (
                    <div
                      key={index}
                      className="relative bg-surface/70 p-4 rounded-2xl border border-border-color group transition-colors hover:border-primary/35"
                    >
                      {blocks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBlock(index)}
                          className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-danger text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                          title="Xóa khối này"
                        >
                          ✕
                        </button>
                      )}

                      {block.type === 'text' && (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-3 items-center justify-between">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary bg-primary/12 px-2.5 py-1 rounded-lg">
                              Đoạn văn #{index + 1}
                            </span>

                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-main bg-card px-3 py-1.5 rounded-lg border border-border-color">
                                <input
                                  type="checkbox"
                                  checked={block.isBold}
                                  onChange={(e) => updateBlock(index, 'isBold', e.target.checked)}
                                  className="accent-primary rounded"
                                />
                                In đậm (Bold)
                              </label>

                              <select
                                className="input-field py-1.5 px-3 text-xs bg-card w-auto"
                                value={block.fontSize}
                                onChange={(e) => updateBlock(index, 'fontSize', e.target.value)}
                              >
                                <option value="text-sm">Cỡ nhỏ</option>
                                <option value="text-base">Bình thường</option>
                                <option value="text-lg">Cỡ lớn</option>
                                <option value="text-xl">Rất lớn</option>
                                <option value="text-2xl">Tiêu đề chính</option>
                              </select>
                            </div>
                          </div>

                          <textarea
                            value={block.content}
                            onChange={(e) => updateBlock(index, 'content', e.target.value)}
                            placeholder="Nhập nội dung thông báo, kết quả hoặc câu chuyện..."
                            className={`input-field w-full min-h-[96px] resize-y ${
                              block.isBold ? 'font-bold' : ''
                            } ${block.fontSize}`}
                          />
                        </div>
                      )}

                      {block.type === 'image' && (
                        <div className="space-y-3">
                          <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-accent bg-accent/12 px-2.5 py-1 rounded-lg">
                            Hình ảnh #{index + 1}
                          </span>

                          <div className="border-2 border-dashed border-border-color rounded-2xl p-4 text-center hover:bg-bg-main/60 transition-colors">
                            {block.previewUrl ? (
                              <div className="relative inline-block">
                                <img
                                  src={block.previewUrl}
                                  alt="preview"
                                  className="max-h-[320px] rounded-xl shadow-md object-contain"
                                />
                                <label className="absolute bottom-3 right-3 btn-secondary bg-card/90 backdrop-blur-md text-xs py-1.5 px-3 cursor-pointer shadow-lg">
                                  📷 Đổi ảnh khác
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(index, e)}
                                  />
                                </label>
                              </div>
                            ) : (
                              <label className="cursor-pointer flex flex-col items-center justify-center gap-2 py-8">
                                <div className="w-12 h-12 rounded-2xl bg-primary/12 text-primary flex items-center justify-center">
                                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.8}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                                <span className="text-primary font-bold text-sm hover:underline">
                                  Nhấn để tải ảnh lên (Tối đa 5MB)
                                </span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => handleImageChange(index, e)}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={addTextBlock}
                    className="btn-secondary text-xs sm:text-sm py-2 px-4 border-dashed"
                  >
                    + Thêm đoạn văn bản
                  </button>
                  <button
                    type="button"
                    onClick={addImageBlock}
                    className="btn-secondary text-xs sm:text-sm py-2 px-4 border-dashed"
                  >
                    + Thêm hình ảnh
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end justify-between pt-4 border-t border-border-color">
                  <div className="w-full sm:w-64">
                    <label className="block text-[11px] font-extrabold text-muted mb-1.5 uppercase tracking-wider">
                      Nhãn Mùa giải / Chuyên mục
                    </label>
                    <input
                      type="text"
                      value={season}
                      onChange={(e) => setSeason(e.target.value)}
                      placeholder="VD: Season 2, Thông báo..."
                      className="input-field w-full text-sm py-2.5"
                    />
                  </div>

                  <button type="submit" disabled={isPosting} className="btn-primary py-2.5 px-8 text-sm shadow-md">
                    {isPosting ? 'Đang xuất bản...' : editingPostId ? '💾 Lưu cập nhật' : '🚀 Đăng lên Bảng tin'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Posts Feed */}
          {loading ? (
            <div className="space-y-5">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="glass-card p-6 space-y-4">
                  <div className="flex items-center gap-3.5">
                    <div className="skeleton w-12 h-12 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="skeleton h-4 w-40" />
                      <div className="skeleton h-3 w-28" />
                    </div>
                  </div>
                  <div className="skeleton h-24 w-full rounded-2xl" />
                  <div className="skeleton h-64 w-full rounded-2xl" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="glass-card p-12 text-center text-muted border-dashed">
              <div className="w-16 h-16 rounded-full bg-surface border border-border-color flex items-center justify-center mx-auto mb-3 text-3xl">
                📭
              </div>
              <h3 className="font-display font-bold text-lg text-main mb-1">Chưa có bài viết nào</h3>
              <p className="text-xs sm:text-sm text-muted m-0">
                Hiện chưa có bài đăng nào trong chuyên mục <strong className="text-main">{selectedSeason}</strong>.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post._id}
                id={`post-${post._id}`}
                className={`glass-card p-5 sm:p-7 overflow-hidden transition-all hover:border-primary/35 relative scroll-mt-24 ${
                  highlightId === post._id ? 'ring-2 ring-primary shadow-[0_0_40px_var(--ring-primary)]' : ''
                }`}
              >
                {/* Post Author & Meta Header */}
                <header className="flex justify-between items-start gap-3 mb-5 pb-4 border-b border-border-light">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-2xl overflow-hidden shrink-0 border-2 border-primary/35 bg-surface shadow-sm">
                      {post.author?.avatarUrl ? (
                        <img src={post.author.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <img
                          src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(
                            post.author?.name || 'admin'
                          )}`}
                          alt="avatar"
                          className="w-full h-full object-cover p-1 bg-surface"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-display font-extrabold text-main text-base sm:text-lg m-0 truncate">
                          {post.author?.name || 'Ban Chủ Nhiệm CLB'}
                        </h4>
                        <span className="badge-violet text-[10px] uppercase tracking-wider">Ban Tổ Chức</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted mt-1">
                        <span className="inline-flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
                            <path strokeLinecap="round" strokeWidth={1.8} d="M12 7v5l3 2" />
                          </svg>
                          {formatDate(post.createdAt)}
                        </span>
                        <span>•</span>
                        <span className="bg-primary/12 text-primary border border-primary/25 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                          {post.season}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(post._id)}
                      className="w-9 h-9 rounded-xl bg-surface text-muted hover:text-primary hover:bg-primary/12 flex items-center justify-center transition-colors cursor-pointer"
                      title="Sao chép liên kết bài viết"
                      aria-label="Sao chép liên kết bài viết"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66l-1 1M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 005.66 5.66l1-1" />
                      </svg>
                    </button>
                  {user?.role === 'admin' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleEdit(post)}
                        className="w-9 h-9 rounded-xl bg-surface text-muted hover:text-primary hover:bg-primary/12 flex items-center justify-center transition-colors cursor-pointer"
                        title="Sửa bài viết"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(post._id)}
                        className="w-9 h-9 rounded-xl bg-surface text-muted hover:text-danger hover:bg-danger/12 flex items-center justify-center transition-colors cursor-pointer"
                        title="Xóa bài viết"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                  </div>
                </header>

                {/* Post Content Blocks */}
                <div className="space-y-4">
                  {post.blocks &&
                    post.blocks.map((block, idx) => {
                      if (block.type === 'text') {
                        const isHeading = block.fontSize === 'text-2xl' || block.fontSize === 'text-xl';
                        return (
                          <p
                            key={idx}
                            className={`whitespace-pre-wrap text-main leading-relaxed m-0 ${
                              isHeading ? 'font-display tracking-tight' : ''
                            } ${block.isBold ? 'font-bold' : ''} ${block.fontSize || 'text-base'}`}
                          >
                            {block.content}
                          </p>
                        );
                      } else if (block.type === 'image' && block.content) {
                        return (
                          <div
                            key={idx}
                            className="my-4 rounded-2xl overflow-hidden border border-border-color bg-bg-main/50 group/img relative"
                          >
                            <img
                              src={block.content}
                              alt="Hình ảnh bài viết"
                              className="w-full max-h-[580px] object-cover cursor-zoom-in transition-transform duration-500 group-hover/img:scale-[1.01]"
                              onClick={() => setSelectedImage(block.content)}
                            />
                            <button
                              type="button"
                              onClick={() => setSelectedImage(block.content)}
                              className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-xl opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer flex items-center gap-1.5"
                            >
                              🔍 Phóng to
                            </button>
                          </div>
                        );
                      }
                      return null;
                    })}
                </div>

                {/* Post Reactions Bar */}
                <PostReaction
                  post={post}
                  onReact={handleReactPost}
                  currentUser={user}
                  guestId={!user ? getGuestId() : undefined}
                />

                {/* Comment Section */}
                <CommentSection postId={post._id} />
              </article>
            ))
          )}
        </div>
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      {selectedImage &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 backdrop-blur-md animate-fade-in"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
              <button
                className="absolute -top-2 right-0 sm:top-4 sm:right-4 text-white hover:text-danger bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-colors z-10 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={selectedImage}
                alt="Phóng to"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default NewsBoard;
