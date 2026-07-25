import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const REACTION_TYPES = [
  { id: 'like', icon: '👍', label: 'Thích' },
  { id: 'love', icon: '❤️', label: 'Yêu thích' },
  { id: 'haha', icon: '😆', label: 'Haha' },
  { id: 'wow', icon: '😮', label: 'Wow' },
  { id: 'sad', icon: '😢', label: 'Buồn' },
  { id: 'angry', icon: '😡', label: 'Phẫn nộ' }
];

const PostReaction = ({ post, onReact, currentUser, guestId }) => {
  const [isHoveringLike, setIsHoveringLike] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const userReaction = post.reactions?.find(r => 
    (currentUser && (r.user?._id === currentUser.id || r.user === currentUser.id)) ||
    (guestId && r.guestId === guestId)
  );
  const userReactionDef = userReaction ? REACTION_TYPES.find(r => r.id === userReaction.type) : null;

  // Compute reaction summary
  const reactionCounts = {};
  post.reactions?.forEach(r => {
    reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
  });

  const topReactions = Object.entries(reactionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);

  // Unique reaction types present in this post
  const presentReactionTypes = Object.keys(reactionCounts);

  // Filtered reactions list for modal
  const filteredReactions = activeTab === 'all'
    ? (post.reactions || [])
    : (post.reactions || []).filter(r => r.type === activeTab);

  return (
    <div className="flex items-center gap-4 text-sm font-semibold text-muted relative border-t border-border-color pt-3 mt-4 mb-2">
      {/* React Button with Hover Bar */}
      <div 
        className="relative cursor-pointer"
        onMouseEnter={() => setIsHoveringLike(true)}
        onMouseLeave={() => setIsHoveringLike(false)}
      >
        <button 
          onClick={() => {
            onReact(post._id, userReaction ? '' : 'like');
            setIsHoveringLike(false);
          }}
          className={`hover:underline cursor-pointer ${userReactionDef ? 'text-primary' : 'hover:text-main'} transition-colors py-1 flex items-center gap-1.5`}
        >
          {userReactionDef ? (
            <><span>{userReactionDef.icon}</span> <span>{userReactionDef.label}</span></>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span>Thích</span>
            </>
          )}
        </button>

        {/* Hover Reaction Bar */}
        {isHoveringLike && (
          <div className="absolute bottom-full left-0 pb-2 z-20">
            <div className="flex items-center gap-1 bg-surface border border-border-color shadow-lg rounded-full px-2 py-1.5 animate-fade-in-up">
              {REACTION_TYPES.map(rt => (
                <button
                  key={rt.id}
                  onClick={() => {
                    onReact(post._id, rt.id);
                    setIsHoveringLike(false);
                  }}
                  className="text-2xl hover:scale-125 transition-transform origin-bottom px-1 cursor-pointer"
                  title={rt.label}
                >
                  {rt.icon}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reaction Summary Button (Click to open list) */}
      {post.reactions && post.reactions.length > 0 && (
        <button
          type="button"
          onClick={() => { setActiveTab('all'); setShowModal(true); }}
          className="flex items-center gap-1 text-[13px] text-muted ml-auto hover:text-main cursor-pointer group transition-colors px-2 py-1 rounded-lg hover:bg-surface/80"
          title="Bấm để xem danh sách người đã thả cảm xúc"
        >
          <div className="flex -space-x-1.5 mr-1">
            {topReactions.map(type => (
              <span key={type} className="z-10 text-base bg-surface rounded-full shadow-sm group-hover:scale-110 transition-transform">
                {REACTION_TYPES.find(r => r.id === type)?.icon}
              </span>
            ))}
          </div>
          <span className="font-medium group-hover:underline">{post.reactions.length}</span>
        </button>
      )}

      {/* Reactions List Modal (Portal to body) */}
      {showModal && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-card border border-border-color rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-border-color bg-surface/50">
              <h3 className="font-bold text-lg text-main flex items-center gap-2">
                <span>Cảm xúc</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                  {post.reactions?.length || 0}
                </span>
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-muted hover:text-danger p-1 rounded-lg hover:bg-surface transition-colors cursor-pointer"
                title="Đóng"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 px-4 pt-3 pb-2 overflow-x-auto border-b border-border-color no-scrollbar">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                  activeTab === 'all'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface text-muted hover:text-main hover:bg-surface-hover'
                }`}
              >
                Tất cả ({post.reactions?.length || 0})
              </button>

              {presentReactionTypes.map(type => {
                const def = REACTION_TYPES.find(r => r.id === type);
                const count = reactionCounts[type];
                return (
                  <button
                    key={type}
                    onClick={() => setActiveTab(type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1 cursor-pointer transition-colors ${
                      activeTab === type
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-surface text-muted hover:text-main hover:bg-surface-hover'
                    }`}
                  >
                    <span>{def?.icon}</span>
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* User List */}
            <div className="max-h-[360px] overflow-y-auto p-4 space-y-3 divide-y divide-border-light">
              {filteredReactions.length === 0 ? (
                <p className="text-center py-6 text-muted text-sm">Không có ai ở mục này</p>
              ) : (
                filteredReactions.map((r, idx) => {
                  const reactIcon = REACTION_TYPES.find(item => item.id === r.type)?.icon;
                  const name = r.user?.name || r.guestName || 'Ẩn danh';
                  const avatarUrl = r.user?.avatarUrl;
                  const memberCode = r.user?.memberCode;

                  return (
                    <div key={idx} className="flex items-center justify-between pt-3 first:pt-0">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-border-color shadow-sm">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <img 
                              src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(name)}`} 
                              alt={name} 
                              className="w-full h-full object-cover p-0.5 bg-surface" 
                            />
                          )}
                        </div>

                        <div>
                          <p className="font-semibold text-main text-sm flex items-center gap-1.5">
                            {name}
                            {r.user?.role === 'admin' && (
                              <span className="text-[10px] bg-danger/10 text-danger px-1.5 py-0.2 rounded font-bold">Admin</span>
                            )}
                          </p>
                          {memberCode && (
                            <p className="text-xs text-muted font-mono">#{memberCode}</p>
                          )}
                        </div>
                      </div>

                      <span className="text-xl bg-surface px-2 py-1 rounded-full shadow-xs shrink-0">
                        {reactIcon}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PostReaction;
