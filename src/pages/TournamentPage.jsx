import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const TrophyIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 4h8v5a4 4 0 01-8 0V4zM8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4M12 13v4M8 20h8M9 17h6" />
  </svg>
);

const CalendarIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="5" width="16" height="15" rx="2" />
    <path d="M4 10h16M9 3v4M15 3v4" />
  </svg>
);

const SwordsIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 4l9 9M19 4l-9 9M4 19l5-5M20 19l-5-5M7 17l-2 3 3-2M17 17l2 3-3-2" />
  </svg>
);

const MedalIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="15" r="5" />
    <path d="M9 10.5L7 3h10l-2 7.5" />
  </svg>
);

const SettingsIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.3 4h3.4l.4 2.3 2 1.1 2.1-.9 1.7 3-1.6 1.6v2.2l1.6 1.6-1.7 3-2.1-.9-2 1.1-.4 2.3h-3.4l-.4-2.3-2-1.1-2.1.9-1.7-3L5.7 14v-2.2L4.1 10.2l1.7-3 2.1.9 2-1.1L10.3 4z" />
    <circle cx="12" cy="12" r="2.4" />
  </svg>
);

const TeamAvatars = ({ players = [], size = 'md', ringColor = 'border-surface' }) => {
  const sizeClass =
    size === 'lg'
      ? 'w-11 h-11 text-sm'
      : size === 'sm'
      ? 'w-7 h-7 text-[11px]'
      : 'w-9 h-9 text-xs';

  if (!players || players.length === 0) {
    return (
      <div className="flex -space-x-2 shrink-0">
        <div className={`${sizeClass} rounded-full bg-surface border-2 ${ringColor} flex items-center justify-center font-bold text-muted shadow-xs`}>
          🏸
        </div>
      </div>
    );
  }

  return (
    <div className="flex -space-x-2 shrink-0">
      {players.map((p, i) => (
        <div
          key={p._id || i}
          className={`${sizeClass} rounded-full overflow-hidden border-2 ${ringColor} bg-surface shadow-sm relative`}
          title={p.name}
        >
          {p.avatarUrl ? (
            <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary/18 text-primary flex items-center justify-center font-extrabold">
              {p.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const PlayerNamesList = ({
  players = [],
  align = 'left',
  fallback = 'Chưa rõ thành viên',
  textColor = 'text-primary-light',
  className = '',
}) => {
  const alignClass =
    align === 'right'
      ? 'items-end text-right'
      : align === 'center'
      ? 'items-center text-center'
      : 'items-start text-left';

  if (!players || players.length === 0) {
    return <p className={`text-[11px] sm:text-xs text-muted m-0 mt-0.5 ${className}`}>{fallback}</p>;
  }

  return (
    <div className={`flex flex-col ${alignClass} gap-0.5 mt-1 ${className}`}>
      {players.map((p, i) => (
        <span
          key={p._id || i}
          className={`block text-[11px] sm:text-xs font-medium ${textColor} leading-snug whitespace-nowrap`}
        >
          {p.name}
        </span>
      ))}
    </div>
  );
};

const RankBadge = ({ rank }) => {
  if (rank === 1) {
    return (
      <span
        className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl inline-flex items-center justify-center font-display font-black text-xs sm:text-sm shadow-md"
        style={{
          background: 'linear-gradient(135deg, #FDE68A, #E8C14A, #B88A12)',
          color: '#1A1202',
          boxShadow: '0 4px 14px -3px rgba(232, 193, 74, 0.5)',
        }}
        title="Hạng 1"
      >
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span
        className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl inline-flex items-center justify-center font-display font-black text-xs sm:text-sm shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #F1F5F9, #C4CCD4, #64748B)',
          color: '#0F172A',
        }}
        title="Hạng 2"
      >
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span
        className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl inline-flex items-center justify-center font-display font-black text-xs sm:text-sm shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #FCD34D, #C98A5A, #78350F)',
          color: '#1C0D04',
        }}
        title="Hạng 3"
      >
        3
      </span>
    );
  }
  return (
    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg inline-flex items-center justify-center font-mono font-bold text-xs text-muted bg-surface border border-border-color">
      {rank}
    </span>
  );
};

const TournamentPage = () => {
  const { isAdmin, isScorer, canEditScore } = useAuth();

  const [activeTab, setActiveTab] = useState('standings'); // 'standings' | 'group' | 'knockout' | 'results' | 'admin'
  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState(null);
  const [standings, setStandings] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [allMembers, setAllMembers] = useState([]);

  // Group schedule filters
  const [matchFilter, setMatchFilter] = useState('all'); // 'all' | 'completed' | 'pending'
  const [teamFilter, setTeamFilter] = useState('all');

  // Admin form state
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [editingTeams, setEditingTeams] = useState([]);
  const [knockoutPick, setKnockoutPick] = useState({
    semi1TeamA: '',
    semi1TeamB: '',
    semi2TeamA: '',
    semi2TeamB: '',
  });

  // Season management form state (Admin)
  const [editSeasonName, setEditSeasonName] = useState('');
  const [editSeasonTitle, setEditSeasonTitle] = useState('');
  const [newSeasonName, setNewSeasonName] = useState('');
  const [newSeasonTitle, setNewSeasonTitle] = useState('Giải Cầu Lông Sát Thủ');

  // Score Modal
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchScoreA, setMatchScoreA] = useState(0);
  const [matchScoreB, setMatchScoreB] = useState(0);

  // Team Quick Edit Modal (Admin)
  const [showEditTeamsModal, setShowEditTeamsModal] = useState(false);

  const fetchTournamentData = async (overrideSeasonId) => {
    try {
      setLoading(true);
      const targetId = overrideSeasonId !== undefined ? overrideSeasonId : selectedSeasonId;
      const res = await api.get('/tournament', {
        params: targetId ? { tournamentId: targetId } : {},
      });
      const fetchedTournament = res.data.data.tournament;
      const fetchedSeasons = res.data.data.seasons || [];

      setTournament(fetchedTournament);
      setStandings(res.data.data.standings || []);
      setSeasons(fetchedSeasons);
      setEditingTeams(fetchedTournament?.teams || []);

      if (fetchedTournament?._id) {
        setSelectedSeasonId(fetchedTournament._id);
        setEditSeasonName(fetchedTournament.season || 'Season 1');
        setEditSeasonTitle(fetchedTournament.title || 'Giải Cầu Lông Sát Thủ');
      }
      setNewSeasonName(`Season ${fetchedSeasons.length + 1}`);
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
    fetchTournamentData('');
    fetchMembers();
  }, [isAdmin]);

  const handleSelectSeason = (seasonId) => {
    setSelectedSeasonId(seasonId);
    setTeamFilter('all');
    setMatchFilter('all');
    fetchTournamentData(seasonId);
  };

  // Create & Archive New Season (Admin)
  const handleCreateNewSeason = async () => {
    const label = newSeasonName.trim() || `Season ${seasons.length + 1}`;
    if (
      !window.confirm(
        `Lưu trữ toàn bộ dữ liệu của mùa giải "${tournament?.season || 'hiện tại'}" vào lịch sử và khởi tạo mùa giải mới "${label}"?`
      )
    ) {
      return;
    }

    try {
      const res = await api.post('/tournament/seasons', {
        season: label,
        title: newSeasonTitle.trim() || 'Giải Cầu Lông Sát Thủ',
      });
      toast.success(res.data.message);
      setSelectedMemberIds([]);
      const newId = res.data.tournament?._id || '';
      setSelectedSeasonId(newId);
      fetchTournamentData(newId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi tạo mùa giải mới');
    }
  };

  // Update Current Season Name / Title (Admin)
  const handleUpdateSeasonInfo = async () => {
    if (!tournament?._id) return;
    try {
      const res = await api.put(`/tournament/seasons/${tournament._id}`, {
        season: editSeasonName,
        title: editSeasonTitle,
      });
      toast.success(res.data.message);
      fetchTournamentData(tournament._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật mùa giải');
    }
  };

  // Set a Season as Active (Admin)
  const handleSetActiveSeason = async (seasonId) => {
    try {
      await api.put(`/tournament/seasons/${seasonId}`, { isActive: true });
      toast.success('Đã chuyển thành mùa giải đang diễn ra');
      setSelectedSeasonId(seasonId);
      fetchTournamentData(seasonId);
    } catch (error) {
      toast.error('Lỗi khi chuyển mùa giải chính');
    }
  };

  // Delete a Season (Admin)
  const handleDeleteSeason = async (seasonId, seasonLabel) => {
    if (
      !window.confirm(
        `⚠️ Bạn có chắc chắn muốn XÓA VĨNH VIỄN mùa giải "${seasonLabel}" khỏi lịch sử không?`
      )
    ) {
      return;
    }
    try {
      const res = await api.delete(`/tournament/seasons/${seasonId}`);
      toast.success(res.data.message);
      const nextId = seasonId === selectedSeasonId ? '' : selectedSeasonId;
      setSelectedSeasonId(nextId);
      fetchTournamentData(nextId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa mùa giải');
    }
  };

  // Lookup map for team info (players, avatars) by team ID or name
  const teamMap = useMemo(() => {
    const map = {};
    (tournament?.teams || []).forEach((t) => {
      if (t._id) map[t._id.toString()] = t;
      if (t.name) map[t.name] = t;
    });
    standings.forEach((s) => {
      if (s.teamId && !map[s.teamId.toString()]) map[s.teamId.toString()] = s;
      if (s.name && !map[s.name]) map[s.name] = s;
    });
    return map;
  }, [tournament, standings]);

  const getTeamDetails = (teamId, teamName) => {
    if (teamId && teamMap[teamId.toString()]) return teamMap[teamId.toString()];
    if (teamName && teamMap[teamName]) return teamMap[teamName];
    return { name: teamName || 'Chưa xác định', players: [] };
  };

  // Handle Random Pairing (Admin)
  const handleRandomPairing = async () => {
    if (selectedMemberIds.length < 2) {
      toast.error('Vui lòng chọn ít nhất 2 thành viên');
      return;
    }

    try {
      const res = await api.post('/tournament/pair-teams', {
        memberIds: selectedMemberIds,
        tournamentId: tournament?._id,
      });
      toast.success(res.data.message);
      fetchTournamentData(tournament?._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi chia cặp');
    }
  };

  // Handle Change a Player in a Team (Admin)
  const handleChangeTeamPlayer = (teamIdx, playerSlotIdx, memberId) => {
    const foundMember = allMembers.find((m) => m._id === memberId) || null;
    setEditingTeams((prev) =>
      prev.map((t, idx) => {
        if (idx !== teamIdx) return t;
        const currentPlayers = Array.isArray(t.players) ? [...t.players] : [];
        currentPlayers[playerSlotIdx] = foundMember;
        return {
          ...t,
          players: currentPlayers.filter((p, i) => i <= 1 && p !== undefined),
        };
      })
    );
  };

  const handleAddManualTeam = () => {
    setEditingTeams((prev) => [
      ...prev,
      {
        name: `Đội ${prev.length + 1}`,
        players: [],
      },
    ]);
  };

  const handleRemoveTeam = (teamIdx) => {
    setEditingTeams((prev) => prev.filter((_, idx) => idx !== teamIdx));
  };

  // Handle Save Team Names & Members (Admin)
  const handleSaveTeams = async () => {
    try {
      const payloadTeams = editingTeams.map((t, idx) => ({
        ...(t._id ? { _id: t._id } : {}),
        name: t.name?.trim() || `Đội ${idx + 1}`,
        players: (t.players || [])
          .map((p) => (p && typeof p === 'object' ? p._id : p))
          .filter(Boolean),
      }));

      await api.put('/tournament/teams', {
        teams: payloadTeams,
        tournamentId: tournament?._id,
      });
      toast.success('Đã lưu tên đội và danh sách thành viên');
      setShowEditTeamsModal(false);
      fetchTournamentData(tournament?._id);
    } catch (error) {
      toast.error('Lỗi khi lưu thông tin đội');
    }
  };

  // Handle Generate Group Schedule (Admin)
  const handleGenerateSchedule = async () => {
    if (!window.confirm('Tạo lịch thi đấu mới sẽ reset các trận vòng bảng cũ của mùa giải này. Bạn chắc chắn chứ?')) return;
    try {
      const res = await api.post('/tournament/generate-schedule', {
        tournamentId: tournament?._id,
      });
      toast.success(res.data.message);
      fetchTournamentData(tournament?._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi tạo lịch thi đấu');
    }
  };

  // Handle Setup Knockout (Admin)
  const handleSetupKnockout = async () => {
    try {
      const res = await api.post('/tournament/setup-knockout', {
        ...knockoutPick,
        tournamentId: tournament?._id,
      });
      toast.success(res.data.message);
      fetchTournamentData(tournament?._id);
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
        status: 'completed',
        tournamentId: tournament?._id,
      });
      toast.success('Đã cập nhật tỉ số');
      setSelectedMatch(null);
      fetchTournamentData(tournament?._id);
    } catch (error) {
      toast.error('Lỗi khi cập nhật tỉ số');
    }
  };

  // Handle Reset All (Admin)
  const handleResetAll = async () => {
    if (
      !window.confirm(
        `⚠️ Bạn có chắc chắn muốn RESET TOÀN BỘ mùa giải "${tournament?.season}"? (Lưu ý: Nếu muốn giữ lại kết quả mùa giải này và tạo mùa giải mới, hãy dùng nút "Lưu mùa giải & Tạo mùa mới" ở phía trên!)`
      )
    )
      return;
    try {
      const res = await api.post('/tournament/reset-all', {
        tournamentId: tournament?._id,
      });
      toast.success(res.data.message);
      setSelectedMemberIds([]);
      setEditingTeams([]);
      fetchTournamentData(tournament?._id);
    } catch (error) {
      toast.error('Lỗi khi reset giải đấu');
    }
  };

  // Handle Reset Scores Only (Admin)
  const handleResetScores = async () => {
    if (
      !window.confirm(
        '⚠️ Bạn có chắc chắn muốn RESET TỈ SỐ của tất cả các trận trong mùa giải này về 0-0? Danh sách các đội sẽ được giữ nguyên.'
      )
    )
      return;
    try {
      const res = await api.post('/tournament/reset-scores', {
        tournamentId: tournament?._id,
      });
      toast.success(res.data.message);
      fetchTournamentData(tournament?._id);
    } catch (error) {
      toast.error('Lỗi khi reset tỉ số');
    }
  };

  const allMatches = tournament?.matches || [];
  const groupMatches = allMatches.filter((m) => m.stage === 'group');
  const semiMatches = allMatches.filter((m) => m.stage === 'semi_final');
  const finalMatch = allMatches.find((m) => m.stage === 'final');

  const completedGroupCount = groupMatches.filter((m) => m.status === 'completed').length;
  const completedTotalCount = allMatches.filter((m) => m.status === 'completed').length;
  const progressPercent = allMatches.length > 0 ? Math.round((completedTotalCount / allMatches.length) * 100) : 0;

  // Filtered group matches
  const filteredGroupMatches = groupMatches.filter((m) => {
    if (matchFilter === 'completed' && m.status !== 'completed') return false;
    if (matchFilter === 'pending' && m.status === 'completed') return false;
    if (teamFilter !== 'all') {
      const matchTeamA = m.teamA?.toString() === teamFilter || m.teamAName === teamFilter;
      const matchTeamB = m.teamB?.toString() === teamFilter || m.teamBName === teamFilter;
      if (!matchTeamA && !matchTeamB) return false;
    }
    return true;
  });

  // Derive tournament podium / results
  let championTeam = null;
  let runnerUpTeam = null;
  let thirdPlaceTeams = [];

  if (finalMatch && finalMatch.status === 'completed' && finalMatch.winner) {
    if (finalMatch.scoreA > finalMatch.scoreB) {
      championTeam = getTeamDetails(finalMatch.teamA, finalMatch.teamAName);
      runnerUpTeam = getTeamDetails(finalMatch.teamB, finalMatch.teamBName);
    } else if (finalMatch.scoreB > finalMatch.scoreA) {
      championTeam = getTeamDetails(finalMatch.teamB, finalMatch.teamBName);
      runnerUpTeam = getTeamDetails(finalMatch.teamA, finalMatch.teamAName);
    }
  }

  semiMatches.forEach((sm) => {
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
        const teamObj = getTeamDetails(loserId, loserName);
        if (!thirdPlaceTeams.some((t) => t.name === teamObj.name)) {
          thirdPlaceTeams.push(teamObj);
        }
      }
    }
  });

  if (loading && !tournament) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="skeleton h-52 w-full rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-20 w-full rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-96 w-full rounded-3xl" />
      </div>
    );
  }

  const TABS = [
    { id: 'standings', label: 'Bảng xếp hạng', shortLabel: 'BXH', icon: <TrophyIcon className="w-4 h-4" /> },
    {
      id: 'group',
      label: 'Lịch Vòng Bảng',
      shortLabel: 'Vòng Bảng',
      badge: `${completedGroupCount}/${groupMatches.length}`,
      icon: <CalendarIcon className="w-4 h-4" />,
    },
    { id: 'knockout', label: 'Vòng Knockout', shortLabel: 'Knockout', icon: <SwordsIcon className="w-4 h-4" /> },
    { id: 'results', label: 'Vinh Danh & Kết Quả', shortLabel: 'Kết Quả', icon: <MedalIcon className="w-4 h-4" /> },
    ...(isAdmin
      ? [
          {
            id: 'admin',
            label: 'Chia cặp & Cấu hình',
            shortLabel: 'Cấu hình',
            icon: <SettingsIcon className="w-4 h-4" />,
          },
        ]
      : []),
  ];

  const openScoreModal = (match) => {
    setSelectedMatch(match);
    setMatchScoreA(match.scoreA ?? 0);
    setMatchScoreB(match.scoreB ?? 0);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-slide-up">
      {/* ====================================================================
          HERO BANNER & STATS STRIP
          ==================================================================== */}
      <section className="glow-border glass-card p-4 sm:p-8 lg:p-10 relative overflow-hidden">
        {/* Ambient Decorative Glows */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ background: 'var(--primary)' }}
        />
        <div
          className="absolute -bottom-24 -left-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: 'var(--accent)' }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3 max-w-2xl w-full">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-extrabold uppercase tracking-wider">
                <span
                  className={`w-2 h-2 rounded-full ${
                    tournament?.isActive ? 'bg-primary-light animate-pulse' : 'bg-amber-400'
                  }`}
                />
                {tournament?.season || 'Season 2'}
                {!tournament?.isActive && ' (Lịch sử)'}
              </span>

              {/* Season Dropdown Selector */}
              {seasons.length > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-surface/90 border border-border-color rounded-full pl-3 pr-2 py-0.5 max-w-full">
                  <span className="text-[11px] font-bold text-muted whitespace-nowrap">Mùa giải:</span>
                  <select
                    value={selectedSeasonId}
                    onChange={(e) => handleSelectSeason(e.target.value)}
                    className="bg-transparent text-main font-extrabold text-xs py-1 pr-1 focus:outline-none cursor-pointer truncate max-w-[190px] sm:max-w-none"
                  >
                    {seasons.map((s) => (
                      <option key={s._id} value={s._id} className="bg-card text-main">
                        {s.season} {s.isActive ? ' (Hiện tại)' : ' (Đã lưu)'}
                        {s.champion ? ` — 🏆 ${s.champion}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {championTeam ? (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                  style={{
                    background: 'rgba(232, 193, 74, 0.14)',
                    borderColor: 'rgba(232, 193, 74, 0.35)',
                    color: 'var(--gold)',
                  }}
                >
                  👑 Đã tìm ra nhà vô địch
                </span>
              ) : allMatches.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border-color text-xs font-semibold text-muted">
                  ⚡ Đang khởi tranh · {progressPercent}% hoàn tất
                </span>
              ) : null}
            </div>

            <h1 className="font-display text-[clamp(1.5rem,4vw,3rem)] font-extrabold text-main m-0 leading-tight">
              {tournament?.title || 'Giải Cầu Lông Sát Thủ'}{' '}
              <span className="grad-text">Championship</span>
            </h1>

            <p className="text-xs sm:text-[15px] text-muted leading-relaxed m-0">
              Theo dõi bảng xếp hạng thời gian thực, lịch thi đấu vòng tròn tính điểm, nhánh đấu loại trực tiếp và lịch sử các mùa giải của{' '}
              <strong className="text-main font-semibold">Saturday Badminton Club</strong>.
            </p>

            {/* Quick Season Pills when multiple seasons exist */}
            {seasons.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted mr-1">
                  Xem mùa giải:
                </span>
                {seasons.map((s) => {
                  const isSelected = s._id === tournament?._id;
                  return (
                    <button
                      key={s._id}
                      type="button"
                      onClick={() => handleSelectSeason(s._id)}
                      className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'bg-surface/80 text-muted hover:text-main border border-border-color'
                      }`}
                    >
                      <span>{s.season}</span>
                      {s.isActive && (
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.2 rounded-full font-extrabold ${
                            isSelected ? 'bg-black/25 text-white' : 'bg-primary/15 text-primary'
                          }`}
                        >
                          Hiện tại
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right visual / Quick Action */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 sm:gap-3 shrink-0">
            <div className="flex items-center gap-3 bg-surface/80 backdrop-blur-md border border-border-color rounded-2xl p-3 sm:p-3.5 pr-4 sm:pr-5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                <img src="/bad_icon01.png" alt="" className="w-8 h-8 sm:w-9 sm:h-9 object-contain" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted">
                  {championTeam ? '👑 Nhà vô địch mùa giải' : 'Đang dẫn đầu BXH'}
                </span>
                <span className="block font-display text-sm sm:text-lg font-extrabold text-main truncate">
                  {championTeam?.name || standings[0]?.name || 'Chưa xác định'}
                </span>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className="btn-primary py-2.5 px-5 text-xs sm:text-sm cursor-pointer shadow-md"
              >
                <SettingsIcon className="w-4 h-4" />
                <span>Quản lý & Mùa giải</span>
              </button>
            )}
            {isScorer && (
              <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary/15 border border-primary/30 text-primary text-xs font-bold">
                ✏️ Chế độ Trọng tài: Được phép nhập tỉ số
              </span>
            )}
          </div>
        </div>

        {/* Historical Season Banner */}
        {tournament && !tournament.isActive && (
          <div className="relative z-10 mt-4 p-3 rounded-2xl bg-amber-500/12 border border-amber-400/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-300 font-semibold">
              <span className="text-base">📚</span>
              <span>
                Đang xem dữ liệu lưu trữ: <strong>{tournament.season}</strong> ({tournament.title})
              </span>
            </div>
            {seasons.some((s) => s.isActive) && (
              <button
                type="button"
                onClick={() => {
                  const activeS = seasons.find((s) => s.isActive);
                  if (activeS) handleSelectSeason(activeS._id);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs cursor-pointer hover:opacity-90 transition-opacity shrink-0 w-full sm:w-auto text-center"
              >
                Chuyển về mùa giải hiện tại →
              </button>
            )}
          </div>
        )}

        {/* Tournament Quick Metrics */}
        <div className="relative z-10 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border-color grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="bg-surface/60 border border-border-light rounded-2xl p-2.5 sm:p-3.5 flex items-center gap-2.5 sm:gap-3">
            <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/12 text-primary flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
                <circle cx="9" cy="8" r="3.2" />
                <path strokeLinecap="round" d="M3 19a6 6 0 0112 0M16 5.5a3.2 3.2 0 010 6.4M21 19a5.5 5.5 0 00-4-5.2" />
              </svg>
            </span>
            <div className="min-w-0">
              <span className="block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted">Đội tham dự</span>
              <span className="font-display text-base sm:text-xl font-bold text-main">
                {tournament?.teams?.length || standings.length || 0} đội
              </span>
            </div>
          </div>

          <div className="bg-surface/60 border border-border-light rounded-2xl p-2.5 sm:p-3.5 flex items-center gap-2.5 sm:gap-3">
            <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent/12 text-accent flex items-center justify-center shrink-0">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div className="min-w-0">
              <span className="block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted">Trận vòng bảng</span>
              <span className="font-display text-base sm:text-xl font-bold text-main">
                {completedGroupCount}/{groupMatches.length} trận
              </span>
            </div>
          </div>

          <div className="bg-surface/60 border border-border-light rounded-2xl p-2.5 sm:p-3.5 flex items-center gap-2.5 sm:gap-3">
            <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-violet/15 text-violet-soft flex items-center justify-center shrink-0">
              <SwordsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div className="min-w-0">
              <span className="block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted">Vòng Knockout</span>
              <span className="font-display text-base sm:text-xl font-bold text-main">
                {semiMatches.length + (finalMatch ? 1 : 0)} trận
              </span>
            </div>
          </div>

          <div className="bg-surface/60 border border-border-light rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-center gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-muted uppercase tracking-wider text-[10px] sm:text-[11px]">Tiến độ giải</span>
              <span className="font-mono font-bold text-primary">{progressPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-bg-main overflow-hidden border border-border-light">
              <div
                className="bar-fill h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          NAVIGATION PILL TABS — FULL WIDTH GRID ON MOBILE (NO SCROLLING!)
          ==================================================================== */}
      <div className="w-full flex items-center justify-center">
        <div
          className={`w-full sm:w-auto grid ${
            isAdmin ? 'grid-cols-5' : 'grid-cols-4'
          } sm:inline-flex items-stretch sm:items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-surface border border-border-color shadow-sm`}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-1 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-sm cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 whitespace-nowrap ${
                  active
                    ? 'bg-linear-to-br from-primary to-primary-light text-on-primary shadow-md shadow-primary/20'
                    : 'text-muted hover:text-main hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center gap-1">
                  {tab.icon}
                  {tab.badge && (
                    <span
                      className={`sm:hidden text-[9px] font-mono font-extrabold px-1 py-0.2 rounded ${
                        active ? 'bg-black/25 text-on-primary' : 'bg-card text-muted border border-border-color'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden leading-tight">{tab.shortLabel}</span>
                {tab.badge && (
                  <span
                    className={`hidden sm:inline-block text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-md ${
                      active ? 'bg-black/20 text-on-primary' : 'bg-card text-muted border border-border-color'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
          TAB 1: BẢNG XẾP HẠNG (STANDINGS)
          ==================================================================== */}
      {activeTab === 'standings' && (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
          {/* Top 3 Mini Spotlight Cards when there are at least 3 teams (Desktop only so Mobile sees BXH table right away) */}
          {standings.length >= 3 && (
            <div className="hidden md:grid md:grid-cols-3 gap-3.5">
              {[0, 1, 2].map((rankIdx) => {
                const team = standings[rankIdx];
                if (!team) return null;
                const colors = [
                  {
                    title: 'Hạng Nhất Tạm Thời',
                    border: 'border-amber-400/40',
                    bg: 'from-amber-500/15 via-amber-500/5 to-transparent',
                    badgeBg: 'var(--gold)',
                    textColor: 'var(--gold)',
                  },
                  {
                    title: 'Hạng Nhì Tạm Thời',
                    border: 'border-slate-400/35',
                    bg: 'from-slate-400/15 via-slate-400/5 to-transparent',
                    badgeBg: 'var(--silver)',
                    textColor: 'var(--silver)',
                  },
                  {
                    title: 'Hạng Ba Tạm Thời',
                    border: 'border-amber-700/40',
                    bg: 'from-amber-700/15 via-amber-700/5 to-transparent',
                    badgeBg: 'var(--bronze)',
                    textColor: 'var(--bronze)',
                  },
                ][rankIdx];

                return (
                  <div
                    key={team.teamId || rankIdx}
                    className={`glass-card lift p-4 sm:p-5 bg-gradient-to-br ${colors.bg} ${colors.border} flex items-center justify-between gap-3`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <RankBadge rank={rankIdx + 1} />
                      <TeamAvatars players={team.players} size="md" />
                      <div className="min-w-0">
                        <span
                          className="block text-[10px] font-extrabold uppercase tracking-wider"
                          style={{ color: colors.textColor }}
                        >
                          {colors.title}
                        </span>
                        <h4 className="font-display font-bold text-main text-base m-0">{team.name}</h4>
                        <PlayerNamesList
                          players={team.players}
                          align="left"
                          fallback="Cặp đôi thi đấu"
                          textColor="text-muted"
                        />
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <span className="block font-display text-2xl font-black text-primary leading-none">
                        {team.points}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Điểm</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Main Standings Table Card */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-border-color bg-surface/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-main m-0 flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-primary" />
                  <span>Bảng Xếp Hạng Vòng Bảng</span>
                </h3>
                <p className="text-xs text-muted mt-0.5 m-0">
                  Xếp hạng tính theo: Điểm số (PTS) → Hiệu số điểm (+/-) → Tổng điểm ghi được
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTeams(tournament?.teams || []);
                      setShowEditTeamsModal(true);
                    }}
                    className="text-xs font-bold text-primary bg-primary/12 hover:bg-primary/20 px-3 py-1.5 rounded-full border border-primary/30 cursor-pointer transition-colors inline-flex items-center gap-1.5"
                  >
                    ✏️ Sửa đội & thành viên
                  </button>
                )}
                <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  Top 4 đội vào Bán kết
                </div>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="bg-surface/80 text-muted uppercase text-[10px] sm:text-[11px] font-bold tracking-wider border-b border-border-color">
                  <tr>
                    <th className="px-1.5 sm:px-4 py-2.5 sm:py-3.5 text-center w-8 sm:w-16">
                      <span className="hidden sm:inline">Hạng</span>
                      <span className="sm:hidden">#</span>
                    </th>
                    <th className="px-1.5 sm:px-4 py-2.5 sm:py-3.5">Đội thi đấu</th>
                    <th className="px-1 sm:px-3 py-2.5 sm:py-3.5 text-center" title="Số trận đã đấu">
                      <span className="hidden sm:inline">Đã đấu</span>
                      <span className="sm:hidden">Trận</span>
                    </th>
                    <th className="px-1 sm:px-3 py-2.5 sm:py-3.5 text-center text-success">
                      <span className="hidden sm:inline">Thắng</span>
                      <span className="sm:hidden">W</span>
                    </th>
                    <th className="px-1 sm:px-3 py-2.5 sm:py-3.5 text-center text-danger">
                      <span className="hidden sm:inline">Thua</span>
                      <span className="sm:hidden">L</span>
                    </th>
                    <th className="px-1 sm:px-3 py-2.5 sm:py-3.5 text-center">
                      <span className="hidden sm:inline">Hiệu số</span>
                      <span className="sm:hidden">+/-</span>
                    </th>
                    <th className="hidden md:table-cell px-3 py-3.5 text-center">Tỉ lệ thắng</th>
                    <th className="px-1.5 sm:px-5 py-2.5 sm:py-3.5 text-center font-extrabold text-main">
                      <span className="hidden sm:inline">Điểm (PTS)</span>
                      <span className="sm:hidden">PTS</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {standings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-14 text-muted">
                        <div className="w-14 h-14 rounded-full bg-surface border border-border-color flex items-center justify-center mx-auto mb-3 text-2xl">
                          🏸
                        </div>
                        <p className="font-bold text-main text-base mb-1">Chưa có đội nào tham gia giải đấu</p>
                        <p className="text-xs text-muted m-0">
                          Admin có thể vào mục Cấu hình để chia cặp ngẫu nhiên và tạo lịch thi đấu.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    standings.map((team, idx) => {
                      const isTop4 = idx < 4;
                      const winRate = team.played > 0 ? Math.round((team.wins / team.played) * 100) : 0;

                      return (
                        <tr
                          key={team.teamId || idx}
                          className={`hover:bg-surface-hover/60 transition-colors ${
                            idx === 0
                              ? 'bg-amber-500/[0.06]'
                              : idx === 1
                              ? 'bg-slate-400/[0.05]'
                              : idx === 2
                              ? 'bg-amber-700/[0.05]'
                              : ''
                          }`}
                        >
                          <td className="px-1 sm:px-4 py-2.5 sm:py-3.5 text-center">
                            <div className="flex items-center justify-center">
                              <RankBadge rank={idx + 1} />
                            </div>
                          </td>

                          <td className="px-1.5 sm:px-4 py-2.5 sm:py-3.5 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3.5">
                              <div className="hidden sm:block">
                                <TeamAvatars players={team.players} size="md" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-main text-xs sm:text-[15px] leading-snug m-0">
                                    {team.name}
                                  </p>
                                  {isTop4 && standings.length > 4 && (
                                    <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/12 text-primary border border-primary/25 shrink-0">
                                      Top 4
                                    </span>
                                  )}
                                </div>
                                <PlayerNamesList
                                  players={team.players}
                                  align="left"
                                  fallback="Chưa có thành viên"
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-1 sm:px-3 py-2.5 sm:py-3.5 text-center font-mono font-semibold text-xs sm:text-sm text-muted">
                            {team.played}
                          </td>

                          <td className="px-1 sm:px-3 py-2.5 sm:py-3.5 text-center">
                            <span className="inline-flex items-center justify-center min-w-[20px] sm:min-w-[24px] px-1 sm:px-1.5 py-0.5 rounded-md bg-success/12 text-success font-mono font-bold text-xs sm:text-sm">
                              {team.wins}
                            </span>
                          </td>

                          <td className="px-1 sm:px-3 py-2.5 sm:py-3.5 text-center">
                            <span className="inline-flex items-center justify-center min-w-[20px] sm:min-w-[24px] px-1 sm:px-1.5 py-0.5 rounded-md bg-danger/12 text-danger font-mono font-semibold text-xs sm:text-sm">
                              {team.losses}
                            </span>
                          </td>

                          <td className="px-1 sm:px-3 py-2.5 sm:py-3.5 text-center font-mono font-bold text-xs sm:text-sm">
                            <span
                              className={`px-1 sm:px-2 py-0.5 rounded-md ${
                                team.scoreDiff > 0
                                  ? 'text-success bg-success/10'
                                  : team.scoreDiff < 0
                                  ? 'text-danger bg-danger/10'
                                  : 'text-muted'
                              }`}
                            >
                              {team.scoreDiff > 0 ? `+${team.scoreDiff}` : team.scoreDiff}
                            </span>
                          </td>

                          <td className="hidden md:table-cell px-3 py-3.5 w-36">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden border border-border-light">
                                <div
                                  className="h-full rounded-full bg-primary transition-all"
                                  style={{ width: `${winRate}%` }}
                                />
                              </div>
                              <span className="font-mono text-xs text-muted w-9 text-right">{winRate}%</span>
                            </div>
                          </td>

                          <td className="px-1.5 sm:px-5 py-2.5 sm:py-3.5 text-center">
                            <span className="inline-flex items-center justify-center min-w-[26px] sm:min-w-[36px] px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-primary/15 border border-primary/30 font-display font-black text-xs sm:text-lg text-primary">
                              {team.points}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 2: LỊCH THI ĐẤU VÒNG BẢNG (GROUP SCHEDULE)
          ==================================================================== */}
      {activeTab === 'group' && (
        <div className="space-y-5 animate-fade-in">
          {/* Filter & Action Bar */}
          <div className="glass-card p-3.5 sm:p-5 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 sm:gap-4">
            <div className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2">
              {[
                { id: 'all', label: `Tất cả (${groupMatches.length})` },
                { id: 'pending', label: `Chưa đấu (${groupMatches.length - completedGroupCount})` },
                { id: 'completed', label: `Đã kết thúc (${completedGroupCount})` },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setMatchFilter(f.id)}
                  className={`px-2 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold cursor-pointer transition-all text-center whitespace-nowrap ${
                    matchFilter === f.id
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface text-muted hover:text-main border border-border-color'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {tournament?.teams?.length > 0 && (
                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="input-field py-2 px-3.5 text-xs sm:text-sm sm:w-64"
                >
                  <option value="all">Tất cả các đội</option>
                  {tournament.teams.map((t) => {
                    const pNames = t.players?.map((p) => p.name).filter(Boolean).join(' & ');
                    return (
                      <option key={t._id} value={t._id}>
                        {pNames ? `${t.name} (${pNames})` : t.name}
                      </option>
                    );
                  })}
                </select>
              )}

              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTeams(tournament?.teams || []);
                      setShowEditTeamsModal(true);
                    }}
                    className="btn-secondary text-xs py-2.5 px-3.5 shrink-0 cursor-pointer"
                  >
                    ✏️ Sửa đội & thành viên
                  </button>
                  <button
                    onClick={handleGenerateSchedule}
                    className="btn-secondary text-xs py-2.5 px-4 shrink-0 cursor-pointer"
                  >
                    🔄 Tạo lại lịch vòng bảng
                  </button>
                </div>
              )}
            </div>
          </div>

          {filteredGroupMatches.length === 0 ? (
            <div className="glass-card p-10 sm:p-14 text-center text-muted border-dashed">
              <div className="w-16 h-16 rounded-full bg-surface border border-border-color flex items-center justify-center mx-auto mb-3 text-2xl">
                📅
              </div>
              <h4 className="font-bold text-main text-base mb-1">Không có trận đấu nào</h4>
              <p className="text-xs sm:text-sm text-muted m-0">
                {groupMatches.length === 0
                  ? 'Chưa có lịch thi đấu vòng bảng. Admin hãy chọn các cặp đấu và tạo lịch thi đấu!'
                  : 'Không tìm thấy trận đấu nào khớp với bộ lọc hiện tại.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGroupMatches.map((match, idx) => {
                const originalIndex = groupMatches.findIndex((m) => m._id === match._id);
                const matchNum = originalIndex >= 0 ? originalIndex + 1 : idx + 1;
                const isCompleted = match.status === 'completed';
                const aWon = isCompleted && match.scoreA > match.scoreB;
                const bWon = isCompleted && match.scoreB > match.scoreA;

                const teamAInfo = getTeamDetails(match.teamA, match.teamAName);
                const teamBInfo = getTeamDetails(match.teamB, match.teamBName);

                return (
                  <div
                    key={match._id || idx}
                    className={`glass-card lift p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden ${
                      isCompleted ? 'border-primary/25' : ''
                    }`}
                  >
                    {/* Top Row: Match Number & Status */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                          TRẬN #{String(matchNum).padStart(2, '0')}
                        </span>
                        <span className="text-[11px] text-muted font-medium hidden sm:inline">Vòng bảng</span>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${
                          isCompleted
                            ? 'badge-paid'
                            : 'bg-surface text-muted border border-border-color'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCompleted ? 'bg-success' : 'bg-warn animate-pulse'
                          }`}
                        />
                        {isCompleted ? 'Đã kết thúc' : 'Chờ thi đấu'}
                      </span>
                    </div>

                    {/* Matchup Arena Box */}
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-3 sm:px-4 sm:py-3.5 rounded-2xl bg-surface/60 border border-border-color">
                      {/* Team A */}
                      <div className="flex flex-col items-start min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <TeamAvatars players={teamAInfo.players} size="sm" />
                          {aWon && (
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-success/15 text-success">
                              Thắng
                            </span>
                          )}
                        </div>
                        <p
                          className={`font-bold text-xs sm:text-[15px] leading-snug w-full m-0 ${
                            aWon ? 'text-main' : isCompleted ? 'text-muted' : 'text-main'
                          }`}
                          title={teamAInfo.name || match.teamAName}
                        >
                          {teamAInfo.name || match.teamAName || 'Đội A'}
                        </p>
                        <PlayerNamesList
                          players={teamAInfo.players}
                          align="left"
                          fallback="Chưa rõ thành viên"
                        />
                      </div>

                      {/* Scoreboard Pill */}
                      <div className="flex flex-col items-center justify-center px-1">
                        {isCompleted ? (
                          <div className="bg-card border border-border-color px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 sm:gap-2 font-mono font-black text-base sm:text-xl shadow-inner">
                            <span className={aWon ? 'text-success' : 'text-muted'}>{match.scoreA}</span>
                            <span className="text-muted text-xs font-normal">:</span>
                            <span className={bWon ? 'text-success' : 'text-muted'}>{match.scoreB}</span>
                          </div>
                        ) : (
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-card border border-border-color flex items-center justify-center font-display font-black text-[11px] sm:text-xs text-muted tracking-wider shadow-xs">
                            VS
                          </div>
                        )}
                      </div>

                      {/* Team B */}
                      <div className="flex flex-col items-end text-right min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          {bWon && (
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-success/15 text-success">
                              Thắng
                            </span>
                          )}
                          <TeamAvatars players={teamBInfo.players} size="sm" />
                        </div>
                        <p
                          className={`font-bold text-xs sm:text-[15px] leading-snug w-full m-0 ${
                            bWon ? 'text-main' : isCompleted ? 'text-muted' : 'text-main'
                          }`}
                          title={teamBInfo.name || match.teamBName}
                        >
                          {teamBInfo.name || match.teamBName || 'Đội B'}
                        </p>
                        <PlayerNamesList
                          players={teamBInfo.players}
                          align="right"
                          fallback="Chưa rõ thành viên"
                        />
                      </div>
                    </div>

                    {/* Admin / Scorer Edit Score Button */}
                    {canEditScore && (
                      <div className="mt-3 pt-2.5 border-t border-border-light flex justify-end">
                        <button
                          type="button"
                          onClick={() => openScoreModal(match)}
                          className="text-xs font-bold text-primary hover:text-primary-light bg-primary/10 hover:bg-primary/18 px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          {isCompleted ? 'Cập nhật tỉ số' : 'Nhập tỉ số'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          TAB 3: VÒNG KNOCKOUT (BÁN KẾT & CHUNG KẾT)
          ==================================================================== */}
      {activeTab === 'knockout' && (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
          {/* Winner Celebration Banner if Final is completed */}
          {finalMatch && finalMatch.status === 'completed' && finalMatch.winner && (
            <div className="sheen glass-card p-6 sm:p-8 text-center bg-gradient-to-r from-amber-500/15 via-primary/10 to-amber-500/15 border-amber-400/40 relative overflow-hidden">
              <div className="mb-3">
                <img
                  src="/bad_icon01.png"
                  alt="Cúp vô địch"
                  className="w-20 h-20 sm:w-24 sm:h-24 mx-auto object-contain"
                  style={{ filter: 'drop-shadow(0 12px 28px rgba(232,193,74,0.5))' }}
                />
              </div>
              <span className="inline-block text-[11px] font-black uppercase tracking-[0.2em] text-amber-400 bg-amber-400/15 px-3.5 py-1 rounded-full border border-amber-400/30 mb-2">
                NHÀ VÔ ĐỊCH MÙA GIẢI
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-main m-0">
                {finalMatch.winner}
              </h2>
              {championTeam?.players?.length > 0 && (
                <PlayerNamesList
                  players={championTeam.players}
                  align="center"
                  textColor="text-primary-light"
                  className="mt-1.5"
                />
              )}
              <p className="text-muted text-xs sm:text-sm mt-2 m-0">
                Chúc mừng tân vương giải cầu lông Saturday Badminton Club!
              </p>
            </div>
          )}

          {/* Bracket Tree Arena */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr_1fr] gap-5 sm:gap-6 items-stretch">
            {/* Semi Final 1 */}
            {(() => {
              const sm1 = semiMatches[0];
              const isDone = sm1?.status === 'completed';
              const aWin = isDone && sm1.scoreA > sm1.scoreB;
              const bWin = isDone && sm1.scoreB > sm1.scoreA;
              const teamA = sm1 ? getTeamDetails(sm1.teamA, sm1.teamAName) : null;
              const teamB = sm1 ? getTeamDetails(sm1.teamB, sm1.teamBName) : null;

              return (
                <div className="glass-card p-5 sm:p-6 flex flex-col justify-between relative border-t-4 border-t-primary">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <SwordsIcon className="w-4 h-4" />
                        Bán Kết 1
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isDone ? 'badge-paid' : 'bg-surface text-muted border border-border-color'
                        }`}
                      >
                        {isDone ? 'Hoàn tất' : 'Nhánh A'}
                      </span>
                    </div>

                    {sm1 ? (
                      <div className="space-y-2.5">
                        {/* Team A Row */}
                        <div
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            aWin
                              ? 'bg-primary/12 border-primary/40 shadow-sm'
                              : 'bg-surface/70 border-border-color'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 mr-2">
                            <TeamAvatars players={teamA?.players} size="sm" />
                            <div className="min-w-0">
                              <p className="font-bold text-main text-xs sm:text-sm m-0">{sm1.teamAName}</p>
                              <PlayerNamesList
                                players={teamA?.players}
                                align="left"
                                fallback="Chưa xác định thành viên"
                              />
                            </div>
                          </div>
                          <span
                            className={`font-mono font-black text-base sm:text-lg px-2.5 py-1 rounded-lg ${
                              aWin ? 'bg-primary text-on-primary' : 'bg-card text-main border border-border-color'
                            }`}
                          >
                            {sm1.scoreA}
                          </span>
                        </div>

                        {/* Team B Row */}
                        <div
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            bWin
                              ? 'bg-primary/12 border-primary/40 shadow-sm'
                              : 'bg-surface/70 border-border-color'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 mr-2">
                            <TeamAvatars players={teamB?.players} size="sm" />
                            <div className="min-w-0">
                              <p className="font-bold text-main text-xs sm:text-sm m-0">{sm1.teamBName}</p>
                              <PlayerNamesList
                                players={teamB?.players}
                                align="left"
                                fallback="Chưa xác định thành viên"
                              />
                            </div>
                          </div>
                          <span
                            className={`font-mono font-black text-base sm:text-lg px-2.5 py-1 rounded-lg ${
                              bWin ? 'bg-primary text-on-primary' : 'bg-card text-main border border-border-color'
                            }`}
                          >
                            {sm1.scoreB}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-10 text-center bg-surface/50 rounded-2xl border border-dashed border-border-color">
                        <p className="text-muted text-xs sm:text-sm m-0">Chưa thiết lập cặp đấu Bán kết 1</p>
                      </div>
                    )}
                  </div>

                  {canEditScore && sm1 && (
                    <button
                      type="button"
                      onClick={() => openScoreModal(sm1)}
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-surface hover:bg-surface-hover border border-border-color text-xs font-bold text-primary cursor-pointer transition-colors"
                    >
                      ✏️ Nhập tỉ số Bán kết 1
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Final Match (Centerpiece) */}
            {(() => {
              const isDone = finalMatch?.status === 'completed';
              const aWin = isDone && finalMatch.scoreA > finalMatch.scoreB;
              const bWin = isDone && finalMatch.scoreB > finalMatch.scoreA;
              const teamA = finalMatch ? getTeamDetails(finalMatch.teamA, finalMatch.teamAName) : null;
              const teamB = finalMatch ? getTeamDetails(finalMatch.teamB, finalMatch.teamBName) : null;

              return (
                <div className="glow-border glass-card p-6 sm:p-7 border-2 border-amber-400/40 bg-gradient-to-b from-amber-500/10 via-primary/5 to-transparent shadow-2xl relative flex flex-col justify-between">
                  <div>
                    <div className="text-center mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center mx-auto mb-2.5">
                        <TrophyIcon className="w-6 h-6 text-amber-400" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400 block">
                        CHUNG KẾT TRANH CÚP
                      </span>
                      <p className="text-[11px] text-muted mt-0.5 m-0">Đội thắng Bán kết 1 vs Đội thắng Bán kết 2</p>
                    </div>

                    {finalMatch ? (
                      <div className="space-y-3">
                        {/* Finalist A */}
                        <div
                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                            aWin
                              ? 'bg-amber-400/15 border-amber-400/60 shadow-md'
                              : 'bg-card border-border-color'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 mr-2">
                            <TeamAvatars players={teamA?.players} size="md" />
                            <div className="min-w-0 text-left">
                              <p className="font-display font-extrabold text-main text-sm sm:text-base m-0">
                                {finalMatch.teamAName || 'Thắng Bán Kết 1'}
                              </p>
                              <PlayerNamesList
                                players={teamA?.players}
                                align="left"
                                fallback="Đội thắng BK 1"
                              />
                            </div>
                          </div>
                          <span
                            className={`font-mono font-black text-lg sm:text-xl px-3 py-1 rounded-xl ${
                              aWin
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-surface text-main border border-border-color'
                            }`}
                          >
                            {finalMatch.scoreA}
                          </span>
                        </div>

                        <div className="text-center">
                          <span className="inline-block text-[10px] font-black tracking-widest uppercase text-muted px-2.5 py-0.5 rounded-full bg-surface border border-border-color">
                            VS
                          </span>
                        </div>

                        {/* Finalist B */}
                        <div
                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                            bWin
                              ? 'bg-amber-400/15 border-amber-400/60 shadow-md'
                              : 'bg-card border-border-color'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 mr-2">
                            <TeamAvatars players={teamB?.players} size="md" />
                            <div className="min-w-0 text-left">
                              <p className="font-display font-extrabold text-main text-sm sm:text-base m-0">
                                {finalMatch.teamBName || 'Thắng Bán Kết 2'}
                              </p>
                              <PlayerNamesList
                                players={teamB?.players}
                                align="left"
                                fallback="Đội thắng BK 2"
                              />
                            </div>
                          </div>
                          <span
                            className={`font-mono font-black text-lg sm:text-xl px-3 py-1 rounded-xl ${
                              bWin
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-surface text-main border border-border-color'
                            }`}
                          >
                            {finalMatch.scoreB}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-10 text-center bg-surface/50 rounded-2xl border border-dashed border-border-color">
                        <p className="text-muted text-xs sm:text-sm m-0">Chưa khởi tạo trận Chung kết</p>
                      </div>
                    )}
                  </div>

                  {canEditScore && finalMatch && (
                    <button
                      type="button"
                      onClick={() => openScoreModal(finalMatch)}
                      className="mt-5 btn-primary py-2.5 px-4 text-xs cursor-pointer w-full"
                    >
                      🏆 Cập nhật tỉ số Chung kết
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Semi Final 2 */}
            {(() => {
              const sm2 = semiMatches[1];
              const isDone = sm2?.status === 'completed';
              const aWin = isDone && sm2.scoreA > sm2.scoreB;
              const bWin = isDone && sm2.scoreB > sm2.scoreA;
              const teamA = sm2 ? getTeamDetails(sm2.teamA, sm2.teamAName) : null;
              const teamB = sm2 ? getTeamDetails(sm2.teamB, sm2.teamBName) : null;

              return (
                <div className="glass-card p-5 sm:p-6 flex flex-col justify-between relative border-t-4 border-t-accent">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-1.5">
                        <SwordsIcon className="w-4 h-4" />
                        Bán Kết 2
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isDone ? 'badge-paid' : 'bg-surface text-muted border border-border-color'
                        }`}
                      >
                        {isDone ? 'Hoàn tất' : 'Nhánh B'}
                      </span>
                    </div>

                    {sm2 ? (
                      <div className="space-y-2.5">
                        {/* Team A Row */}
                        <div
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            aWin
                              ? 'bg-primary/12 border-primary/40 shadow-sm'
                              : 'bg-surface/70 border-border-color'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 mr-2">
                            <TeamAvatars players={teamA?.players} size="sm" />
                            <div className="min-w-0">
                              <p className="font-bold text-main text-xs sm:text-sm m-0">{sm2.teamAName}</p>
                              <PlayerNamesList
                                players={teamA?.players}
                                align="left"
                                fallback="Chưa xác định thành viên"
                              />
                            </div>
                          </div>
                          <span
                            className={`font-mono font-black text-base sm:text-lg px-2.5 py-1 rounded-lg ${
                              aWin ? 'bg-primary text-on-primary' : 'bg-card text-main border border-border-color'
                            }`}
                          >
                            {sm2.scoreA}
                          </span>
                        </div>

                        {/* Team B Row */}
                        <div
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            bWin
                              ? 'bg-primary/12 border-primary/40 shadow-sm'
                              : 'bg-surface/70 border-border-color'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 mr-2">
                            <TeamAvatars players={teamB?.players} size="sm" />
                            <div className="min-w-0">
                              <p className="font-bold text-main text-xs sm:text-sm m-0">{sm2.teamBName}</p>
                              <PlayerNamesList
                                players={teamB?.players}
                                align="left"
                                fallback="Chưa xác định thành viên"
                              />
                            </div>
                          </div>
                          <span
                            className={`font-mono font-black text-base sm:text-lg px-2.5 py-1 rounded-lg ${
                              bWin ? 'bg-primary text-on-primary' : 'bg-card text-main border border-border-color'
                            }`}
                          >
                            {sm2.scoreB}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-10 text-center bg-surface/50 rounded-2xl border border-dashed border-border-color">
                        <p className="text-muted text-xs sm:text-sm m-0">Chưa thiết lập cặp đấu Bán kết 2</p>
                      </div>
                    )}
                  </div>

                  {canEditScore && sm2 && (
                    <button
                      type="button"
                      onClick={() => openScoreModal(sm2)}
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-surface hover:bg-surface-hover border border-border-color text-xs font-bold text-primary cursor-pointer transition-colors"
                    >
                      ✏️ Nhập tỉ số Bán kết 2
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 4: KẾT QUẢ GIẢI ĐẤU (RESULTS & PODIUM)
          ==================================================================== */}
      {activeTab === 'results' && (
        <div className="space-y-8 animate-fade-in">
          {/* Podium Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-end pt-4">
            {/* Champion (1st Place) */}
            <div className="glass-card p-6 sm:p-7 text-center border-2 border-amber-400/70 bg-gradient-to-b from-amber-500/20 via-amber-400/5 to-transparent shadow-2xl relative flex flex-col justify-between order-1 md:order-2 md:-translate-y-3">
              {/* Sheen is on its own clipped layer so the badge can overhang the card edge */}
              <div aria-hidden="true" className="sheen absolute inset-0 rounded-[inherit] pointer-events-none" />
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-[11px] px-4 py-1 rounded-full uppercase tracking-widest shadow-md whitespace-nowrap">
                👑 QUÁN QUÂN
              </div>

              <div className="pt-3">
                <div className="mb-3">
                  <img
                    src="/bad_icon01.png"
                    alt="Huy chương vàng"
                    className="w-24 h-24 mx-auto object-contain"
                    style={{ filter: 'drop-shadow(0 12px 24px rgba(232,193,74,0.5))' }}
                  />
                </div>
                <h3 className="font-display font-black text-xl sm:text-2xl text-main m-0">
                  {championTeam?.name || 'Đang cập nhật...'}
                </h3>
                <div className="flex justify-center my-3.5">
                  <TeamAvatars players={championTeam?.players} size="lg" ringColor="border-amber-400" />
                </div>
                <PlayerNamesList
                  players={championTeam?.players}
                  align="center"
                  textColor="text-amber-400"
                  fallback="Cặp đôi vô địch mùa giải"
                />
              </div>

              <div className="mt-5 pt-3.5 border-t border-amber-400/25">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-400/20 text-amber-400 border border-amber-400/35">
                  🥇 Huy Chương Vàng
                </span>
              </div>
            </div>

            {/* Runner-up (2nd Place) */}
            <div className="glass-card p-6 text-center border-2 border-slate-400/50 bg-gradient-to-b from-slate-400/15 via-slate-300/5 to-transparent shadow-lg relative flex flex-col justify-between order-2 md:order-1">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-950 font-black text-[11px] px-3.5 py-1 rounded-full uppercase tracking-widest shadow-md whitespace-nowrap">
                Á QUÂN
              </div>

              <div className="pt-3">
                <div className="mb-3 flex justify-center">
                  <span
                    className="w-16 h-16 rounded-2xl flex items-center justify-center font-display text-3xl font-black text-slate-950 shadow-md"
                    style={{ background: 'linear-gradient(135deg, #F1F5F9, #C4CCD4, #64748B)' }}
                  >
                    2
                  </span>
                </div>
                <h3 className="font-display font-black text-lg sm:text-xl text-main m-0">
                  {runnerUpTeam?.name || 'Đang cập nhật...'}
                </h3>
                <div className="flex justify-center my-3">
                  <TeamAvatars players={runnerUpTeam?.players} size="md" ringColor="border-slate-300" />
                </div>
                <PlayerNamesList
                  players={runnerUpTeam?.players}
                  align="center"
                  textColor="text-slate-300"
                  fallback="Cặp đôi Á quân"
                />
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-400/25">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-400/20 text-slate-300 border border-slate-400/30">
                  🥈 Huy Chương Bạc
                </span>
              </div>
            </div>

            {/* Third Place (3rd Place) */}
            <div className="glass-card p-6 text-center border-2 border-amber-700/60 bg-gradient-to-b from-amber-800/20 via-amber-700/5 to-transparent shadow-lg relative flex flex-col justify-between order-3">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-700 text-white font-black text-[11px] px-3.5 py-1 rounded-full uppercase tracking-widest shadow-md whitespace-nowrap">
                ĐỒNG HẠNG BA
              </div>

              <div className="pt-3">
                <div className="mb-3 flex justify-center">
                  <span
                    className="w-16 h-16 rounded-2xl flex items-center justify-center font-display text-3xl font-black text-amber-950 shadow-md"
                    style={{ background: 'linear-gradient(135deg, #FCD34D, #C98A5A, #78350F)' }}
                  >
                    3
                  </span>
                </div>
                <h3 className="font-display font-black text-lg sm:text-xl text-main m-0">
                  {thirdPlaceTeams.length > 0 ? thirdPlaceTeams.map((t) => t.name).join(' & ') : 'Đang cập nhật...'}
                </h3>
                <div className="flex justify-center gap-2 my-3">
                  {thirdPlaceTeams.length > 0 ? (
                    thirdPlaceTeams.map((t, i) => (
                      <TeamAvatars key={i} players={t.players} size="sm" ringColor="border-amber-700" />
                    ))
                  ) : (
                    <TeamAvatars players={[]} size="md" />
                  )}
                </div>
                <p className="text-xs font-semibold text-amber-500 m-0">
                  {thirdPlaceTeams.length > 0
                    ? thirdPlaceTeams
                        .map((t) => t.players?.map((p) => p.name).join(' & ') || t.name)
                        .join(' · ')
                    : 'Hai đội dừng bước tại Bán kết'}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-amber-700/30">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-700/20 text-amber-500 border border-amber-700/35">
                  🥉 Huy Chương Đồng
                </span>
              </div>
            </div>
          </div>

          {/* Full Standing Ranks List */}
          <div className="glass-card p-5 sm:p-6">
            <h3 className="font-display font-bold text-base sm:text-lg text-main mb-4 flex items-center gap-2 m-0">
              <MedalIcon className="w-5 h-5 text-primary" />
              <span>Tổng Sắp Toàn Giải Đấu</span>
            </h3>

            <div className="space-y-2.5">
              {standings.map((t, idx) => (
                <div
                  key={t.teamId || idx}
                  className="flex items-center justify-between p-3 sm:p-3.5 bg-surface/70 hover:bg-surface transition-colors rounded-2xl border border-border-color gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <RankBadge rank={idx + 1} />
                    <TeamAvatars players={t.players} size="sm" />
                    <div className="min-w-0">
                      <p className="font-bold text-main text-xs sm:text-sm truncate m-0">{t.name}</p>
                      <PlayerNamesList
                        players={t.players}
                        align="left"
                        textColor="text-muted"
                        fallback="Chưa có thành viên"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-5 text-xs sm:text-sm font-semibold shrink-0">
                    <span className="text-muted hidden sm:inline">{t.played} trận</span>
                    <span className="font-mono text-xs sm:text-sm">
                      <strong className="text-success">{t.wins}W</strong> -{' '}
                      <span className="text-danger">{t.losses}L</span>
                    </span>
                    <span className="font-mono text-primary font-black px-2.5 py-1 rounded-lg bg-primary/12 border border-primary/25">
                      {t.points} PTS
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hall of Fame / Historical Seasons List */}
          {seasons.length > 0 && (
            <div className="glass-card p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-main m-0 flex items-center gap-2">
                    <TrophyIcon className="w-5 h-5 text-amber-400" />
                    <span>Lịch Sử Các Mùa Giải ({seasons.length})</span>
                  </h3>
                  <p className="text-xs text-muted mt-0.5 m-0">
                    Bấm vào bất kỳ mùa giải nào để xem lại toàn bộ BXH, lịch thi đấu và kết quả của mùa giải đó.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {seasons.map((s) => {
                  const isCurrentViewing = s._id === tournament?._id;
                  return (
                    <div
                      key={s._id}
                      onClick={() => {
                        handleSelectSeason(s._id);
                        setActiveTab('standings');
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrentViewing
                          ? 'bg-primary/12 border-primary/45 shadow-sm'
                          : 'bg-surface/60 hover:bg-surface border-border-color'
                      }`}
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-extrabold text-sm sm:text-base text-main">
                            {s.season}
                          </span>
                          {s.isActive ? (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                              Đang diễn ra
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-surface text-muted border border-border-color">
                              Đã lưu trữ
                            </span>
                          )}
                          {isCurrentViewing && (
                            <span className="text-[10px] font-bold text-primary-light">• Đang xem</span>
                          )}
                        </div>
                        <p className="text-xs text-muted m-0">
                          {s.teamCount} đội tham dự · {s.completedCount}/{s.matchCount} trận đã đấu
                        </p>
                        {s.champion ? (
                          <p className="text-xs font-bold text-amber-400 m-0">
                            👑 Vô địch: {s.champion}
                            {s.championPlayers?.length > 0 ? ` (${s.championPlayers.join(' & ')})` : ''}
                          </p>
                        ) : (
                          <p className="text-xs text-muted italic m-0">Chưa xác định nhà vô địch</p>
                        )}
                      </div>

                      <span className="px-3 py-1.5 rounded-xl bg-card border border-border-color text-xs font-bold text-primary shrink-0">
                        Xem BXH →
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          TAB 5: ADMIN SETTINGS & PAIRING
          ==================================================================== */}
      {activeTab === 'admin' && isAdmin && (
        <div className="space-y-6 animate-fade-in">
          {/* Section 0: Season Archive & Multi-Season Management */}
          <div className="glass-card p-5 sm:p-6 border-l-4 border-l-primary">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-5">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary block mb-1">
                  LƯU TRỮ LỊCH SỬ & QUẢN LÝ MÙA GIẢI
                </span>
                <h3 className="font-display font-bold text-base sm:text-lg text-main m-0">
                  0. Lưu mùa giải trước & Tổ chức mùa giải mới
                </h3>
                <p className="text-xs sm:text-sm text-muted mt-1 m-0">
                  Khi bắt đầu giải mới, hãy bấm <strong>Lưu mùa giải & Tạo mùa mới</strong> để giữ nguyên 100% dữ liệu (BXH, lịch đấu, tỉ số, nhà vô địch) của các mùa trước.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
              {/* Rename Current Viewing Season */}
              <div className="p-4 rounded-2xl bg-surface/70 border border-border-color space-y-3">
                <p className="text-xs font-extrabold uppercase tracking-wider text-main m-0">
                  ✏️ Thông tin mùa giải đang chọn ({tournament?.season})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-muted block mb-1">Tên mùa giải (Season):</label>
                    <input
                      type="text"
                      value={editSeasonName}
                      onChange={(e) => setEditSeasonName(e.target.value)}
                      className="input-field py-2 px-3 text-xs sm:text-sm font-bold"
                      placeholder="VD: Season 1, Tháng 11/2026..."
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted block mb-1">Tên giải đấu:</label>
                    <input
                      type="text"
                      value={editSeasonTitle}
                      onChange={(e) => setEditSeasonTitle(e.target.value)}
                      className="input-field py-2 px-3 text-xs sm:text-sm font-bold"
                      placeholder="Giải Cầu Lông Sát Thủ"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleUpdateSeasonInfo}
                  className="btn-secondary text-xs py-2 px-4 cursor-pointer font-bold"
                >
                  💾 Cập nhật tên mùa giải này
                </button>
              </div>

              {/* Archive Current & Create New Season */}
              <div className="p-4 rounded-2xl bg-primary/8 border border-primary/30 space-y-3">
                <p className="text-xs font-extrabold uppercase tracking-wider text-primary m-0">
                  📦 Lưu mùa hiện tại & Khởi tạo mùa giải mới
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-muted block mb-1">Tên mùa giải mới:</label>
                    <input
                      type="text"
                      value={newSeasonName}
                      onChange={(e) => setNewSeasonName(e.target.value)}
                      className="input-field py-2 px-3 text-xs sm:text-sm font-bold"
                      placeholder="VD: Season 2"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted block mb-1">Tên giải đấu mới:</label>
                    <input
                      type="text"
                      value={newSeasonTitle}
                      onChange={(e) => setNewSeasonTitle(e.target.value)}
                      className="input-field py-2 px-3 text-xs sm:text-sm font-bold"
                      placeholder="Giải Cầu Lông Sát Thủ"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCreateNewSeason}
                  className="btn-primary text-xs sm:text-sm py-2.5 px-4 cursor-pointer shadow-md w-full sm:w-auto"
                >
                  ✨ Lưu mùa cũ & Tạo mùa giải mới
                </button>
              </div>
            </div>

            {/* Saved Seasons List */}
            {seasons.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted uppercase tracking-wider m-0">
                  Danh sách tất cả các mùa giải đã lưu ({seasons.length}):
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {seasons.map((s) => {
                    const isViewing = s._id === tournament?._id;
                    return (
                      <div
                        key={s._id}
                        className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 ${
                          isViewing
                            ? 'bg-primary/12 border-primary/40'
                            : 'bg-surface/60 border-border-color'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-main">{s.season}</span>
                            {s.isActive && (
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                                Đang diễn ra
                              </span>
                            )}
                            {isViewing && (
                              <span className="text-[10px] font-bold text-primary-light">(Đang chọn)</span>
                            )}
                          </div>
                          <span className="block text-[11px] text-muted">
                            {s.teamCount} đội · {s.completedCount}/{s.matchCount} trận
                            {s.champion ? ` · 🏆 ${s.champion}` : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!isViewing && (
                            <button
                              type="button"
                              onClick={() => handleSelectSeason(s._id)}
                              className="px-2.5 py-1 rounded-lg bg-card border border-border-color text-xs font-bold text-main hover:border-primary cursor-pointer"
                            >
                              Xem / Sửa
                            </button>
                          )}
                          {!s.isActive && (
                            <button
                              type="button"
                              onClick={() => handleSetActiveSeason(s._id)}
                              className="px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-xs font-bold hover:bg-primary/25 cursor-pointer"
                              title="Đặt mùa giải này làm mùa giải mặc định khi mở trang"
                            >
                              Đặt làm mùa chính
                            </button>
                          )}
                          {seasons.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteSeason(s._id, s.season)}
                              className="px-2 py-1 rounded-lg bg-danger/12 text-danger text-xs font-bold hover:bg-danger/25 cursor-pointer"
                              title="Xóa mùa giải này"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 1: Member picker & Random Pair */}
          <div className="glass-card p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-main m-0">
                  1. Chọn thành viên & Chia cặp ngẫu nhiên
                </h3>
                <p className="text-xs sm:text-sm text-muted mt-1 m-0">
                  Tích chọn các vận động viên tham gia, hệ thống sẽ ghép ngẫu nhiên 2 người thành 1 đội.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMemberIds(allMembers.map((m) => m._id))}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer px-2 py-1"
                >
                  Chọn tất cả
                </button>
                <span className="text-muted">·</span>
                <button
                  type="button"
                  onClick={() => setSelectedMemberIds([])}
                  className="text-xs font-semibold text-muted hover:text-danger cursor-pointer px-2 py-1"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-80 overflow-y-auto p-3 bg-surface/60 rounded-2xl border border-border-color mb-4">
              {allMembers.map((m) => {
                const checked = selectedMemberIds.includes(m._id);
                return (
                  <label
                    key={m._id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs sm:text-sm transition-all ${
                      checked
                        ? 'bg-primary/15 border-primary text-main shadow-xs'
                        : 'bg-card border-border-color text-muted hover:border-primary/40 hover:text-main'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          setSelectedMemberIds((prev) => prev.filter((id) => id !== m._id));
                        } else {
                          setSelectedMemberIds((prev) => [...prev, m._id]);
                        }
                      }}
                      className="accent-primary w-4 h-4 shrink-0 cursor-pointer"
                    />
                    <span className="font-semibold truncate flex-1">{m.name}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <span className="text-xs sm:text-sm font-semibold text-muted text-center sm:text-left">
                Đã chọn: <strong className="text-primary font-extrabold">{selectedMemberIds.length}</strong> thành viên{' '}
                ({Math.floor(selectedMemberIds.length / 2)} cặp)
              </span>
              <button
                onClick={handleRandomPairing}
                className="btn-primary py-2.5 px-5 text-sm w-full sm:w-auto cursor-pointer shadow-md"
              >
                🎲 Chia cặp ngẫu nhiên
              </button>
            </div>
          </div>

          {/* Section 2: Edit Team Names & Members */}
          <div className="glass-card p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-main m-0">
                  2. Quản lý & Chỉnh sửa Tên đội và Thành viên
                </h3>
                <p className="text-xs sm:text-sm text-muted mt-1 m-0">
                  Chỉnh sửa tên đội hoặc đổi thành viên trong từng cặp đôi bất kỳ lúc nào.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddManualTeam}
                className="btn-secondary text-xs py-2 px-3.5 cursor-pointer font-bold self-start sm:self-auto"
              >
                + Thêm đội mới
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
              {editingTeams.length === 0 ? (
                <p className="col-span-2 text-xs sm:text-sm text-muted italic text-center py-6 bg-surface/50 rounded-2xl border border-dashed border-border-color">
                  Chưa có đội nào. Vui lòng chọn thành viên ở Mục 1 để chia cặp ngẫu nhiên hoặc bấm "+ Thêm đội mới".
                </p>
              ) : (
                editingTeams.map((team, idx) => {
                  const player1Id =
                    team.players?.[0] && typeof team.players[0] === 'object'
                      ? team.players[0]._id
                      : team.players?.[0] || '';
                  const player2Id =
                    team.players?.[1] && typeof team.players[1] === 'object'
                      ? team.players[1]._id
                      : team.players?.[1] || '';

                  return (
                    <div
                      key={team._id || idx}
                      className="flex flex-col gap-3 p-4 bg-surface/70 rounded-2xl border border-border-color"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary text-xs bg-primary/12 px-2 py-1.5 rounded-md shrink-0">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={team.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingTeams((prev) => prev.map((t, i) => (i === idx ? { ...t, name: val } : t)));
                          }}
                          className="input-field py-2 px-3 text-xs sm:text-sm font-bold flex-1"
                          placeholder="Tên đội..."
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveTeam(idx)}
                          className="px-2.5 py-2 rounded-xl bg-danger/12 text-danger hover:bg-danger/25 text-xs font-bold cursor-pointer shrink-0"
                          title="Xóa đội này"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-muted block mb-1">Thành viên 1:</label>
                          <select
                            value={player1Id}
                            onChange={(e) => handleChangeTeamPlayer(idx, 0, e.target.value)}
                            className="input-field py-2 px-2.5 text-xs sm:text-sm"
                          >
                            <option value="">-- Chọn VĐV 1 --</option>
                            {allMembers.map((m) => (
                              <option key={m._id} value={m._id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-muted block mb-1">Thành viên 2:</label>
                          <select
                            value={player2Id}
                            onChange={(e) => handleChangeTeamPlayer(idx, 1, e.target.value)}
                            className="input-field py-2 px-2.5 text-xs sm:text-sm"
                          >
                            <option value="">-- Chọn VĐV 2 --</option>
                            {allMembers.map((m) => (
                              <option key={m._id} value={m._id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 pt-1 border-t border-border-light/60">
                        <TeamAvatars players={team.players?.filter(Boolean)} size="sm" />
                        <PlayerNamesList
                          players={team.players?.filter(Boolean)}
                          align="left"
                          textColor="text-primary-light"
                          fallback="Chưa chọn thành viên"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border-light">
              {editingTeams.length > 0 && (
                <button
                  onClick={handleSaveTeams}
                  className="btn-primary py-2.5 px-5 text-sm cursor-pointer shadow-md w-full sm:w-auto"
                >
                  💾 Lưu tên đội & thành viên
                </button>
              )}

              <button
                onClick={handleResetScores}
                className="btn-secondary text-xs sm:text-sm py-2.5 px-4 cursor-pointer hover:border-warn/50 font-bold w-full sm:w-auto"
                title="Reset tất cả tỉ số các trận đấu về 0-0"
              >
                🔄 Reset Tỉ số về 0-0
              </button>

              <button
                onClick={handleResetAll}
                className="btn-danger py-2.5 px-4 text-xs sm:text-sm cursor-pointer shadow-md sm:ml-auto w-full sm:w-auto"
                title="Xóa toàn bộ danh sách đội và lịch thi đấu để chia cặp lại từ đầu"
              >
                🗑️ Reset Toàn Bộ Giải
              </button>
            </div>
          </div>

          {/* Section 3: Knockout Setup */}
          <div className="glass-card p-5 sm:p-6">
            <h3 className="font-display font-bold text-base sm:text-lg text-main m-0">
              3. Thiết lập Vòng Knockout (Bán kết & Chung kết)
            </h3>
            <p className="text-xs sm:text-sm text-muted mt-1 mb-4">
              Chọn 4 đội xuất sắc nhất sau vòng bảng để xếp cặp thi đấu Bán kết 1 và Bán kết 2.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              {/* BK 1 */}
              <div className="bg-surface/70 p-4 rounded-2xl border border-border-color space-y-3">
                <p className="font-extrabold text-xs uppercase tracking-wider text-primary m-0">⚔️ TRẬN BÁN KẾT 1</p>
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Đội A (Ví dụ: Hạng 1):</label>
                  <select
                    value={knockoutPick.semi1TeamA}
                    onChange={(e) => setKnockoutPick((prev) => ({ ...prev, semi1TeamA: e.target.value }))}
                    className="input-field py-2.5 text-xs sm:text-sm"
                  >
                    <option value="">-- Chọn Đội A --</option>
                    {tournament?.teams?.map((t) => {
                      const pNames = t.players?.map((p) => p.name).filter(Boolean).join(' & ');
                      return (
                        <option key={t._id} value={t._id}>
                          {pNames ? `${t.name} (${pNames})` : t.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Đội B (Ví dụ: Hạng 4):</label>
                  <select
                    value={knockoutPick.semi1TeamB}
                    onChange={(e) => setKnockoutPick((prev) => ({ ...prev, semi1TeamB: e.target.value }))}
                    className="input-field py-2.5 text-xs sm:text-sm"
                  >
                    <option value="">-- Chọn Đội B --</option>
                    {tournament?.teams?.map((t) => {
                      const pNames = t.players?.map((p) => p.name).filter(Boolean).join(' & ');
                      return (
                        <option key={t._id} value={t._id}>
                          {pNames ? `${t.name} (${pNames})` : t.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* BK 2 */}
              <div className="bg-surface/70 p-4 rounded-2xl border border-border-color space-y-3">
                <p className="font-extrabold text-xs uppercase tracking-wider text-accent m-0">⚔️ TRẬN BÁN KẾT 2</p>
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Đội A (Ví dụ: Hạng 2):</label>
                  <select
                    value={knockoutPick.semi2TeamA}
                    onChange={(e) => setKnockoutPick((prev) => ({ ...prev, semi2TeamA: e.target.value }))}
                    className="input-field py-2.5 text-xs sm:text-sm"
                  >
                    <option value="">-- Chọn Đội A --</option>
                    {tournament?.teams?.map((t) => {
                      const pNames = t.players?.map((p) => p.name).filter(Boolean).join(' & ');
                      return (
                        <option key={t._id} value={t._id}>
                          {pNames ? `${t.name} (${pNames})` : t.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Đội B (Ví dụ: Hạng 3):</label>
                  <select
                    value={knockoutPick.semi2TeamB}
                    onChange={(e) => setKnockoutPick((prev) => ({ ...prev, semi2TeamB: e.target.value }))}
                    className="input-field py-2.5 text-xs sm:text-sm"
                  >
                    <option value="">-- Chọn Đội B --</option>
                    {tournament?.teams?.map((t) => {
                      const pNames = t.players?.map((p) => p.name).filter(Boolean).join(' & ');
                      return (
                        <option key={t._id} value={t._id}>
                          {pNames ? `${t.name} (${pNames})` : t.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleSetupKnockout}
              className="btn-primary py-2.5 px-5 text-sm cursor-pointer w-full sm:w-auto"
            >
              🚀 Khởi tạo vòng Bán kết & Chung kết
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          SCORE EDIT MODAL (PORTAL)
          ==================================================================== */}
      {selectedMatch &&
        createPortal(
          <div className="modal-overlay p-4" onClick={() => setSelectedMatch(null)}>
            <div className="modal-content space-y-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center border-b border-border-color pb-3.5">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                    {selectedMatch.stage === 'final'
                      ? 'Trận Chung Kết'
                      : selectedMatch.stage === 'semi_final'
                      ? 'Trận Bán Kết'
                      : 'Vòng Bảng'}
                  </span>
                  <h3 className="font-display font-bold text-lg text-main m-0">Cập nhật tỉ số trận đấu</h3>
                </div>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="w-9 h-9 rounded-xl bg-surface text-muted hover:text-danger flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 bg-surface/60 p-4 rounded-2xl border border-border-color">
                {/* Team A Input */}
                <div className="text-center space-y-1.5 min-w-0">
                  <p className="font-bold text-xs sm:text-sm text-main m-0">
                    {selectedMatch.teamAName || 'Đội A'}
                  </p>
                  <PlayerNamesList
                    players={getTeamDetails(selectedMatch.teamA, selectedMatch.teamAName).players}
                    align="center"
                    fallback="—"
                  />
                  <input
                    type="number"
                    min="0"
                    value={matchScoreA}
                    onChange={(e) => setMatchScoreA(e.target.value)}
                    className="input-field font-mono font-black text-2xl text-center py-3 mt-1"
                  />
                </div>

                <span className="font-display font-black text-muted text-sm pt-7">VS</span>

                {/* Team B Input */}
                <div className="text-center space-y-1.5 min-w-0">
                  <p className="font-bold text-xs sm:text-sm text-main m-0">
                    {selectedMatch.teamBName || 'Đội B'}
                  </p>
                  <PlayerNamesList
                    players={getTeamDetails(selectedMatch.teamB, selectedMatch.teamBName).players}
                    align="center"
                    fallback="—"
                  />
                  <input
                    type="number"
                    min="0"
                    value={matchScoreB}
                    onChange={(e) => setMatchScoreB(e.target.value)}
                    className="input-field font-mono font-black text-2xl text-center py-3 mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  className="btn-secondary text-xs sm:text-sm py-2.5 px-5 flex-1 sm:flex-initial"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveScore}
                  className="btn-primary text-xs sm:text-sm py-2.5 px-6 flex-1 sm:flex-initial"
                >
                  Lưu kết quả
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ====================================================================
          TEAM QUICK EDIT MODAL (ADMIN PORTAL)
          ==================================================================== */}
      {showEditTeamsModal &&
        isAdmin &&
        createPortal(
          <div className="modal-overlay p-3 sm:p-4" onClick={() => setShowEditTeamsModal(false)}>
            <div
              className="modal-content max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-border-color pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                    Quản trị giải đấu ({tournament?.season})
                  </span>
                  <h3 className="font-display font-bold text-base sm:text-lg text-main m-0">
                    Chỉnh sửa Tên đội & Thành viên
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditTeamsModal(false)}
                  className="w-9 h-9 rounded-xl bg-surface text-muted hover:text-danger flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {editingTeams.map((team, idx) => {
                  const player1Id =
                    team.players?.[0] && typeof team.players[0] === 'object'
                      ? team.players[0]._id
                      : team.players?.[0] || '';
                  const player2Id =
                    team.players?.[1] && typeof team.players[1] === 'object'
                      ? team.players[1]._id
                      : team.players?.[1] || '';

                  return (
                    <div
                      key={team._id || idx}
                      className="p-3.5 rounded-2xl bg-surface/70 border border-border-color space-y-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary text-xs bg-primary/12 px-2 py-1 rounded-md shrink-0">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={team.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingTeams((prev) => prev.map((t, i) => (i === idx ? { ...t, name: val } : t)));
                          }}
                          className="input-field py-2 px-3 text-xs sm:text-sm font-bold flex-1"
                          placeholder="Tên đội..."
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveTeam(idx)}
                          className="px-2.5 py-2 rounded-xl bg-danger/12 text-danger hover:bg-danger/25 text-xs font-bold cursor-pointer shrink-0"
                          title="Xóa đội này"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-muted block mb-1">Thành viên 1:</label>
                          <select
                            value={player1Id}
                            onChange={(e) => handleChangeTeamPlayer(idx, 0, e.target.value)}
                            className="input-field py-2 px-2.5 text-xs sm:text-sm"
                          >
                            <option value="">-- Chọn VĐV 1 --</option>
                            {allMembers.map((m) => (
                              <option key={m._id} value={m._id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-muted block mb-1">Thành viên 2:</label>
                          <select
                            value={player2Id}
                            onChange={(e) => handleChangeTeamPlayer(idx, 1, e.target.value)}
                            className="input-field py-2 px-2.5 text-xs sm:text-sm"
                          >
                            <option value="">-- Chọn VĐV 2 --</option>
                            {allMembers.map((m) => (
                              <option key={m._id} value={m._id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={handleAddManualTeam}
                  className="w-full py-2.5 rounded-xl border border-dashed border-primary/40 text-xs font-bold text-primary hover:bg-primary/10 cursor-pointer transition-colors"
                >
                  + Thêm đội mới
                </button>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-border-color">
                <button
                  type="button"
                  onClick={() => setShowEditTeamsModal(false)}
                  className="btn-secondary text-xs sm:text-sm py-2.5 px-5 flex-1 sm:flex-initial cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveTeams}
                  className="btn-primary text-xs sm:text-sm py-2.5 px-6 flex-1 sm:flex-initial cursor-pointer"
                >
                  💾 Lưu thay đổi
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default TournamentPage;
