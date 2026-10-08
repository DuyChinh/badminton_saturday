import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import CommentItem from './CommentItem';
import toast from 'react-hot-toast';
import { getGuestId, getGuestName } from '../utils/guest';

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${postId}`);
      const data = res.data.data;
      const map = {};
      const roots = [];

      data.forEach((c) => {
        map[c._id] = { ...c, replies: [] };
      });

      data.forEach((c) => {
        if (c.parentComment) {
          if (map[c.parentComment]) {
            map[c.parentComment].replies.push(map[c._id]);
          } else {
            roots.push(map[c._id]);
          }
        } else {
          roots.push(map[c._id]);
        }
      });

      setComments(roots);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const payload = {
        content: newComment.trim(),
        guestName: user ? undefined : getGuestName(),
      };
      await api.post(`/comments/${postId}`, payload);
      setNewComment('');
      fetchComments();
    } catch (error) {
      toast.error('Lỗi khi đăng bình luận');
    }
  };

  const handleReply = async (parentCommentId, replyContent) => {
    try {
      await api.post(`/comments/${postId}`, {
        content: replyContent,
        parentCommentId,
        guestName: user ? undefined : getGuestName(),
      });
      fetchComments();
    } catch (error) {
      toast.error('Lỗi khi trả lời bình luận');
    }
  };

  const handleReact = async (commentId, type) => {
    try {
      const guestId = user ? undefined : getGuestId();
      const guestName = user ? undefined : getGuestName();
      await api.post(`/comments/react/${commentId}`, { type, guestId, guestName });
      fetchComments();
    } catch (error) {
      toast.error('Lỗi khi thả cảm xúc');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      fetchComments();
    } catch (error) {
      toast.error('Lỗi khi xóa bình luận');
    }
  };

  if (loading) {
    return (
      <div className="mt-4 flex justify-center">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const totalComments = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0);

  return (
    <div className="mt-5 pt-4 border-t border-border-light">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-display font-bold text-main flex items-center gap-2 text-sm m-0">
          <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
            />
          </svg>
          <span>Thảo luận</span>
          {totalComments > 0 && (
            <span className="text-xs font-mono font-bold bg-surface px-2 py-0.5 rounded-full text-muted border border-border-color">
              {totalComments}
            </span>
          )}
        </h4>
      </div>

      {/* Main Comment Input */}
      <form onSubmit={handlePostComment} className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 border border-border-color bg-surface shadow-xs">
          {user ? (
            user.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <img
                src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(user.name || 'user')}`}
                alt="avatar"
                className="w-full h-full object-cover p-1"
              />
            )
          ) : (
            <img
              src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(getGuestName())}`}
              alt="avatar"
              className="w-full h-full object-cover p-1"
            />
          )}
        </div>
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? 'Viết bình luận giao lưu...' : `Bình luận dưới tên "${getGuestName()}"...`}
            className="input-field flex-1 !py-2.5 !rounded-xl !px-4 text-xs sm:text-sm"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="h-10 px-4 bg-primary text-on-primary font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-45 shadow-sm hover:brightness-105 transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">Gửi</span>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-1">
        {comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            onReply={handleReply}
            onReact={handleReact}
            onDelete={handleDelete}
            currentUser={user}
            level={0}
          />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
