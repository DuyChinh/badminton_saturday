import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const TournamentPage = () => {
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('standings'); // 'standings' | 'group' | 'knockout' | 'admin'
  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState(null);
  const [standings, setStandings] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  
  // Admin form state
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [editingTeams, setEditingTeams] = useState([]);
  const [knockoutPick, setKnockoutPick] = useState({
    semi1TeamA: '',
    semi1TeamB: '',
    semi2TeamA: '',
    semi2TeamB: ''
  });

  // Score Modal
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchScoreA, setMatchScoreA] = useState(0);
  const [matchScoreB, setMatchScoreB] = useState(0);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tournament');
      setTournament(res.data.data.tournament);
      setStandings(res.data.data.standings || []);
      setEditingTeams(res.data.data.tournament.teams || []);
    } catch (error) {
      toast.error('Không thể tải dữ liệu giải đấu');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    if (isAdmin) {
      try {
        const res = await api.get('/members');
        setAllMembers(res.data.data || []);
      } catch (err) {
        console.error('Fetch members error:', err);
      }
    }
  };

  useEffect(() => {
    fetchTournamentData();
    fetchMembers();
  }, [isAdmin]);

  // Handle Random Pairing (Admin)
  const handleRandomPairing = async () => {
    if (selectedMemberIds.length < 2) {
      toast.error('Vui lòng chọn ít nhất 2 thành viên');
      return;
    }

    try {
      const res = await api.post('/tournament/pair-teams', { memberIds: selectedMemberIds });
      toast.success(res.data.message);
      fetchTournamentData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi chia cặp');
    }
  };

  // Handle Save Team Names (Admin)
  const handleSaveTeams = async () => {
    try {
      await api.put('/tournament/teams', { teams: editingTeams });
      toast.success('Đã lưu danh sách đội');
      fetchTournamentData();
    } catch (error) {
      toast.error('Lỗi khi lưu tên đội');
    }
  };

  // Handle Generate Group Schedule (Admin)
  const handleGenerateSchedule = async () => {
    if (!window.confirm('Tạo lịch thi đấu mới sẽ reset các trận vòng bảng cũ. Bạn chắc chắn chứ?')) return;
    try {
      const res = await api.post('/tournament/generate-schedule');
      toast.success(res.data.message);
      fetchTournamentData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi tạo lịch thi đấu');
    }
  };

  // Handle Setup Knockout (Admin)
  const handleSetupKnockout = async () => {
    try {
      const res = await api.post('/tournament/setup-knockout', knockoutPick);
      toast.success(res.data.message);
      fetchTournamentData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi tạo vòng Knockout');
    }
  };

  // Handle Save Match Score
  const handleSaveScore = async () => {
    if (!selectedMatch) return;
    try {
      await api.put(`/tournament/matches/${selectedMatch._id}`, {
        scoreA: Number(matchScoreA),
        scoreB: Number(matchScoreB),
        status: 'completed'
      });
      toast.success('Đã cập nhật tỉ số');
      setSelectedMatch(null);
      fetchTournamentData();
    } catch (error) {
      toast.error('Lỗi khi cập nhật tỉ số');
    }
  };

  // Handle Reset All (Admin)
  const handleResetAll = async () => {
    if (!window.confirm('⚠️ Bạn có chắc chắn muốn RESET TOÀN BỘ giải đấu? Danh sách các cặp đấu và tất cả tỉ số sẽ bị xóa hoàn toàn để bạn chia cặp lại từ đầu!')) return;
    try {
      const res = await api.post('/tournament/reset-all');
      toast.success(res.data.message);
      setSelectedMemberIds([]);
      setEditingTeams([]);
      fetchTournamentData();
    } catch (error) {
      toast.error('Lỗi khi reset giải đấu');
    }
  };

  // Handle Reset Scores Only (Admin)
  const handleResetScores = async () => {
    if (!window.confirm('⚠️ Bạn có chắc chắn muốn RESET TỈ SỐ của tất cả các trận về 0-0? Danh sách các đội sẽ được giữ nguyên.')) return;
    try {
      const res = await api.post('/tournament/reset-scores');
      toast.success(res.data.message);
      fetchTournamentData();
    } catch (error) {
      toast.error('Lỗi khi reset tỉ số');
    }
  };

  const groupMatches = tournament?.matches?.filter(m => m.stage === 'group') || [];
  const semiMatches = tournament?.matches?.filter(m => m.stage === 'semi_final') || [];
  const finalMatch = tournament?.matches?.find(m => m.stage === 'final');

  // Derive tournament podium / results
  let championTeam = null;
  let runnerUpTeam = null;
  let thirdPlaceTeams = [];

  if (finalMatch && finalMatch.status === 'completed' && finalMatch.winner) {
    if (finalMatch.scoreA > finalMatch.scoreB) {
      championTeam = tournament?.teams?.find(t => t._id.toString() === finalMatch.teamA?.toString()) || { name: finalMatch.teamAName };
      runnerUpTeam = tournament?.teams?.find(t => t._id.toString() === finalMatch.teamB?.toString()) || { name: finalMatch.teamBName };
    } else if (finalMatch.scoreB > finalMatch.scoreA) {
      championTeam = tournament?.teams?.find(t => t._id.toString() === finalMatch.teamB?.toString()) || { name: finalMatch.teamBName };
      runnerUpTeam = tournament?.teams?.find(t => t._id.toString() === finalMatch.teamA?.toString()) || { name: finalMatch.teamAName };
    }
  }

  semiMatches.forEach(sm => {
    if (sm.status === 'completed') {
      let loserId = null;
      let loserName = '';
      if (sm.scoreA > sm.scoreB) {
        loserId = sm.teamB;
        loserName = sm.teamBName;
      } else if (sm.scoreB > sm.scoreA) {
        loserId = sm.teamA;
        loserName = sm.teamAName;
      }
      if (loserName) {
        const teamObj = tournament?.teams?.find(t => t._id.toString() === loserId?.toString()) || { name: loserName };
        if (!thirdPlaceTeams.some(t => t.name === teamObj.name)) {
          thirdPlaceTeams.push(teamObj);
        }
      }
    }
  });

  if (loading && !tournament) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header Banner */}
      <div className="glass-card p-5 sm:p-8 relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="w-full sm:w-auto">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 inline-block">
            {tournament?.season || 'Season 1'}
          </span>
          <h2 className="text-xl sm:text-3xl font-black text-main mt-2">
            🏆 {tournament?.title || 'Giải Cầu Lông Sát Thủ'}
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">Lịch thi đấu vòng bảng, Bảng xếp hạng & Vòng Knockout trực tiếp</p>
        </div>

        {/* Action button for Admin to jump to Settings tab */}
        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className="btn-primary py-2.5 px-5 text-sm w-full sm:w-auto shrink-0 cursor-pointer shadow-md"
          >
            ⚙️ Quản lý giải đấu
          </button>
        )}
      </div>

      {/* Tabs - Flex Wrap on mobile so tabs wrap cleanly onto next line */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-border-color">
        <button
          onClick={() => setActiveTab('standings')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTab === 'standings'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-surface text-muted hover:text-main hover:bg-surface-hover'
          }`}
        >
          <span>🏆 BXH</span>
        </button>

        <button
          onClick={() => setActiveTab('group')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTab === 'group'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-surface text-muted hover:text-main hover:bg-surface-hover'
          }`}
        >
          <span>📅 Vòng Bảng ({groupMatches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('knockout')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTab === 'knockout'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-surface text-muted hover:text-main hover:bg-surface-hover'
          }`}
        >
          <span>⚔️ Knockout</span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTab === 'results'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-surface text-muted hover:text-main hover:bg-surface-hover'
          }`}
        >
          <span>🏅 Kết Quả</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-surface text-muted hover:text-main hover:bg-surface-hover'
            }`}
          >
            <span className="hidden sm:inline">⚙️ Chia cặp & Cấu hình</span>
            <span className="sm:hidden">⚙️ Cấu hình</span>
          </button>
        )}
      </div>

      {/* TAB 1: BẢNG XẾP HẠNG (STANDINGS) */}
      {activeTab === 'standings' && (
        <div className="glass-card overflow-hidden">
          <div className="p-3.5 sm:p-6 border-b border-border-color bg-surface/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
            <h3 className="font-bold text-base sm:text-lg text-main flex items-center gap-2">
              <span>Bảng Xếp Hạng Vòng Bảng</span>
            </h3>
            <span className="text-[11px] sm:text-xs text-muted font-medium">Cập nhật tự động sau mỗi trận</span>
          </div>

          <div className="w-full">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-surface text-muted uppercase text-[10px] sm:text-[11px] tracking-wider border-b border-border-color">
                <tr>
                  <th className="px-1.5 sm:px-3 py-2.5 text-center w-8 sm:w-12">
                    <span className="hidden sm:inline">Hạng</span>
                    <span className="sm:hidden">#</span>
                  </th>
                  <th className="px-2 sm:px-4 py-2.5">Đội</th>
                  <th className="px-1 sm:px-3 py-2.5 text-center">
                    <span className="hidden sm:inline">Trận</span>
                    <span className="sm:hidden">T</span>
                  </th>
                  <th className="px-1 sm:px-3 py-2.5 text-center text-success">
                    <span className="hidden sm:inline">Thắng</span>
                    <span className="sm:hidden">W</span>
                  </th>
                  <th className="px-1 sm:px-3 py-2.5 text-center text-danger">
                    <span className="hidden sm:inline">Thua</span>
                    <span className="sm:hidden">L</span>
                  </th>
                  <th className="px-1 sm:px-3 py-2.5 text-center">
                    <span className="hidden sm:inline">Hiệu số</span>
                    <span className="sm:hidden">+/-</span>
                  </th>
                  <th className="px-1.5 sm:px-3 py-2.5 text-center font-bold text-main">
                    <span className="hidden sm:inline">Điểm</span>
                    <span className="sm:hidden">PTS</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {standings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 sm:py-10 text-muted">Chưa có đội nào tham gia giải đấu</td>
                  </tr>
                ) : (
                  standings.map((team, idx) => (
                    <tr 
                      key={team.teamId} 
                      className={`hover:bg-surface-hover/50 transition-colors ${
                        idx === 0 ? 'bg-amber-500/5' : idx === 1 ? 'bg-slate-400/5' : idx === 2 ? 'bg-amber-700/5' : ''
                      }`}
                    >
                      <td className="px-1.5 sm:px-3 py-2.5 text-center font-bold text-xs sm:text-base">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </td>

                      <td className="px-2 sm:px-4 py-2.5 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2.5">
                          <div className="flex -space-x-1.5 sm:-space-x-2 shrink-0">
                            {team.players && team.players.map(p => (
                              <div key={p._id} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-surface bg-surface shadow-xs" title={p.name}>
                                {p.avatarUrl ? (
                                  <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px] sm:text-xs">
                                    {p.name?.charAt(0) || 'U'}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-main text-xs sm:text-base leading-tight truncate">{team.name}</p>
                            <p className="text-[10px] sm:text-xs text-muted leading-tight truncate">
                              {team.players?.map(p => p.name).join(' & ') || 'Chưa có cầu thủ'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-1 sm:px-3 py-2.5 text-center font-semibold text-xs sm:text-sm">{team.played}</td>
                      <td className="px-1 sm:px-3 py-2.5 text-center font-bold text-success text-xs sm:text-sm">{team.wins}</td>
                      <td className="px-1 sm:px-3 py-2.5 text-center font-semibold text-danger text-xs sm:text-sm">{team.losses}</td>
                      <td className="px-1 sm:px-3 py-2.5 text-center font-mono font-medium text-xs sm:text-sm">
                        {team.scoreDiff > 0 ? `+${team.scoreDiff}` : team.scoreDiff}
                      </td>
                      <td className="px-1.5 sm:px-3 py-2.5 text-center font-black text-sm sm:text-lg text-primary">{team.points}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: VÒNG BẢNG (GROUP SCHEDULE) */}
      {activeTab === 'group' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="font-bold text-base sm:text-lg text-main">Lịch thi đấu Vòng Bảng</h3>
            {isAdmin && (
              <button 
                onClick={handleGenerateSchedule}
                className="btn-secondary text-xs py-1.5 px-3 w-full sm:w-auto text-center"
              >
                🔄 Tạo lại lịch vòng bảng
              </button>
            )}
          </div>

          {groupMatches.length === 0 ? (
            <div className="glass-card p-8 sm:p-12 text-center text-muted text-sm">
              Chưa có lịch thi đấu vòng bảng. Admin hãy chọn các cặp đấu và tạo lịch thi đấu!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {groupMatches.map((match, idx) => (
                <div key={match._id || idx} className="glass-card p-4 hover:border-primary/50 transition-all flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-muted bg-surface px-2.5 py-1 rounded-md border border-border-color">
                      Trận {idx + 1}
                    </span>
                    <span className={`text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full ${
                      match.status === 'completed' ? 'badge-paid' : 'bg-surface text-muted'
                    }`}>
                      {match.status === 'completed' ? 'Đã thi đấu' : 'Chưa thi đấu'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2.5 px-3 bg-surface/50 rounded-xl border border-border-color">
                    {/* Team A */}
                    <div className="flex-1 text-right pr-2 sm:pr-3 min-w-0">
                      <p className="font-bold text-main text-xs sm:text-base truncate">{match.teamAName || 'Đội A'}</p>
                    </div>

                    {/* Score */}
                    <div className="bg-surface border border-border-color px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg flex items-center gap-1.5 font-mono font-black text-base sm:text-lg text-main shrink-0 shadow-inner">
                      <span className={match.scoreA > match.scoreB ? 'text-success' : ''}>{match.scoreA}</span>
                      <span className="text-muted text-xs">-</span>
                      <span className={match.scoreB > match.scoreA ? 'text-success' : ''}>{match.scoreB}</span>
                    </div>

                    {/* Team B */}
                    <div className="flex-1 text-left pl-2 sm:pl-3 min-w-0">
                      <p className="font-bold text-main text-xs sm:text-base truncate">{match.teamBName || 'Đội B'}</p>
                    </div>
                  </div>

                  {/* Admin Edit Button */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setSelectedMatch(match);
                        setMatchScoreA(match.scoreA);
                        setMatchScoreB(match.scoreB);
                      }}
                      className="mt-3 text-xs text-primary hover:text-primary-light font-bold self-stretch sm:self-end text-center sm:text-right py-1.5 sm:py-0 bg-primary/10 sm:bg-transparent rounded-lg sm:rounded-none cursor-pointer transition-colors"
                    >
                      ✏️ {match.status === 'completed' ? 'Sửa tỉ số' : 'Nhập tỉ số'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VÒNG KNOCKOUT (BÁN KẾT & CHUNG KẾT) */}
      {activeTab === 'knockout' && (
        <div className="space-y-6 sm:space-y-8">
          {/* Winner Banner if Final is completed */}
          {finalMatch && finalMatch.status === 'completed' && finalMatch.winner && (
            <div className="glass-card p-6 sm:p-8 text-center bg-gradient-to-r from-amber-500/10 via-primary/10 to-amber-500/10 border-amber-500/30 animate-pulse-glow">
              <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">👑 🏆 🥇</div>
              <h2 className="text-xl sm:text-3xl font-black text-main">
                QUÁN QUÂN: <span className="text-primary">{finalMatch.winner}</span>
              </h2>
              <p className="text-muted text-xs sm:text-sm mt-1">Chúc mừng nhà vô địch giải cầu lông Saturday Badminton Club!</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-center">
            {/* Semi Final 1 */}
            <div className="glass-card p-4 sm:p-5 border-l-4 border-l-primary relative">
              <span className="text-xs font-extrabold uppercase tracking-wider text-primary mb-2 block">Bán Kết 1</span>
              {semiMatches[0] ? (
                <div>
                  <div className="flex justify-between items-center p-2.5 sm:p-3 bg-surface rounded-xl mb-2">
                    <span className="font-bold text-main text-xs sm:text-sm truncate mr-2">{semiMatches[0].teamAName}</span>
                    <span className="font-mono font-black text-base sm:text-lg text-primary">{semiMatches[0].scoreA}</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 sm:p-3 bg-surface rounded-xl">
                    <span className="font-bold text-main text-xs sm:text-sm truncate mr-2">{semiMatches[0].teamBName}</span>
                    <span className="font-mono font-black text-base sm:text-lg text-primary">{semiMatches[0].scoreB}</span>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setSelectedMatch(semiMatches[0]);
                        setMatchScoreA(semiMatches[0].scoreA);
                        setMatchScoreB(semiMatches[0].scoreB);
                      }}
                      className="mt-3 text-xs text-primary font-bold block ml-auto cursor-pointer"
                    >
                      ✏️ Nhập tỉ số Bán kết 1
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-muted text-xs sm:text-sm italic">Chưa thiết lập Bán kết 1</p>
              )}
            </div>

            {/* Final Match (Middle Card) */}
            <div className="glass-card p-5 sm:p-6 border-2 border-primary/50 bg-primary/5 shadow-xl relative text-center">
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🏆</div>
              <span className="text-xs font-black uppercase tracking-widest text-primary mb-3 block">TRẬN CHUNG KẾT</span>
              {finalMatch ? (
                <div>
                  <div className="flex justify-between items-center p-2.5 sm:p-3 bg-card border border-border-color rounded-xl mb-2">
                    <span className="font-black text-main text-xs sm:text-base truncate mr-2">{finalMatch.teamAName || 'Thắng Bán Kết 1'}</span>
                    <span className="font-mono font-black text-lg sm:text-xl text-primary">{finalMatch.scoreA}</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 sm:p-3 bg-card border border-border-color rounded-xl">
                    <span className="font-black text-main text-xs sm:text-base truncate mr-2">{finalMatch.teamBName || 'Thắng Bán Kết 2'}</span>
                    <span className="font-mono font-black text-lg sm:text-xl text-primary">{finalMatch.scoreB}</span>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setSelectedMatch(finalMatch);
                        setMatchScoreA(finalMatch.scoreA);
                        setMatchScoreB(finalMatch.scoreB);
                      }}
                      className="mt-4 btn-primary py-2 px-4 text-xs cursor-pointer w-full"
                    >
                      👑 Cập nhật tỉ số Chung kết
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-muted text-xs sm:text-sm italic">Chưa tạo trận Chung kết</p>
              )}
            </div>

            {/* Semi Final 2 */}
            <div className="glass-card p-4 sm:p-5 border-l-4 border-l-primary relative">
              <span className="text-xs font-extrabold uppercase tracking-wider text-primary mb-2 block">Bán Kết 2</span>
              {semiMatches[1] ? (
                <div>
                  <div className="flex justify-between items-center p-2.5 sm:p-3 bg-surface rounded-xl mb-2">
                    <span className="font-bold text-main text-xs sm:text-sm truncate mr-2">{semiMatches[1].teamAName}</span>
                    <span className="font-mono font-black text-base sm:text-lg text-primary">{semiMatches[1].scoreA}</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 sm:p-3 bg-surface rounded-xl">
                    <span className="font-bold text-main text-xs sm:text-sm truncate mr-2">{semiMatches[1].teamBName}</span>
                    <span className="font-mono font-black text-base sm:text-lg text-primary">{semiMatches[1].scoreB}</span>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setSelectedMatch(semiMatches[1]);
                        setMatchScoreA(semiMatches[1].scoreA);
                        setMatchScoreB(semiMatches[1].scoreB);
                      }}
                      className="mt-3 text-xs text-primary font-bold block ml-auto cursor-pointer"
                    >
                      ✏️ Nhập tỉ số Bán kết 2
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-muted text-xs sm:text-sm italic">Chưa thiết lập Bán kết 2</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: KẾT QUẢ GIẢI ĐẤU (RESULTS & PODIUM) */}
      {activeTab === 'results' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Podium Banner */}
          <div className="glass-card p-6 sm:p-8 text-center relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-primary/5 to-amber-500/10 border-amber-500/30">
            <div className="text-4xl sm:text-6xl mb-2">🏆 🏅 👑</div>
            <h2 className="text-2xl sm:text-3xl font-black text-main uppercase tracking-tight">
              Bảng Vàng Vinh Danh Giải Đấu
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-1">Kết quả chung cuộc các nhà vô địch & danh hiệu mùa giải</p>
          </div>

          {/* Medals Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
            {/* 🥇 GIẢI NHẤT (QUÁN QUÂN) */}
            <div className="glass-card p-6 text-center border-2 border-amber-400 bg-gradient-to-b from-amber-500/20 via-yellow-400/10 to-transparent shadow-xl relative flex flex-col justify-between order-1 md:order-2 transform md:-translate-y-2">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                🥇 NHÀ VÔ ĐỊCH
              </div>

              <div className="pt-3">
                <div className="text-5xl mb-2">🏆</div>
                <h3 className="font-black text-xl sm:text-2xl text-main">{championTeam?.name || 'Đang cập nhật...'}</h3>
                {championTeam?.players && (
                  <div className="flex justify-center -space-x-2 my-3">
                    {championTeam.players.map((p, i) => (
                      <div key={p._id || i} className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 shadow-md">
                        {p.avatarUrl ? (
                          <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
                            {p.name?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs sm:text-sm font-semibold text-amber-500">
                  {championTeam?.players?.map(p => p.name).join(' & ') || 'Cặp đôi vô địch'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-400/30">
                <span className="badge-paid text-xs bg-amber-400/20 text-amber-500 border-amber-400/30">Huy Chương Vàng 🥇</span>
              </div>
            </div>

            {/* 🥈 GIẢI NHÌ (Á QUÂN) */}
            <div className="glass-card p-6 text-center border-2 border-slate-400 bg-gradient-to-b from-slate-400/20 via-slate-300/10 to-transparent shadow-lg relative flex flex-col justify-between order-2 md:order-1">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                🥈 Á QUÂN
              </div>

              <div className="pt-3">
                <div className="text-4xl mb-2">🥈</div>
                <h3 className="font-black text-lg sm:text-xl text-main">{runnerUpTeam?.name || 'Đang cập nhật...'}</h3>
                {runnerUpTeam?.players && (
                  <div className="flex justify-center -space-x-2 my-3">
                    {runnerUpTeam.players.map((p, i) => (
                      <div key={p._id || i} className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-300 shadow-sm">
                        {p.avatarUrl ? (
                          <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-300 text-slate-900 flex items-center justify-center font-bold text-xs">
                            {p.name?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs font-semibold text-slate-400">
                  {runnerUpTeam?.players?.map(p => p.name).join(' & ') || 'Cặp đôi á quân'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-400/30">
                <span className="badge-paid text-xs bg-slate-400/20 text-slate-300 border-slate-400/30">Huy Chương Bạc 🥈</span>
              </div>
            </div>

            {/* 🥉 GIẢI BA (ĐỒNG HẠNG BA) */}
            <div className="glass-card p-6 text-center border-2 border-amber-700 bg-gradient-to-b from-amber-800/20 via-amber-700/10 to-transparent shadow-lg relative flex flex-col justify-between order-3">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-700 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                🥉 GIẢI BA
              </div>

              <div className="pt-3">
                <div className="text-4xl mb-2">🥉</div>
                <h3 className="font-black text-lg sm:text-xl text-main">
                  {thirdPlaceTeams.length > 0 ? thirdPlaceTeams.map(t => t.name).join(', ') : 'Đang cập nhật...'}
                </h3>
                <p className="text-xs font-semibold text-amber-600 mt-2">
                  {thirdPlaceTeams.length > 0 
                    ? thirdPlaceTeams.map(t => t.players?.map(p => p.name).join(' & ') || t.name).join(' | ') 
                    : 'Các đội thua Bán kết'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-700/30">
                <span className="badge-paid text-xs bg-amber-700/20 text-amber-600 border-amber-700/30">Huy Chương Đồng 🥉</span>
              </div>
            </div>
          </div>

          {/* Full Standing Ranks List */}
          <div className="glass-card p-5 sm:p-6">
            <h3 className="font-bold text-base sm:text-lg text-main mb-4 flex items-center gap-2">
              <span>📊 Bảng Xếp Hạng Tổng Sắp Mùa Giải</span>
            </h3>

            <div className="space-y-2.5">
              {standings.map((t, idx) => (
                <div key={t.teamId || idx} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border-color">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm sm:text-base w-8 text-center">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <div>
                      <p className="font-bold text-main text-xs sm:text-sm">{t.name}</p>
                      <p className="text-[11px] text-muted">{t.players?.map(p => p.name).join(' & ')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold">
                    <span className="text-muted">{t.played} trận</span>
                    <span className="text-success font-bold">{t.wins}W - {t.losses}L</span>
                    <span className="font-mono text-primary font-black">{t.points} PTS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ADMIN SETTINGS & PAIRING */}
      {activeTab === 'admin' && isAdmin && (
        <div className="space-y-6">
          {/* Section 1: Member picker & Random Pair */}
          <div className="glass-card p-4 sm:p-6">
            <h3 className="font-bold text-base sm:text-lg text-main mb-1 sm:mb-2">1. Chọn thành viên & Chia cặp ngẫu nhiên</h3>
            <p className="text-xs sm:text-sm text-muted mb-4">Tích chọn các thành viên tham gia giải đấu, hệ thống sẽ tự động ghép ngẫu nhiên 2 người thành 1 đội.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 max-h-72 overflow-y-auto p-2 bg-surface rounded-xl border border-border-color mb-4">
              {allMembers.map(m => {
                const checked = selectedMemberIds.includes(m._id);
                return (
                  <label key={m._id} className="flex items-center gap-2.5 p-2.5 bg-card rounded-lg border border-border-color cursor-pointer hover:border-primary/50 text-xs sm:text-sm transition-colors">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          setSelectedMemberIds(prev => prev.filter(id => id !== m._id));
                        } else {
                          setSelectedMemberIds(prev => [...prev, m._id]);
                        }
                      }}
                      className="accent-primary w-4 h-4 shrink-0 cursor-pointer"
                    />
                    <span className="font-semibold text-main break-words flex-1">{m.name}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <span className="text-xs sm:text-sm font-semibold text-primary text-center sm:text-left">
                Đã chọn: <strong className="text-main">{selectedMemberIds.length}</strong> thành viên
              </span>
              <button 
                onClick={handleRandomPairing}
                className="btn-primary py-3 sm:py-2.5 px-5 text-sm w-full sm:w-auto cursor-pointer shadow-md justify-center"
              >
                🎲 Chia cặp ngẫu nhiên
              </button>
            </div>
          </div>

          {/* Section 2: Edit Team Names */}
          <div className="glass-card p-4 sm:p-6">
            <h3 className="font-bold text-base sm:text-lg text-main mb-1 sm:mb-2">2. Đổi tên các Đội thi đấu</h3>
            <p className="text-xs sm:text-sm text-muted mb-4">Bạn có thể chỉnh sửa lại tên gọi của từng cặp đấu cho ấn tượng hơn.</p>

            <div className="space-y-3 mb-4">
              {editingTeams.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted italic text-center py-4">Chưa có đội nào. Vui lòng chọn thành viên ở Mục 1 và bấm Chia cặp ngẫu nhiên.</p>
              ) : (
                editingTeams.map((team, idx) => (
                  <div key={team._id || idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-surface rounded-xl border border-border-color">
                    <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                      <span className="font-bold text-muted text-xs sm:text-sm shrink-0 w-6">#{idx + 1}</span>
                      <input
                        type="text"
                        value={team.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingTeams(prev => prev.map((t, i) => i === idx ? { ...t, name: val } : t));
                        }}
                        className="input-field py-2 px-3 text-xs sm:text-sm font-bold flex-1"
                        placeholder="Tên đội..."
                      />
                    </div>
                    <span className="text-xs text-primary font-medium pl-8 sm:pl-0 truncate">
                      ({team.players?.map(p => p.name || 'Member').join(' + ')})
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
              {editingTeams.length > 0 && (
                <button onClick={handleSaveTeams} className="btn-primary py-3 sm:py-2.5 px-5 text-sm cursor-pointer shadow-md justify-center w-full sm:w-auto">
                  💾 Lưu tên các đội
                </button>
              )}

              <button 
                onClick={handleResetAll} 
                className="btn-danger py-3 sm:py-2.5 px-5 text-sm cursor-pointer shadow-md flex items-center justify-center gap-1.5 w-full sm:w-auto"
                title="Xóa toàn bộ danh sách đội và lịch thi đấu để chia cặp lại từ đầu"
              >
                🔄 Reset All (Chia cặp lại & Xóa tỉ số)
              </button>

              <button 
                onClick={handleResetScores} 
                className="btn-secondary text-xs py-3 sm:py-2.5 px-4 cursor-pointer hover:border-danger/50 font-bold justify-center w-full sm:w-auto"
                title="Reset tất cả tỉ số các trận đấu về 0-0"
              >
                🧹 Reset Tỉ số về 0
              </button>
            </div>
          </div>

          {/* Section 3: Knockout Setup */}
          <div className="glass-card p-4 sm:p-6">
            <h3 className="font-bold text-base sm:text-lg text-main mb-1 sm:mb-2">3. Chọn các đội vào vòng Knockout (Bán kết)</h3>
            <p className="text-xs sm:text-sm text-muted mb-4">Chọn 4 đội xuất sắc nhất để sắp xếp vào Bán kết 1 và Bán kết 2.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
              {/* BK 1 */}
              <div className="bg-surface p-3.5 sm:p-4 rounded-xl border border-border-color space-y-3">
                <p className="font-bold text-xs sm:text-sm text-primary">TRẬN BÁN KẾT 1</p>
                <div>
                  <label className="text-xs text-muted block mb-1">Đội A:</label>
                  <select 
                    value={knockoutPick.semi1TeamA}
                    onChange={(e) => setKnockoutPick(prev => ({ ...prev, semi1TeamA: e.target.value }))}
                    className="input-field py-2 text-xs sm:text-sm"
                  >
                    <option value="">-- Chọn Đội A --</option>
                    {tournament?.teams?.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Đội B:</label>
                  <select 
                    value={knockoutPick.semi1TeamB}
                    onChange={(e) => setKnockoutPick(prev => ({ ...prev, semi1TeamB: e.target.value }))}
                    className="input-field py-2 text-xs sm:text-sm"
                  >
                    <option value="">-- Chọn Đội B --</option>
                    {tournament?.teams?.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* BK 2 */}
              <div className="bg-surface p-3.5 sm:p-4 rounded-xl border border-border-color space-y-3">
                <p className="font-bold text-xs sm:text-sm text-primary">TRẬN BÁN KẾT 2</p>
                <div>
                  <label className="text-xs text-muted block mb-1">Đội A:</label>
                  <select 
                    value={knockoutPick.semi2TeamA}
                    onChange={(e) => setKnockoutPick(prev => ({ ...prev, semi2TeamA: e.target.value }))}
                    className="input-field py-2 text-xs sm:text-sm"
                  >
                    <option value="">-- Chọn Đội A --</option>
                    {tournament?.teams?.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Đội B:</label>
                  <select 
                    value={knockoutPick.semi2TeamB}
                    onChange={(e) => setKnockoutPick(prev => ({ ...prev, semi2TeamB: e.target.value }))}
                    className="input-field py-2 text-xs sm:text-sm"
                  >
                    <option value="">-- Chọn Đội B --</option>
                    {tournament?.teams?.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button onClick={handleSetupKnockout} className="btn-primary py-3 sm:py-2.5 px-5 text-sm cursor-pointer w-full sm:w-auto justify-center">
              ⚔️ Khởi tạo vòng Bán kết & Chung kết
            </button>
          </div>
        </div>
      )}

      {/* SCORE EDIT MODAL */}
      {selectedMatch && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedMatch(null)}
        >
          <div 
            className="bg-card border border-border-color rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-border-color pb-3">
              <h3 className="font-bold text-base sm:text-lg text-main">Nhập tỉ số trận đấu</h3>
              <button onClick={() => setSelectedMatch(null)} className="text-muted hover:text-danger cursor-pointer p-1">✕</button>
            </div>

            <div className="space-y-4">
              {/* Team A */}
              <div>
                <label className="text-xs sm:text-sm font-bold text-main block mb-1.5">{selectedMatch.teamAName || 'Đội A'}</label>
                <input
                  type="number"
                  min="0"
                  value={matchScoreA}
                  onChange={(e) => setMatchScoreA(e.target.value)}
                  className="input-field font-mono font-bold text-lg py-2.5"
                />
              </div>

              {/* Team B */}
              <div>
                <label className="text-xs sm:text-sm font-bold text-main block mb-1.5">{selectedMatch.teamBName || 'Đội B'}</label>
                <input
                  type="number"
                  min="0"
                  value={matchScoreB}
                  onChange={(e) => setMatchScoreB(e.target.value)}
                  className="input-field font-mono font-bold text-lg py-2.5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border-color">
              <button onClick={() => setSelectedMatch(null)} className="btn-secondary text-xs sm:text-sm py-2.5 px-4 flex-1 sm:flex-initial">Hủy</button>
              <button onClick={handleSaveScore} className="btn-primary text-xs sm:text-sm py-2.5 px-5 flex-1 sm:flex-initial">Lưu kết quả</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentPage;
