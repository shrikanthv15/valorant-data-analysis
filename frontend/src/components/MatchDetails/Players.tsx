import React, { useState, useEffect } from 'react';
import { PlayerProfile } from './types';
import '../../css/Players.css';

interface PlayersProps {
  matchId?: string;
}

const Players: React.FC<PlayersProps> = ({ matchId }) => {
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMap, setSelectedMap] = useState<string>('all');
  const [availableMaps, setAvailableMaps] = useState<string[]>(['all']);
  const [sortBy, setSortBy] = useState<'kd' | 'kills' | 'acs'>('kd');
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
  const [filterTeam, setFilterTeam] = useState<string>('all');

  useEffect(() => {
    fetchPlayers();
  }, [matchId]);

  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = matchId
        ? `http://localhost:5000/api/players/${matchId}`
        : 'http://localhost:5000/api/players';

      const response = await fetch(endpoint);

      if (!response.ok) throw new Error('Failed to fetch players');

      const data = await response.json();

      let playersList: PlayerProfile[] = [];

      if (Array.isArray(data)) {
        playersList = data;
      } else if (data.players) {
        playersList = data.players;
      }

      const allMaps = new Set<string>();
      playersList.forEach(p => {
        p.map_stats.forEach(m => allMaps.add(m.map));
      });
      const mapsList = Array.from(allMaps).sort();

      setPlayers(playersList);
      setAvailableMaps(['all', ...mapsList]);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getPlayerStats = (player: PlayerProfile) => {
    if (selectedMap === 'all') {
      return {
        kills: player.total_kills,
        deaths: player.total_deaths,
        assists: player.total_assists,
        kd: player.kd_ratio,
        acs: player.average_acs,
        agent: player.map_stats.flatMap(m => m.agents_played).slice(0, 3).join(', '),
        maps: player.map_stats.map(m => m.map),
        headshot: player.map_stats.length > 0
          ? Math.round(player.map_stats.reduce((acc, m) => acc + m.average_headshot_pct, 0) / player.map_stats.length)
          : 0,
        adr: player.map_stats.length > 0
          ? Math.round(player.map_stats.reduce((acc, m) => acc + m.average_adr, 0) / player.map_stats.length)
          : 0
      };
    } else {
      const mapStats = player.map_stats.find(m => m.map === selectedMap);
      if (mapStats) {
        return {
          kills: mapStats.total_kills,
          deaths: mapStats.total_deaths,
          assists: mapStats.total_assists,
          kd: mapStats.kd_ratio,
          acs: mapStats.average_acs,
          agent: mapStats.agents_played.join(', '),
          maps: [mapStats.map],
          headshot: mapStats.average_headshot_pct,
          adr: mapStats.average_adr
        };
      } else {
        return null;
      }
    }
  };

  const toggleExpand = (playerId: string) => {
    setExpandedPlayerId(expandedPlayerId === playerId ? null : playerId);
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const statsA = getPlayerStats(a);
    const statsB = getPlayerStats(b);

    if (!statsA && !statsB) return 0;
    if (!statsA) return 1;
    if (!statsB) return -1;

    switch (sortBy) {
      case 'kills':
        return statsB.kills - statsA.kills;
      case 'acs':
        return statsB.acs - statsA.acs;
      case 'kd':
      default:
        return statsB.kd - statsA.kd;
    }
  });

  const teams = [...new Set(players.map(p => p.current_team))];
  const teamA = teams[0] || 'Team A';
  const teamB = teams[1] || 'Team B';

  const teamAPlayers = sortedPlayers.filter(p => p.current_team === teamA);
  const teamBPlayers = sortedPlayers.filter(p => p.current_team === teamB);

  const renderPlayerCard = (player: PlayerProfile) => {
    const stats = getPlayerStats(player);
    if (!stats) return null;

    const isExpanded = expandedPlayerId === player.id;
    const kdClass = stats.kd >= 1.5 ? 'kd-high' : stats.kd >= 1.0 ? 'kd-med' : 'kd-low';

    return (
      <div
        key={player.id}
        className={`player-card ${isExpanded ? 'expanded' : ''}`}
        onClick={() => toggleExpand(player.id)}
      >
        <div className="card-main">
          <div className="player-avatar">
            {/* Placeholder for agent icon or player image */}
            👤
          </div>
          <div className="player-info">
            <h4 className="player-name">{player.name}</h4>
            <span className="player-agent">{stats.agent}</span>
          </div>

          <div className="quick-stats">
            <div className="quick-stat">
              <span className="q-label">K/D</span>
              <span className={`q-value ${kdClass}`}>{stats.kd.toFixed(2)}</span>
            </div>
            <div className="quick-stat">
              <span className="q-label">ACS</span>
              <span className="q-value">{Math.round(stats.acs)}</span>
            </div>
          </div>

          <div className="expand-icon">▼</div>
        </div>

        <div className="card-details">
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Kills</span>
              <span className="detail-value">{Math.round(stats.kills)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Deaths</span>
              <span className="detail-value">{Math.round(stats.deaths)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Assists</span>
              <span className="detail-value">{Math.round(stats.assists)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">HS%</span>
              <span className="detail-value">{stats.headshot}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">ADR</span>
              <span className="detail-value">{stats.adr}</span>
            </div>
            {/* Add more stats as needed */}
          </div>

          {selectedMap === 'all' && stats.maps && stats.maps.length > 0 && (
            <div className="maps-section">
              <span className="maps-label">Maps Played</span>
              <div className="maps-list">
                {stats.maps.map((map, i) => (
                  <span key={i} className="map-badge">{map}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading players...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="players-container">
      <div className="players-header">
        <h2>👥 Player Performance</h2>

        <div className="players-controls">
          <div className="control-group">
            <span className="control-label">Map</span>
            <select
              value={selectedMap}
              onChange={(e) => setSelectedMap(e.target.value)}
              className="control-select"
            >
              {availableMaps.map(map => (
                <option key={map} value={map}>
                  {map === 'all' ? 'All Maps' : map}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <span className="control-label">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="control-select"
            >
              <option value="kd">K/D Ratio</option>
              <option value="kills">Total Kills</option>
              <option value="acs">ACS</option>
            </select>
          </div>
        </div>
      </div>

      <div className="teams-container">
        {/* Team A Column */}
        <div className="team-section team-a">
          <div className="team-header">
            <h3>{teamA}</h3>
          </div>
          <div className="players-list">
            {teamAPlayers.map(renderPlayerCard)}
          </div>
        </div>

        {/* Team B Column */}
        <div className="team-section team-b">
          <div className="team-header">
            <h3>{teamB}</h3>
          </div>
          <div className="players-list">
            {teamBPlayers.map(renderPlayerCard)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Players;
export type { PlayersProps };
