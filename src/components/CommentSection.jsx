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
      // Build tree
      const data = res.data.data;
      const map = {};
      const roots = [];
      
      data.forEach(c => {
        map[c._id] = { ...c, replies: [] };
      });
      
      data.forEach(c => {
        if (c.parentComment) {
          if (map[c.parentComment]) {
            map[c.parentComment].replies.push(map[c._id]);
          } else {
            roots.push(map[c._id]); // fallback
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
        guestName: user ? undefined : getGuestName()
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
        guestName: user ? undefined : getGuestName()
      });
      fetchComments();
    } catch (error) {
      toast.error('Lỗi khi trả lời bình luận');
    }
  };

  const handleReact = async (commentId, type) => {
    try {
      const guestId = user ? undefined : getGuestId();
      await api.post(`/comments/react/${commentId}`, { type, guestId });
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
    return <div className="mt-4 flex justify-center"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="mt-6 pt-4 border-t border-border-color/50">
      <h4 className="font-bold text-main mb-4 flex items-center gap-2 text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
        Bình luận {comments.length > 0 && `(${comments.reduce((acc, c) => acc + 1 + c.replies.length, 0)})`}
      </h4>

      {/* Main Comment Input */}
      <form onSubmit={handlePostComment} className="flex gap-3 mb-6">
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-border-color bg-surface shadow-sm">
          {user ? (
            user.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <img src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(user.name || 'user')}`} alt="avatar" className="w-full h-full object-cover p-1" />
            )
          ) : (
            <img src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(getGuestName())}`} alt="avatar" className="w-full h-full object-cover p-1" />
          )}
        </div>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? "Viết bình luận công khai..." : `Bình luận dưới tên "${getGuestName()}"...`}
            className="input-field flex-1 !py-2.5 !rounded-full !px-4 text-sm"
          />
          <button 
            type="submit"
            disabled={!newComment.trim()}
            className="w-11 h-11 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-50 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 translate-x-px translate-y-px" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-1">
        {comments.map(comment => (
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
