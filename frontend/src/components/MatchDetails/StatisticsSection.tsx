import React from 'react';
import { RoundAnalysisData } from './types';

interface StatisticsSectionProps {
  roundsData: RoundAnalysisData | null;
  match: any;
}

const StatisticsSection: React.FC<StatisticsSectionProps> = ({ roundsData, match }) => {
  if (!roundsData || !roundsData.statistics) {
    return (
      <section className="content-section stats-section">
        <h2 className="section-title">📊 Advanced Match Statistics</h2>
        <div className="no-data-message">
          <div className="no-data-icon">📊</div>
          <h3>No Statistics Available</h3>
          <p>Advanced match statistics are not available for this match.</p>
        </div>
      </section>
    );
  }

  const { statistics } = roundsData;

  return (
    <section className="content-section stats-section">
      <h2 className="section-title">📊 Advanced Match Statistics</h2>

      <div className="advanced-stats-container">
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.overview.total_kills}</div>
              <div className="stat-label">Total Eliminations</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚔️</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.overview.total_rounds}</div>
              <div className="stat-label">Total Rounds</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🗺️</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.overview.total_maps}</div>
              <div className="stat-label">Maps Played</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.overview.average_kills_per_round}</div>
              <div className="stat-label">Avg Kills/Round</div>
            </div>
          </div>
        </div>

        <div className="top-performers-section">
          <h3 className="section-subtitle">🏆 Top Performers</h3>
          <div className="performers-grid">
            <div className="performer-card most-kills">
              <div className="performer-icon">👑</div>
              <div className="performer-content">
                <div className="performer-title">Most Eliminations</div>
                <div className="performer-name">{statistics.top_performers.most_kills.player}</div>
                <div className="performer-stat">{statistics.top_performers.most_kills.total_kills} kills</div>
              </div>
            </div>

            <div className="performer-card multi-kills">
              <div className="performer-icon">💥</div>
              <div className="performer-content">
                <div className="performer-title">Multi-Kill Master</div>
                <div className="performer-name">{statistics.top_performers.most_multi_kills.player}</div>
                <div className="performer-stat">{statistics.top_performers.most_multi_kills.total_multi_kills} multi-kills</div>
              </div>
            </div>

            <div className="performer-card consistency">
              <div className="performer-icon">⭐</div>
              <div className="performer-content">
                <div className="performer-title">Most Consistent</div>
                <div className="performer-name">{statistics.top_performers.highest_avg.player}</div>
                <div className="performer-stat">{statistics.top_performers.highest_avg.avg_kills_per_round} K/R</div>
              </div>
            </div>
          </div>
        </div>

        <div className="detailed-stats">
          <h3 className="section-subtitle">👥 Player Performance Analysis</h3>
          <div className="players-detailed-stats">
            {statistics.players
              .sort((a: any, b: any) => b.total_kills - a.total_kills)
              .map((player: any, idx: number) => (
                <div key={idx} className="player-detailed-card">
                  <div className="player-header">
                    <div className="player-info">
                      <div className="player-name">{player.player}</div>
                      <div className={`player-team ${player.team === match["Team A"] ? 'team-a' : 'team-b'}`}>
                        {player.team}
                      </div>
                    </div>
                    <div className="player-total-kills">{player.total_kills}</div>
                  </div>

                  <div className="player-stats-breakdown">
                    <div className="multi-kills-breakdown">
                      <div className="multi-kill-stat">
                        <span className="mk-label">2K</span>
                        <span className="mk-value">{player.multi_kills['2k']}</span>
                      </div>
                      <div className="multi-kill-stat">
                        <span className="mk-label">3K</span>
                        <span className="mk-value">{player.multi_kills['3k']}</span>
                      </div>
                      <div className="multi-kill-stat">
                        <span className="mk-label">4K</span>
                        <span className="mk-value">{player.multi_kills['4k']}</span>
                      </div>
                      <div className="multi-kill-stat">
                        <span className="mk-label">5K</span>
                        <span className="mk-value">{player.multi_kills['5k']}</span>
                      </div>
                    </div>

                    <div className="performance-bar">
                      <div className="bar-container">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${(player.total_kills / Math.max(...statistics.players.map((p: any) => p.total_kills))) * 100}%`
                          }}
                        ></div>
                        <span className="bar-label">K/R: {player.avg_kills_per_round}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="agent-meta-section">
          <h3 className="section-subtitle">⚗️ Agent Performance Meta</h3>
          <div className="agent-stats-grid">
            {statistics.agents
              .sort((a: any, b: any) => b.total_kills - a.total_kills)
              .slice(0, 8)
              .map((agent: any, idx: number) => (
                <div key={idx} className="agent-meta-card">
                  <div className="agent-header">
                    <div className="agent-name">{agent.agent}</div>
                    <div className="usage-rate">{agent.usage_rate}%</div>
                  </div>

                  <div className="agent-kills-total">{agent.total_kills} eliminations</div>

                  <div className="agent-multi-kills">
                    <div className="agent-mk-grid">
                      {Object.entries(agent.multi_kills).map(([type, count]) => (
                        (count as number) > 0 && (
                          <div key={type} className="agent-mk-item">
                            <span className="mk-type">{type}</span>
                            <span className="mk-count">{count as number}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="team-comparison-section">
          <h3 className="section-subtitle">⚖️ Team Head-to-Head</h3>
          <div className="comparison-container">
            <div className="team-comparison-card team-a-card">
              <div className="team-header">
                <div className="team-icon">🔵</div>
                <div className="team-name">{match["Team A"]}</div>
              </div>
              <div className="team-stats">
                <div className="team-stat">
                  <div className="stat-value">{statistics.teams[match["Team A"]].total_kills}</div>
                  <div className="stat-label">Total Kills</div>
                </div>
                <div className="team-stat">
                  <div className="stat-value">{statistics.teams[match["Team A"]].maps_won}</div>
                  <div className="stat-label">Maps Won</div>
                </div>
                <div className="team-stat">
                  <div className="stat-value">{statistics.teams[match["Team A"]].rounds_won}</div>
                  <div className="stat-label">Rounds Won</div>
                </div>
              </div>
            </div>

            <div className="vs-divider">VS</div>

            <div className="team-comparison-card team-b-card">
              <div className="team-header">
                <div className="team-icon">🔴</div>
                <div className="team-name">{match["Team B"]}</div>
              </div>
              <div className="team-stats">
                <div className="team-stat">
                  <div className="stat-value">{statistics.teams[match["Team B"]].total_kills}</div>
                  <div className="stat-label">Total Kills</div>
                </div>
                <div className="team-stat">
                  <div className="stat-value">{statistics.teams[match["Team B"]].maps_won}</div>
                  <div className="stat-label">Maps Won</div>
                </div>
                <div className="team-stat">
                  <div className="stat-value">{statistics.teams[match["Team B"]].rounds_won}</div>
                  <div className="stat-label">Rounds Won</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;
