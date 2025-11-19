import React, { useState, useMemo } from 'react';
import { RoundAnalysisData, OnlyRoundData } from './types';

interface RoundsAnalysisSectionProps {
  roundsData: RoundAnalysisData | null;
  match: any;
  onlyRoundsData: OnlyRoundData[];
}

const RoundsAnalysisSection: React.FC<RoundsAnalysisSectionProps> = ({ roundsData, match, onlyRoundsData }) => {
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<number>(1);
  // Get available maps from roundsData
  const availableMaps = useMemo(() => {
    if (!roundsData?.maps) return [];
    return Object.keys(roundsData.maps);
  }, [roundsData]);

  // Set default selected map on mount
  React.useEffect(() => {
    if (availableMaps.length > 0 && !selectedMap) {
      setSelectedMap(availableMaps[0]);
    }
  }, [availableMaps, selectedMap]);

  // Filter rounds by selected map (for round details only)
  const mapRounds = useMemo(() => {
    if (!roundsData?.rounds || !selectedMap) return [];
    return roundsData.rounds.filter(round => round.map === selectedMap);
  }, [roundsData?.rounds, selectedMap]);
  // ✅ NEW: Get timeline rounds from onlyRoundsData filtered by selected map
  const timelineRounds = useMemo(() => {
    if (!onlyRoundsData?.length || !selectedMap) return [];
    
    // Filter by map and only get winning rounds (one per round number)
    const filtered = onlyRoundsData.filter(
      round => round.Map === selectedMap && round.Outcome === 'Win'
    );
    
    // Sort by round number
    return filtered.sort((a, b) => a["Round Number"] - b["Round Number"]);
  }, [onlyRoundsData, selectedMap]);

 
  // Helper to get method icon
  const getMethodIcon = (method: string): string => {
    const icons: Record<string, string> = {
      'Elimination': ' 💀 ',
      'Eliminated': ' 💀 ',
      'Detonated': '💣',
      'Defused': '🛡️',
      'Detonation Denied': '🚫',
      'Failed Defused': '❌',
      'Time Expiry (No Plant)': '⏰',
      'Time Expiry (Failed to Plant)': '⏱️'
    };
    return icons[method] || '❓';
  };

  const getCurrentRoundInfo = (roundNum: number, map: string) => {
    if (!onlyRoundsData?.length) return null;
    
    // Find both team entries for this round
    const roundEntries = onlyRoundsData.filter(
      r => r["Round Number"] === roundNum && r.Map === map
    );
    
    if (roundEntries.length === 0) return null;
    
    // Find winner and loser
    const winner = roundEntries.find(r => r.Outcome === 'Win');
    const loser = roundEntries.find(r => r.Outcome === 'Loss');
    
    return {
      round_number: roundNum,
      map: map,
      winner: winner?.Team || '',
      win_method: winner?.Method || '',
      round_summary: `${winner?.Team || 'Unknown'} wins via ${winner?.Method || 'Unknown'}`,
      loser: loser?.Team || '',
      loser_method: loser?.Method || ''
    };
  };
  // Update selected round when map changes
  React.useEffect(() => {
    if (timelineRounds.length > 0) {
      setSelectedRound(timelineRounds[0]["Round Number"]);
    }
  }, [timelineRounds]);

  if (!roundsData || !roundsData.rounds || roundsData.rounds.length === 0) {
    return (
      <section className="content-section rounds-section">
        <h2 className="section-title">🎬 Round-by-Round Analysis</h2>
        <div className="no-data-message">
          <div className="no-data-icon">🎬</div>
          <h3>No Round Data Available</h3>
          <p>Round-by-round analysis is not available for this match.</p>
        </div>
      </section>
    );
  }

  const currentRound = mapRounds.find(r => r.round_number === selectedRound);

  // ✅ NEW: Get round info from onlyRoundsData (for header/winner)
  const currentRoundInfo = getCurrentRoundInfo(selectedRound, selectedMap || '');
  
  console.log("current Round: ", currentRound);
  console.log("current Round Info from onlyRounds: ", currentRoundInfo);
  console.log("onlyroundsdata: ", onlyRoundsData);
  return (
    <section className="content-section rounds-section">
      <h2 className="section-title">🎬 Round-by-Round Analysis</h2>
      
      <div className="rounds-analysis-container">
        {/* Maps Overview with Selection */}
        <div className="maps-overview">
          <h3 className="maps-title">Maps Performance</h3>
          <div className="maps-grid">
            {availableMaps.map((mapName) => {
              const mapStats = roundsData.maps[mapName];
              const isSelected = selectedMap === mapName;
              
              return (
                <button
                  key={mapName}
                  className={`map-performance-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedMap(mapName)}
                >
                  <div className="map-header">
                    <div className="map-icon">🗺️</div>
                    <div className="map-name">{mapName}</div>
                  </div>
                  <div className="map-stats">
                    <div className="rounds-won">
                      <div className="team-rounds team-a">
                        <span className="team-name">{match["Team A"]}</span>
                        <span className="rounds-count">{mapStats.team_a_rounds}</span>
                      </div>
                      <div className="rounds-separator">-</div>
                      <div className="team-rounds team-b">
                        <span className="team-name">{match["Team B"]}</span>
                        <span className="rounds-count">{mapStats.team_b_rounds}</span>
                      </div>
                    </div>
                    <div className="kills-summary">
                      <span className="kills-stat">
                        {mapStats.team_a_kills + mapStats.team_b_kills} total kills
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ✅ CHANGED: Round Timeline Navigation - Using onlyRoundsData */}
        {selectedMap && timelineRounds.length > 0 && (
          <>
            <div className="round-timeline-nav">
              <h3 className="timeline-title">
                Select Round - {selectedMap}
              </h3>
              <div className="rounds-timeline">
                {timelineRounds.map((roundData) => {
                  const roundNumber = roundData["Round Number"];
                  const winner = roundData.Team;
                  const method = roundData.Method;
                  
                  return (
                    <button
                      key={roundNumber}
                      className={`round-button ${selectedRound === roundNumber ? 'active' : ''} ${winner === match["Team A"] ? 'team-a-win' : 'team-b-win'}`}
                      onClick={() => setSelectedRound(roundNumber)}
                    >
                      <div className="round-num">R{roundNumber}</div>
                      <div className="round-winner-icon">
                        {winner === match["Team A"] ? '🔵' : '🔴'}
                      </div>
                      <div className="round-method">
                        {getMethodIcon(method)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Selected Round Details - Keep using currentRoundInfo from mapRounds */}
            {currentRoundInfo && (
      <div className="round-details-container">
        {/* ✅ CHANGED: This entire section now uses currentRoundInfo */}
        <div className="round-header-section">
          <div className="round-title">
            <h3>Round {currentRoundInfo.round_number}</h3>
            <div className="round-map">{currentRoundInfo.map}</div>
          </div>
          <div className="round-result">
            <div className={`winner-announcement ${currentRoundInfo.winner === match["Team A"] ? 'team-a' : 'team-b'}`}>
              <div className="winner-icon">
                {currentRoundInfo.winner === match["Team A"] ? '🔵' : '🔴'}
              </div>
              <div className="winner-text">
                <div className="winner-name">{currentRoundInfo.winner} WINS</div>
                <div className="win-method-badge">
                  <span className="method-icon">{getMethodIcon(currentRoundInfo.win_method)}</span>
                  <span className="method-text">{currentRoundInfo.win_method}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

    {/* Key Moments */}
    {currentRound.key_moments && currentRound.key_moments.length > 0 && (
                  <div className="key-moments-section">
                    <h4 className="moments-title">🔥 Key Moments</h4>
                    <div className="moments-list">
                      {currentRound.key_moments.map((moment: any, idx: number) => (
                        <div key={idx} className={`moment-card ${moment.impact}-impact`}>
                          <div className="moment-type-icon">
                            {moment.type === 'multi_kill' ? '💥' : '🩸'}
                          </div>
                          <div className="moment-content">
                            <div className="moment-description">{moment.description}</div>
                            <div className="moment-player">
                              <span className="player-name">{moment.player}</span>
                              <span className={`team-badge ${moment.team === match["Team A"] ? 'team-a' : 'team-b'}`}>
                                {moment.team}
                              </span>
                            </div>
                          </div>
                          <div className={`impact-indicator ${moment.impact}`}>
                            {moment.impact === 'high' ? '🔥' : '⚡'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Kill Timeline */}
                <div className="kill-timeline-section">
                  <h4 className="timeline-title">⚔️ Kill Timeline</h4>
                  <div className="kill-events">
                    {currentRound.kill_timeline?.map((kill: any, idx: number) => (
                      <div key={idx} className="kill-event">
                        <div className="kill-sequence">{idx + 1}</div>
                        <div className="kill-details">
                          <div className="eliminator-info">
                            <span className={`player-name ${kill.eliminator_team === match["Team A"] ? 'team-a' : 'team-b'}`}>
                              {kill.eliminator}
                            </span>
                            <span className="agent-badge">{kill.eliminator_agent}</span>
                          </div>
                          <div className="kill-icon">
                            {kill.kill_type === '1k' ? '💀' : `🔥${kill.kill_type}`}
                          </div>
                          <div className="eliminated-info">
                            <span className={`player-name ${kill.eliminated_team === match["Team A"] ? 'team-a' : 'team-b'}`}>
                              {kill.eliminated}
                            </span>
                            <span className="agent-badge">{kill.eliminated_agent}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agent Performance in Round */}
                <div className="round-agent-performance">
                  <h4 className="performance-title">👥 Agent Performance</h4>
                  <div className="agent-stats-grid">
                    {currentRound.agent_performance?.map((agentStat: any, idx: number) => (
                      <div key={idx} className="agent-stat-card">
                        <div className="agent-name">{agentStat['Eliminator Agent']}</div>
                        <div className={`team-indicator ${agentStat['Eliminator Team'] === match["Team A"] ? 'team-a' : 'team-b'}`}>
                          {agentStat['Eliminator Team']}
                        </div>
                        <div className="kills-count">{agentStat.kills} kills</div>
                      </div>
                    ))}
                  </div>
                </div>
            
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default RoundsAnalysisSection;
