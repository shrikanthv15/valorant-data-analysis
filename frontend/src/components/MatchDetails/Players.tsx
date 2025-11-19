import React, { useState, useEffect } from 'react';

interface Player {
  name: string;
  team: string;
  kills: number;
  deaths: number;
  assists: number;
  kd: number;
  agent: string;
  acs: number;
  maps: string[];
}

interface PlayersProps {
  matchId?: string;
}

// ✅ Main component with default export
const Players: React.FC<PlayersProps> = ({ matchId }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMap, setSelectedMap] = useState<string>('all');
  const [availableMaps, setAvailableMaps] = useState<string[]>(['all']);
  const [sortBy, setSortBy] = useState<'kd' | 'kills' | 'acs'>('kd');
  const [filterTeam, setFilterTeam] = useState<string>('all');

  useEffect(() => {
    fetchPlayers();
  }, [matchId, selectedMap]);

  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = matchId 
        ? `http://localhost:5000/api/players/${matchId}`
        : 'http://localhost:5000/api/players';
      
      const params = selectedMap !== 'all' ? `?map=${selectedMap}` : '';
      const response = await fetch(`${endpoint}${params}`);
      
      if (!response.ok) throw new Error('Failed to fetch players');
      
      const data = await response.json();
      
      setPlayers(data.players || []);
      setAvailableMaps(['all', ...(data.maps || [])]);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const sortedPlayers = [...players].sort((a, b) => {
    switch (sortBy) {
      case 'kills':
        return b.kills - a.kills;
      case 'acs':
        return b.acs - a.acs;
      case 'kd':
      default:
        return b.kd - a.kd;
    }
  });

  const filteredPlayers = filterTeam === 'all' 
    ? sortedPlayers 
    : sortedPlayers.filter(p => p.team === filterTeam);

  const teams = [...new Set(players.map(p => p.team))];

  if (loading) {
    return (
      <div className="players-container">
        <div className="loading">Loading players data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="players-container">
        <div className="error">
          <h3>Error loading players: {error}</h3>
          <p>Check if your Flask backend is running on http://localhost:5000</p>
        </div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="players-container">
        <div className="no-data">
          <h3>No players found.</h3>
          <p>No players found{selectedMap !== 'all' ? ` on ${selectedMap}` : ''}.</p>
          {selectedMap !== 'all' && (
            <button onClick={() => setSelectedMap('all')}>
              Try selecting "All Maps" to see all players.
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="players-container">
      <div className="players-header">
        <h2>🎮 Players Performance</h2>
        
        {/* Map Filter */}
        <div className="filter-group">
          <label>Map:</label>
          <select 
            value={selectedMap} 
            onChange={(e) => setSelectedMap(e.target.value)}
            className="filter-select"
          >
            {availableMaps.map(map => (
              <option key={map} value={map}>
                {map === 'all' ? 'All Maps' : map}
              </option>
            ))}
          </select>
        </div>

        {/* Team Filter */}
        <div className="filter-group">
          <label>Team:</label>
          <select 
            value={filterTeam} 
            onChange={(e) => setFilterTeam(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Teams</option>
            {teams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="filter-group">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'kd' | 'kills' | 'acs')}
            className="filter-select"
          >
            <option value="kd">K/D Ratio</option>
            <option value="kills">Kills</option>
            <option value="acs">ACS</option>
          </select>
        </div>
      </div>

      <div className="players-grid">
        {filteredPlayers.map((player, idx) => (
          <div key={idx} className="player-card">
            <div className="player-header">
              <div className="player-avatar">👤</div>
              <div className="player-info">
                <h3 className="player-name">{player.name}</h3>
                <p className="player-team">{player.team}</p>
                <p className="player-agent">{player.agent}</p>
              </div>
            </div>

            <div className="player-stats">
              <div className="stat-item">
                <span className="stat-label">K/D</span>
                <span className="stat-value kd">{player.kd.toFixed(2)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Kills</span>
                <span className="stat-value kills">{player.kills}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Deaths</span>
                <span className="stat-value deaths">{player.deaths}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Assists</span>
                <span className="stat-value assists">{player.assists}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">ACS</span>
                <span className="stat-value acs">{player.acs}</span>
              </div>
            </div>

            {player.maps && player.maps.length > 0 && (
              <div className="player-maps">
                <span className="maps-label">Maps:</span>
                <div className="maps-list">
                  {player.maps.map((map, i) => (
                    <span key={i} className="map-badge">{map}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ✅ Default export for easy import
export default Players;

// ✅ Also export the interface if needed elsewhere
export type { Player, PlayersProps };
