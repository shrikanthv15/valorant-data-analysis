import React, { useState } from 'react';
import { MatchData } from './types';

interface DuelsSectionProps {
  details: MatchData;
}

const DuelsSection: React.FC<DuelsSectionProps> = ({ details }) => {
  const { match, player_vs_enemy } = details;
  const [showStats, setShowStats] = useState(false);

  if (!player_vs_enemy || !Array.isArray(player_vs_enemy) || player_vs_enemy.length === 0) {
    return (
      <section className="content-section duels-section">
        <h2 className="section-title">Individual Combat Analysis</h2>
        <div className="no-data-message">
          <div className="no-data-icon">⚔️</div>
          <h3>No Combat Data Available</h3>
          <p>Individual player vs player statistics are not available for this match.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="content-section duels-section">
      <h2 className="section-title">Individual Combat Analysis</h2>
      
      <div className="team-duels-container">
        <div className="team-duel-section">
          <h3 className="team-duel-header team-a-header">
            <span className="team-icon">🔵</span>
            {match["Team A"]} Combat Record
          </h3>
          <div className="duels-grid">
            {player_vs_enemy
              .filter(duel => duel["Player Team"] === match["Team A"])
              .slice(0, showStats ? undefined : 8)
              .map((duel, idx) => (
              <div key={`team-a-${idx}`} className="duel-card team-a-duel">
                <div className="duel-header">
                  <div className="player-name">{duel.Player}</div>
                  <div className="vs-indicator">VS</div>
                  <div className="enemy-name">{duel.Enemy}</div>
                </div>
                
                <div className="duel-stats">
                  <div className="stat-item">
                    <div className="stat-value kills">{duel["Player Kills"] || 0}</div>
                    <div className="stat-label">Eliminations</div>
                  </div>
                  <div className="stat-divider">-</div>
                  <div className="stat-item">
                    <div className="stat-value deaths">{duel["Enemy Kills"] || 0}</div>
                    <div className="stat-label">Deaths</div>
                  </div>
                </div>
                
                <div className="duel-result">
                  <div className={`result-badge ${(duel.Difference || 0) >= 0 ? 'win' : 'loss'}`}>
                    {(duel.Difference || 0) >= 0 ? 'W' : 'L'}
                  </div>
                  <div className="difference-value">
                    {(duel.Difference || 0) >= 0 ? '+' : ''}{duel.Difference || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="team-duel-section">
          <h3 className="team-duel-header team-b-header">
            <span className="team-icon">🔴</span>
            {match["Team B"]} Combat Record
          </h3>
          <div className="duels-grid">
            {player_vs_enemy
              .filter(duel => duel["Player Team"] === match["Team B"])
              .slice(0, showStats ? undefined : 8)
              .map((duel, idx) => (
              <div key={`team-b-${idx}`} className="duel-card team-b-duel">
                <div className="duel-header">
                  <div className="player-name">{duel.Player}</div>
                  <div className="vs-indicator">VS</div>
                  <div className="enemy-name">{duel.Enemy}</div>
                </div>
                
                <div className="duel-stats">
                  <div className="stat-item">
                    <div className="stat-value kills">{duel["Player Kills"] || 0}</div>
                    <div className="stat-label">Eliminations</div>
                  </div>
                  <div className="stat-divider">-</div>
                  <div className="stat-item">
                    <div className="stat-value deaths">{duel["Enemy Kills"] || 0}</div>
                    <div className="stat-label">Deaths</div>
                  </div>
                </div>
                
                <div className="duel-result">
                  <div className={`result-badge ${(duel.Difference || 0) >= 0 ? 'win' : 'loss'}`}>
                    {(duel.Difference || 0) >= 0 ? 'W' : 'L'}
                  </div>
                  <div className="difference-value">
                    {(duel.Difference || 0) >= 0 ? '+' : ''}{duel.Difference || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {player_vs_enemy.length > 16 && (
        <div className="show-more-container">
          <button className="show-more-btn" onClick={() => setShowStats(!showStats)}>
            {showStats ? 'Show Less Duels' : `Show All ${player_vs_enemy.length} Individual Duels`}
          </button>
        </div>
      )}

      <div className="combat-summary">
        <h3 className="summary-title">Combat Summary</h3>
        <div className="summary-stats">
          <div className="summary-stat">
            <div className="summary-value">{player_vs_enemy.length}</div>
            <div className="summary-label">Total Duels</div>
          </div>
          <div className="summary-stat">
            <div className="summary-value">
              {player_vs_enemy.filter(d => (d.Difference || 0) > 0).length}
            </div>
            <div className="summary-label">Winning Duels</div>
          </div>
          <div className="summary-stat">
            <div className="summary-value">
              {player_vs_enemy.reduce((sum, d) => sum + (d["Player Kills"] || 0), 0)}
            </div>
            <div className="summary-label">Total Eliminations</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DuelsSection;

