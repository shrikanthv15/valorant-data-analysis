import React from 'react';
import { MatchData } from './types';

interface DraftPhaseSectionProps {
  details: MatchData;
}

const DraftPhaseSection: React.FC<DraftPhaseSectionProps> = ({ details }) => {
  const { match, draft_phase } = details;

  return (
    <section className="content-section draft-section">
      <h2 className="section-title">Map Veto & Draft Phase</h2>
      
      {draft_phase && Array.isArray(draft_phase) && draft_phase.length > 0 ? (
        <div className="draft-container">
          <div className="draft-header">
            <div className="draft-teams">
              <div className="draft-team team-a">
                <div className="team-logo">🔵</div>
                <div className="team-name">{match["Team A"]}</div>
              </div>
              <div className="draft-vs">VS</div>
              <div className="draft-team team-b">
                <div className="team-logo">🔴</div>
                <div className="team-name">{match["Team B"]}</div>
              </div>
            </div>
            <div className="draft-subtitle">Tactical Map Selection</div>
          </div>

          <div className="draft-timeline">
            {draft_phase.map((phase, index) => (
              <div 
                key={index} 
                className={`draft-phase-item ${phase.Action.toLowerCase()}`}
                style={{ 
                  animationDelay: `${index * 0.8}s`,
                  '--phase-index': index 
                } as React.CSSProperties}
              >
                <div className="phase-number">
                  <span className="phase-counter">{index + 1}</span>
                </div>

                <div className={`team-indicator ${phase.Team === match["Team A"] ? 'team-a' : 'team-b'}`}>
                  <div className="team-badge">
                    <span className="team-icon">
                      {phase.Team === match["Team A"] ? '🔵' : '🔴'}
                    </span>
                    <span className="team-short">{phase.Team}</span>
                  </div>
                </div>

                <div className="phase-content">
                  <div className={`action-badge ${phase.Action.toLowerCase()}`}>
                    <span className="action-icon">
                      {phase.Action.toLowerCase() === 'ban' ? '🚫' : '✅'}
                    </span>
                    <span className="action-text">{phase.Action.toUpperCase()}</span>
                  </div>
                  
                  <div className="map-card">
                    <div className="map-image">
                      <div className="map-placeholder">
                        <span className="map-icon">🗺️</span>
                      </div>
                    </div>
                    <div className="map-info">
                      <div className="map-name">{phase.Map}</div>
                      <div className="map-status">
                        {phase.Action.toLowerCase() === 'ban' ? 'Banned' : 'Selected'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="phase-connector"></div>
              </div>
            ))}
          </div>

          <div className="draft-summary">
            <div className="summary-section">
              <h3 className="summary-title">
                <span className="summary-icon">✅</span>
                Selected Maps
              </h3>
              <div className="selected-maps">
                {draft_phase
                  .filter(phase => phase.Action.toLowerCase() === 'pick')
                  .map((pick, index) => (
                  <div key={index} className="selected-map">
                    <div className={`map-team-indicator ${pick.Team === match["Team A"] ? 'team-a' : 'team-b'}`}>
                      {pick.Team === match["Team A"] ? '🔵' : '🔴'}
                    </div>
                    <div className="map-details">
                      <div className="map-name-large">{pick.Map}</div>
                      <div className="picked-by">Picked by {pick.Team}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="summary-section">
              <h3 className="summary-title">
                <span className="summary-icon">🚫</span>
                Banned Maps
              </h3>
              <div className="banned-maps">
                {draft_phase
                  .filter(phase => phase.Action.toLowerCase() === 'ban')
                  .map((ban, index) => (
                  <div key={index} className="banned-map">
                    <div className="banned-map-name">{ban.Map}</div>
                    <div className="banned-by">Banned by {ban.Team}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-data-message">
          <div className="no-data-icon">🗺️</div>
          <h3>No Draft Data Available</h3>
          <p>Map veto and selection data is not available for this match.</p>
        </div>
      )}
    </section>
  );
};

export default DraftPhaseSection;

