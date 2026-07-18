import React, { useState } from 'react';
import { formatDate } from '../utils/formatters';

const REACTION_TYPES = [
  { id: 'like', icon: '👍', label: 'Thích' },
  { id: 'love', icon: '❤️', label: 'Yêu thích' },
  { id: 'haha', icon: '😆', label: 'Haha' },
  { id: 'wow', icon: '😮', label: 'Wow' },
  { id: 'sad', icon: '😢', label: 'Buồn' },
  { id: 'angry', icon: '😡', label: 'Phẫn nộ' }
];

const CommentItem = ({ comment, onReply, onReact, onDelete, currentUser, level = 0 }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isHoveringLike, setIsHoveringLike] = useState(false);

  const isAuthor = currentUser && comment.author && currentUser.id === comment.author._id;
  const isAdmin = currentUser && currentUser.role === 'admin';
  const canDelete = isAuthor || isAdmin;

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    // Always attach to the top-level parent to keep nesting at max 2 levels, or just attach to this comment.
    // If level >= 1, we attach to comment.parentComment (the root), else attach to comment._id
    const parentId = level >= 1 ? comment.parentComment : comment._id;
    
    await onReply(parentId, replyContent);
    setReplyContent('');
    setShowReplyInput(false);
  };

  const handleReact = (type) => {
    onReact(comment._id, type);
    setIsHoveringLike(false);
  };

  const userReaction = comment.reactions?.find(r => 
    (currentUser && (r.user?._id === currentUser?.id || r.user === currentUser?.id)) ||
    (!currentUser && r.guestId === localStorage.getItem('guestId'))
  );
  const userReactionDef = userReaction ? REACTION_TYPES.find(r => r.id === userReaction.type) : null;

  // Compute reaction summary
  const reactionCounts = {};
  comment.reactions?.forEach(r => {
    reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
  });
  const topReactions = Object.entries(reactionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);

  return (
    <div className={`flex gap-3 w-full ${level > 0 ? 'mt-4' : 'mt-6'}`}>
      {/* Avatar */}
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 border border-border-color bg-surface shadow-sm">
        {comment.author ? (
          comment.author.avatarUrl ? (
            <img src={comment.author.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <img src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(comment.author.name || 'user')}`} alt="avatar" className="w-full h-full object-cover p-1" />
          )
        ) : (
          <img src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(comment.guestName || 'guest')}`} alt="avatar" className="w-full h-full object-cover p-1" />
        )}
      </div>

      {/* Content & Actions */}
      <div className="flex-1 min-w-0">
        <div className="bg-surface border border-border-color rounded-2xl px-4 py-2.5 relative group">
          <h5 className="font-bold text-main text-sm mb-1">{comment.author?.name || comment.guestName || 'Người lạ'}</h5>
          <p className="text-sm text-main whitespace-pre-wrap leading-relaxed">{comment.content}</p>
          
          {/* Reaction Summary Pill */}
          {comment.reactions && comment.reactions.length > 0 && (
            <div className="absolute -bottom-2.5 right-2 bg-surface border border-border-color shadow-sm rounded-full px-1.5 py-0.5 flex items-center gap-1 text-[11px] text-muted">
              <div className="flex -space-x-1">
                {topReactions.map(type => (
                  <span key={type} className="z-10">{REACTION_TYPES.find(r => r.id === type)?.icon}</span>
                ))}
              </div>
              <span className="font-medium ml-0.5">{comment.reactions.length}</span>
            </div>
          )}

          {/* Delete button (hover) */}
          {canDelete && (
            <button 
              onClick={() => onDelete(comment._id)}
              className="absolute top-2 right-2 text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity bg-surface rounded-full p-1 shadow-sm cursor-pointer"
              title="Xóa bình luận"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Actions Bar */}
        <div className="flex items-center gap-4 mt-1.5 ml-2 text-xs font-semibold text-muted relative">
          <span className="font-normal text-muted/70">
            {formatDate(comment.createdAt)}
          </span>
          
          <div 
            className="relative cursor-pointer"
            onMouseEnter={() => setIsHoveringLike(true)}
            onMouseLeave={() => setIsHoveringLike(false)}
          >
            <button 
              onClick={() => handleReact(userReaction ? '' : 'like')}
              className={`hover:underline cursor-pointer ${userReactionDef ? 'text-primary' : 'hover:text-main'} transition-colors py-1`}
            >
              {userReactionDef ? `${userReactionDef.icon} ${userReactionDef.label}` : 'Thích'}
            </button>

            {/* Hover Reaction Bar */}
            {isHoveringLike && (
              <div className="absolute bottom-full left-0 pb-1 z-20">
                <div className="flex items-center gap-1 bg-surface border border-border-color shadow-lg rounded-full px-2 py-1 animate-fade-in-up">
                  {REACTION_TYPES.map(rt => (
                    <button
                      key={rt.id}
                      onClick={() => handleReact(rt.id)}
                      className="text-xl hover:scale-125 transition-transform origin-bottom px-1 cursor-pointer"
                      title={rt.label}
                    >
                      {rt.icon}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="hover:underline hover:text-main cursor-pointer transition-colors py-1"
          >
            Phản hồi
          </button>
        </div>

        {/* Reply Input */}
        {showReplyInput && (
          <div className="mt-3 flex gap-2 w-full animate-fade-in">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-border-color opacity-70 bg-surface shadow-sm">
              {currentUser ? (
                currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <img src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(currentUser.name || 'user')}`} alt="avatar" className="w-full h-full object-cover p-1" />
                )
              ) : (
                <img src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(localStorage.getItem('guestName') || 'guest')}`} alt="avatar" className="w-full h-full object-cover p-1" />
              )}
            </div>
            <form onSubmit={handleReplySubmit} className="flex-1 flex gap-2">
              <input
                type="text"
                autoFocus
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Viết phản hồi..."
                className="input-field flex-1 !py-1.5 !px-3 !rounded-full text-sm"
              />
              <button 
                type="submit"
                disabled={!replyContent.trim()}
                className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-50 shadow-sm shrink-0 hover:bg-primary-dark transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 translate-x-px translate-y-px" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="w-full">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply._id}
                comment={reply}
                onReply={onReply}
                onReact={onReact}
                onDelete={onDelete}
                currentUser={currentUser}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
