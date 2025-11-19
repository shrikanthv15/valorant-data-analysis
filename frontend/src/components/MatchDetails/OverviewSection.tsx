import React from 'react';
import { MatchData } from './types';

interface OverviewSectionProps {
  details: MatchData;
  teamAStats: { kills: number; deaths: number; difference: number };
  teamBStats: { kills: number; deaths: number; difference: number };
  topKiller: any;
  bestKD: any;
  leastDeaths: any;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({
  details,
  teamAStats,
  teamBStats,
  topKiller,
  bestKD,
  leastDeaths,
}) => {
  const { match, winner } = details;

  return (
    <section className="content-section overview-section">
      <div className="hero-matchup">
        <div className="team-display team-a">
          <div className="team-name">{match["Team A"]}</div>
          <div className="team-score">{match["Team A Score"] || 0}</div>
          <div className="team-stats">
            <div className="stat-item">
              <span className="stat-value">{teamAStats.kills}</span>
              <span className="stat-label">Kills</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{teamAStats.deaths}</span>
              <span className="stat-label">Deaths</span>
            </div>
          </div>
        </div>

        <div className="vs-section">
          <div className="vs-text">VS</div>
          <div className="winner-badge">
            <div className="trophy-icon">🏆</div>
            <div className="winner-text">{winner}</div>
          </div>
        </div>

        <div className="team-display team-b">
          <div className="team-name">{match["Team B"]}</div>
          <div className="team-score">{match["Team B Score"] || 0}</div>
          <div className="team-stats">
            <div className="stat-item">
              <span className="stat-value">{teamBStats.kills}</span>
              <span className="stat-label">Kills</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{teamBStats.deaths}</span>
              <span className="stat-label">Deaths</span>
            </div>
          </div>
        </div>
      </div>

      <div className="highlights-grid">
        <div className="highlight-card top-killer">
          <div className="highlight-icon">🔥</div>
          <div className="highlight-content">
            <h3>Top Fragger</h3>
            <div className="player-name">{topKiller.Player}</div>
            <div className="player-stat">{topKiller["Player Kills"]} Kills</div>
          </div>
        </div>

        <div className="highlight-card best-kd">
          <div className="highlight-icon">⭐</div>
          <div className="highlight-content">
            <h3>MVP Performance</h3>
            <div className="player-name">{bestKD.Player}</div>
            <div className="player-stat">+{bestKD.Difference} K/D</div>
          </div>
        </div>

        <div className="highlight-card survivor">
          <div className="highlight-icon">🛡️</div>
          <div className="highlight-content">
            <h3>Best Survivor</h3>
            <div className="player-name">{leastDeaths.Player}</div>
            <div className="player-stat">{leastDeaths["Enemy Kills"]} Deaths</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OverviewSection;

