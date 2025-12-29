import React, { useState, useMemo } from 'react';
import { MatchData, PlayerVsEnemy } from './types';
import '../../css/Duels.css';

interface DuelsSectionProps {
  details: MatchData;
}

const DuelsSection: React.FC<DuelsSectionProps> = ({ details }) => {
  const { match, player_vs_enemy } = details;
  const [selectedMap, setSelectedMap] = useState<string>('All Maps');
  const [selectedKillType, setSelectedKillType] = useState<string>('All Kills');

  // Extract available maps and kill types
  const { availableMaps, availableKillTypes } = useMemo(() => {
    if (!player_vs_enemy) return { availableMaps: ['All Maps'], availableKillTypes: ['All Kills'] };

    const maps = new Set<string>(player_vs_enemy.map(d => d.Map).filter(Boolean));
    const killTypes = new Set<string>(player_vs_enemy.map(d => d["Kill Type"]).filter(Boolean));

    return {
      availableMaps: ['All Maps', ...Array.from(maps).sort()],
      availableKillTypes: Array.from(killTypes).sort()
    };
  }, [player_vs_enemy]);

  // Filter duels based on selection
  const filteredDuels = useMemo(() => {
    if (!player_vs_enemy) return [];
    return player_vs_enemy.filter(d =>
      d.Map === selectedMap &&
      d["Kill Type"] === selectedKillType
    );
  }, [player_vs_enemy, selectedMap, selectedKillType]);

  // Organize data for Matrix
  const { teamAPlayers, teamBPlayers, duelMap } = useMemo(() => {
    const teamA = match["Team A"];
    const teamB = match["Team B"];
    const tAPlayers = new Set<string>();
    const tBPlayers = new Set<string>();
    const dMap = new Map<string, PlayerVsEnemy>();

    // We need to scan ALL duels to get the full player list, not just filtered ones
    // otherwise players might disappear if they have no kills in a specific category
    if (player_vs_enemy) {
      player_vs_enemy.forEach(duel => {
        if (duel["Player Team"] === teamA) {
          tAPlayers.add(duel.Player);
          tBPlayers.add(duel.Enemy);
        } else if (duel["Player Team"] === teamB) {
          tAPlayers.add(duel.Enemy);
          tBPlayers.add(duel.Player);
        }
      });
    }

    filteredDuels.forEach(duel => {
      let pA = '', pB = '';
      let stats = duel;

      if (duel["Player Team"] === teamA) {
        pA = duel.Player;
        pB = duel.Enemy;
      } else if (duel["Player Team"] === teamB) {
        pA = duel.Enemy;
        pB = duel.Player;
        // Normalize stats to A vs B perspective
        stats = {
          ...duel,
          Player: pA,
          Enemy: pB,
          "Player Team": teamA,
          "Enemy Team": teamB,
          "Player Kills": duel["Enemy Kills"],
          "Enemy Kills": duel["Player Kills"],
          Difference: -duel.Difference
        };
      }

      if (pA && pB) {
        dMap.set(`${pA}-${pB}`, stats);
      }
    });

    return {
      teamAPlayers: Array.from(tAPlayers).sort(),
      teamBPlayers: Array.from(tBPlayers).sort(),
      duelMap: dMap
    };
  }, [filteredDuels, player_vs_enemy, match]);

  if (!player_vs_enemy || player_vs_enemy.length === 0) {
    return (
      <section className="content-section duels-section">
        <h2 className="section-title">⚔️ Combat Analysis</h2>
        <div className="no-data-message">
          <h3>No Combat Data Available</h3>
        </div>
      </section>
    );
  }

  return (
    <section className="content-section duels-section">
      <div className="duels-container">
        <div className="duels-controls">
          {/* Map Tabs */}
          <div className="map-tabs">
            {availableMaps.map(map => (
              <button
                key={map}
                className={`map-tab ${selectedMap === map ? 'active' : ''}`}
                onClick={() => setSelectedMap(map)}
              >
                {map}
              </button>
            ))}
          </div>

          {/* Kill Type Tabs */}
          <div className="kill-type-tabs">
            {availableKillTypes.map(type => (
              <button
                key={type}
                className={`kill-type-tab ${selectedKillType === type ? 'active' : ''}`}
                onClick={() => setSelectedKillType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="duels-matrix-container">
          <table className="duels-matrix">
            <thead>
              <tr>
                <th className="matrix-corner"></th>
                {teamBPlayers.map(player => (
                  <th key={player} className="matrix-col-header">
                    <div className="player-header-content">
                      <div className="player-icon">⚔️</div>
                      <span className="player-name">{player}</span>
                      <span className="team-sublabel">{match["Team B"]}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teamAPlayers.map(playerA => (
                <tr key={playerA}>
                  <th className="matrix-row-header">
                    <div className="row-header-content">
                      <div style={{ textAlign: 'right' }}>
                        <div className="player-name">{playerA}</div>
                        <div className="team-sublabel">{match["Team A"]}</div>
                      </div>
                      <div className="player-icon">👤</div>
                    </div>
                  </th>
                  {teamBPlayers.map(playerB => {
                    const duel = duelMap.get(`${playerA}-${playerB}`);

                    if (!duel) {
                      return <td key={playerB} className="matrix-cell cell-empty">-</td>;
                    }

                    const kills = duel["Player Kills"];
                    const deaths = duel["Enemy Kills"];
                    const diff = duel.Difference;
                    const diffClass = diff > 0 ? 'cell-positive' : diff < 0 ? 'cell-negative' : 'cell-neutral';

                    return (
                      <td key={playerB} className={`matrix-cell ${diffClass}`}>
                        <div className="cell-content">
                          <span className="stat-value">{kills}</span>
                          <span className="stat-value">{deaths}</span>
                          <span className="diff-value">{diff > 0 ? '+' : ''}{diff}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default DuelsSection;
