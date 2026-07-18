import React from 'react';

const NewsBoard = () => {
  return (
    <div className="w-full animate-slide-up">
      <div className="text-center mb-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-accent/20 rounded-full blur-[60px] -z-10"></div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-main mb-4 tracking-tight flex items-center justify-center gap-3">
          <span className="text-4xl">📰</span>
          Bảng tin <span className="text-accent">Giải đấu</span>
        </h1>
        <p className="text-muted text-lg max-w-xl mx-auto">
          Cập nhật tin tức, kết quả và thể lệ các giải đấu nội bộ của Sân Cầu.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-12 mb-12">
        
        {/* Post 1: Season 1 */}
        <article className="glass-card overflow-hidden transition-all hover:border-accent/50 hover:shadow-xl hover:shadow-accent/10">
          <div className="p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-accent/15 text-accent font-bold px-3 py-1 rounded-full text-sm border border-accent/20">🏆 Giải đấu</span>
              <span className="text-muted text-sm font-medium">Season 1</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-main mb-6 leading-tight">Tổng kết Giải Đấu: Season 1</h2>
            
            <div className="space-y-10 text-main leading-relaxed">
              
              {/* Section: Kết quả */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-accent flex items-center gap-2">
                  <span>🏅</span> Kết quả Season 1
                </h3>
                <p className="text-muted">
                  Giải đấu Season 1 đã khép lại thành công rực rỡ với sự tham gia nhiệt tình của tất cả các thành viên. Xin chúc mừng nhà vô địch và các đội xuất sắc nhất giải!
                </p>
                <div className="rounded-xl overflow-hidden border border-border-color shadow-sm bg-surface">
                  <img 
                    src="https://res.cloudinary.com/dv7w1z8si/image/upload/v1784359765/badminton/nz0yoqfkcdyorj698fhh.jpg" 
                    alt="Ảnh chụp nhà vô địch và đội giải bét" 
                    className="w-full h-auto max-h-[600px] object-cover hover:scale-[1.02] transition-transform duration-500"
                  />
                  <p className="text-center text-sm text-muted py-2.5 font-medium">📸 Ảnh chụp nhà vô địch và đội giải bét đứng 2 bên trao giải</p>
                </div>
              </div>

              <hr className="border-border-color/50" />

              {/* Section: Thể lệ */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-accent flex items-center gap-2">
                  <span>📊</span> Thể lệ và chia bảng mùa 1
                </h3>
                <div className="rounded-xl overflow-hidden border border-border-color shadow-sm bg-surface">
                  <img 
                    src="https://res.cloudinary.com/dv7w1z8si/image/upload/v1784359763/badminton/hdwnvlzxbpsm0fygaire.png" 
                    alt="Thể lệ và chia bảng" 
                    className="w-full h-auto max-h-[700px] object-contain hover:scale-[1.02] transition-transform duration-500 bg-white"
                  />
                  <p className="text-center text-sm text-muted py-2.5 font-medium">Chi tiết chia bảng và thể lệ thi đấu</p>
                </div>
              </div>

              <hr className="border-border-color/50" />

              {/* Section: Tổng kết */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-accent flex items-center gap-2">
                  <span>🎉</span> Tổng kết và trao giải
                </h3>
                <p className="text-muted">
                  Cảm ơn tất cả mọi người đã tham gia thi đấu hết mình và tạo nên một giải đấu vô cùng cảm xúc. Hẹn gặp lại mọi người ở Season 2!
                </p>
                <div className="rounded-xl overflow-hidden border border-border-color shadow-sm bg-surface">
                  <img 
                    src="https://res.cloudinary.com/dv7w1z8si/image/upload/v1784359763/badminton/hdwnvlzxbpsm0fygaire.png" 
                    alt="Tổng kết và trao giải" 
                    className="w-full h-auto max-h-[700px] object-contain hover:scale-[1.02] transition-transform duration-500 bg-white"
                  />
                </div>
              </div>

            </div>
          </div>
        </article>

      </div>
    </div>
  );
};

export default NewsBoard;
