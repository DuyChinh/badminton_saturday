import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/formatters';
import CommentSection from '../components/CommentSection';
import PostReaction from '../components/PostReaction';
import { getGuestId } from '../utils/guest';

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

  // Block Builder State
  const [blocks, setBlocks] = useState([
    { type: 'text', content: '', isBold: true, fontSize: 'text-lg', file: null, previewUrl: '' }
  ]);

  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchPosts(true);
  }, [selectedSeason, sortOrder]);

  const fetchPosts = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await api.get('/posts', {
        params: { season: selectedSeason, sort: sortOrder }
      });
      setPosts(res.data.data);
      
      if (selectedSeason === 'Tất cả') {
        const uniqueSeasons = ['Tất cả', ...new Set(res.data.data.map(p => p.season))].filter(Boolean);
        setAvailableSeasons(uniqueSeasons);
      }
    } catch (error) {
      toast.error('Không thể tải bảng tin');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const addTextBlock = () => {
    setBlocks([...blocks, { type: 'text', content: '', isBold: true, fontSize: 'text-lg', file: null, previewUrl: '' }]);
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
    // Convert post blocks to form state
    const editBlocks = post.blocks.map(b => ({
      type: b.type,
      content: b.content || '',
      isBold: b.isBold || false,
      fontSize: b.fontSize || 'text-base',
      file: null,
      previewUrl: b.type === 'image' ? b.content : ''
    }));
    setBlocks(editBlocks);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setSeason('Season Mới');
    setBlocks([{ type: 'text', content: '', isBold: true, fontSize: 'text-lg', file: null, previewUrl: '' }]);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    
    // Validate blocks
    const hasContent = blocks.some(b => 
      (b.type === 'text' && b.content.trim()) || 
      (b.type === 'image' && (b.file || b.content))
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

    blocks.forEach(b => {
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
        await api.put(`/posts/${editingPostId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
        toast.success('Sửa bài viết thành công!');
      } else {
        await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
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
      await api.post(`/posts/${postId}/react`, { type, guestId });
      fetchPosts(false);
    } catch (error) {
      toast.error('Lỗi thả cảm xúc');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="text-center mb-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-accent/20 rounded-full blur-[60px] -z-10"></div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-main mb-4 tracking-tight flex items-center justify-center gap-3">
          <span className="text-4xl">📰</span>
          Bảng tin <span className="text-accent">Giải đấu</span>
        </h1>
        <p className="text-muted text-lg max-w-xl mx-auto">
          Cập nhật tin tức, kết quả và thể lệ các giải đấu nội bộ của Saturday badminton club.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="glass-card p-5">
            <h3 className="font-bold text-main mb-4 flex items-center gap-2">
              <span>🎯</span> Mùa giải (Season)
            </h3>
            <div className="space-y-2">
              {availableSeasons.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSeason(s)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm font-medium cursor-pointer ${
                    selectedSeason === s ? 'bg-primary text-white shadow-md' : 'hover:bg-surface-hover text-muted hover:text-main'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-bold text-main mb-4 flex items-center gap-2">
              <span>⏱️</span> Sắp xếp
            </h3>
            <select 
              className="input-field w-full text-sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Mới nhất trước</option>
              <option value="oldest">Cũ nhất trước</option>
            </select>
          </div>
        </div>

        {/* Main Feed */}
        <div className="flex-1 space-y-8 pb-10 min-h-[600px]">
          
          {/* Post Form (Admin only) */}
          {user?.role === 'admin' && (
            <div className={`glass-card p-5 sm:p-7 border-l-4 ${editingPostId ? 'border-l-warning' : 'border-l-primary'}`}>
              <div className="flex items-center justify-between mb-4 border-b border-border-color pb-4">
                <h3 className="font-bold text-lg text-main flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  {editingPostId ? 'Sửa bài viết' : 'Tạo bài viết mới'}
                </h3>
                {editingPostId && (
                  <button onClick={handleCancelEdit} className="text-sm text-danger hover:underline">Hủy sửa</button>
                )}
              </div>

              <form onSubmit={handlePost} className="space-y-5">
                {/* Blocks Container */}
                <div className="space-y-4">
                  {blocks.map((block, index) => (
                    <div key={index} className="relative bg-surface p-4 rounded-xl border border-border-color group">
                      <button
                        type="button"
                        onClick={() => removeBlock(index)}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-danger text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110"
                        title="Xóa khối này"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      {block.type === 'text' && (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-3 items-center">
                            <span className="text-xs font-bold uppercase text-primary bg-primary/10 px-2 py-1 rounded">Chữ</span>
                            
                            <label className="flex items-center gap-1.5 cursor-pointer text-sm font-medium text-main">
                              <input 
                                type="checkbox" 
                                checked={block.isBold}
                                onChange={(e) => updateBlock(index, 'isBold', e.target.checked)}
                                className="rounded text-primary focus:ring-primary/50"
                              />
                              Bôi đậm
                            </label>

                            <select 
                              className="input-field py-1 px-2 text-sm bg-bg-main"
                              value={block.fontSize}
                              onChange={(e) => updateBlock(index, 'fontSize', e.target.value)}
                            >
                              <option value="text-sm">Nhỏ</option>
                              <option value="text-base">Bình thường</option>
                              <option value="text-lg">Lớn</option>
                              <option value="text-xl">Rất lớn</option>
                              <option value="text-2xl">Tiêu đề</option>
                            </select>
                          </div>
                          
                          <textarea
                            value={block.content}
                            onChange={(e) => updateBlock(index, 'content', e.target.value)}
                            placeholder="Nhập nội dung..."
                            className={`input-field w-full min-h-[80px] resize-y ${block.isBold ? 'font-bold' : ''} ${block.fontSize}`}
                          ></textarea>
                        </div>
                      )}

                      {block.type === 'image' && (
                        <div className="space-y-3">
                          <div className="flex gap-3 items-center">
                            <span className="text-xs font-bold uppercase text-success bg-success/10 px-2 py-1 rounded">Ảnh</span>
                          </div>
                          
                          <div className="border-2 border-dashed border-border-color rounded-xl p-4 text-center hover:bg-bg-main transition-colors">
                            {block.previewUrl ? (
                              <div className="relative inline-block">
                                <img src={block.previewUrl} alt="preview" className="max-h-[300px] rounded-lg shadow-sm" />
                                <label className="absolute bottom-2 right-2 btn-secondary text-xs py-1.5 px-3 cursor-pointer shadow-md">
                                  Đổi ảnh
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(index, e)} />
                                </label>
                              </div>
                            ) : (
                              <label className="cursor-pointer flex flex-col items-center justify-center gap-2 py-8">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-primary font-medium hover:underline">Bấm để chọn ảnh</span>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(index, e)} />
                              </label>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={addTextBlock} className="btn-secondary text-sm py-2 px-4 border-dashed">
                    + Thêm đoạn chữ
                  </button>
                  <button type="button" onClick={addImageBlock} className="btn-secondary text-sm py-2 px-4 border-dashed">
                    + Thêm ảnh
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-end pt-4 border-t border-border-color">
                  <div className="w-full sm:w-64">
                    <label className="block text-xs font-bold text-muted mb-1 uppercase tracking-wider">Tên Season</label>
                    <input 
                      type="text" 
                      value={season}
                      onChange={(e) => setSeason(e.target.value)}
                      placeholder="vd: Season 2"
                      className="input-field w-full text-sm py-2"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isPosting}
                    className="btn-primary py-2 px-8 w-full sm:w-auto shadow-md"
                  >
                    {isPosting ? 'Đang lưu...' : (editingPostId ? 'Cập nhật' : 'Đăng bài')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Posts List */}
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="glass-card p-10 text-center text-muted">
              <span className="text-4xl block mb-3">📭</span>
              Chưa có bài viết nào ở mục này
            </div>
          ) : (
            posts.map(post => (
              <div key={post._id} className="glass-card p-5 sm:p-7 overflow-hidden transition-all hover:border-accent/30 bg-surface relative">
                {/* Post Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-surface shadow-sm">
                      {post.author?.avatarUrl ? (
                        <img src={post.author.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <img src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(post.author?.name || 'admin')}`} alt="avatar" className="w-full h-full object-cover p-1 bg-surface" />
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-main text-lg">{post.author?.name || 'Admin'}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted mt-0.5">
                        <span>{formatDate(post.createdAt)}</span>
                        <span>•</span>
                        <span className="bg-accent/10 text-accent px-2 py-0.5 rounded font-medium text-xs">
                          {post.season}
                        </span>
                      </div>
                    </div>
                  </div>
                  {user?.role === 'admin' && (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleEdit(post)}
                        className="text-muted hover:text-primary p-2 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer"
                        title="Sửa bài viết"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(post._id)}
                        className="text-muted hover:text-danger p-2 rounded-lg hover:bg-danger/10 transition-colors cursor-pointer"
                        title="Xóa bài viết"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Post Blocks */}
                <div className="space-y-4">
                  {post.blocks && post.blocks.map((block, idx) => {
                    if (block.type === 'text') {
                      return (
                        <p 
                          key={idx} 
                          className={`whitespace-pre-wrap text-main leading-relaxed ${block.isBold ? 'font-bold' : ''} ${block.fontSize || 'text-base'}`}
                        >
                          {block.content}
                        </p>
                      );
                    } else if (block.type === 'image' && block.content) {
                      return (
                        <div key={idx} className="my-4 -mx-5 sm:mx-0">
                          <img 
                            src={block.content} 
                            alt="post content" 
                            className="w-full max-h-[600px] object-cover sm:rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => setSelectedImage(block.content)}
                          />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Post Reactions */}
                <PostReaction 
                  post={post} 
                  onReact={handleReactPost} 
                  currentUser={user} 
                  guestId={!user ? getGuestId() : undefined} 
                />

                {/* Comment Section */}
                <CommentSection postId={post._id} />

              </div>
            ))
          )}
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
            <button 
              className="absolute top-4 right-4 text-white hover:text-danger bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors z-10 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={selectedImage} 
              alt="Phóng to" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsBoard;
