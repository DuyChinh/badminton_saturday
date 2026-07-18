import React, { useState } from 'react';

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

      {/* Reaction Summary */}
      {post.reactions && post.reactions.length > 0 && (
        <div className="flex items-center gap-1 text-[13px] text-muted ml-auto">
          <div className="flex -space-x-1.5 mr-1">
            {topReactions.map(type => (
              <span key={type} className="z-10 text-base bg-surface rounded-full shadow-sm">
                {REACTION_TYPES.find(r => r.id === type)?.icon}
              </span>
            ))}
          </div>
          <span className="font-medium">{post.reactions.length}</span>
        </div>
      )}
    </div>
  );
};

export default PostReaction;
