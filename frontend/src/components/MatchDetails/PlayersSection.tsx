import React from 'react';
import { MatchData } from './types';

interface PlayersSectionProps {
  details: MatchData;
}

const PlayersSection: React.FC<PlayersSectionProps> = ({ details }) => {
  const { match, player_kills, enemy_kills } = details;

  return (
    <section className="content-section players-section">
      <div className="teams-container">
        <div className="team-column team-a-column">
          <h2 className="team-header">{match["Team A"]}</h2>
          <div className="players-list">
            {player_kills.map((player, idx) => (
              <div key={idx} className="player-card">
                <div className="player-info">
                  <div className="player-name">{player.Player}</div>
                  <div className="player-team">{player["Player Team"]}</div>
                </div>
                <div className="player-stats-grid">
                  <div className="stat-box kills">
                    <div className="stat-number">{player["Player Kills"]}</div>
                    <div className="stat-label">K</div>
                  </div>
                  <div className="stat-box deaths">
                    <div className="stat-number">{player["Enemy Kills"]}</div>
                    <div className="stat-label">D</div>
                  </div>
                  <div className={`stat-box difference ${player.Difference >= 0 ? 'positive' : 'negative'}`}>
                    <div className="stat-number">{player.Difference >= 0 ? '+' : ''}{player.Difference}</div>
                    <div className="stat-label">±</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="team-column team-b-column">
          <h2 className="team-header">{match["Team B"]}</h2>
          <div className="players-list">
            {enemy_kills.map((player, idx) => (
              <div key={idx} className="player-card">
                <div className="player-info">
                  <div className="player-name">{player.Player}</div>
                  <div className="player-team">{player["Player Team"]}</div>
                </div>
                <div className="player-stats-grid">
                  <div className="stat-box kills">
                    <div className="stat-number">{player["Player Kills"]}</div>
                    <div className="stat-label">K</div>
                  </div>
                  <div className="stat-box deaths">
                    <div className="stat-number">{player["Enemy Kills"]}</div>
                    <div className="stat-label">D</div>
                  </div>
                  <div className={`stat-box difference ${player.Difference >= 0 ? 'positive' : 'negative'}`}>
                    <div className="stat-number">{player.Difference >= 0 ? '+' : ''}{player.Difference}</div>
                    <div className="stat-label">±</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlayersSection;

