import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

export default function Brackets() {

  // Sample data structure matching the Champions bracket
  const sampleGroups = {
    A: {
      teams: [
        { id: 'paper_rex', name: 'PAPER REX', seed: 'A1', status: 'qualified' },
        { id: 'xi_lai_gaming', name: 'Xi Lai Gaming', seed: 'A1', status: 'active' },
        { id: 'gaintx', name: 'GAINTX', seed: 'A1', status: 'qualified' },
        { id: 'sentinels', name: 'Sentinels', seed: 'A1', status: 'active' },
      ],
      matches: [
        { id: 'a1', name: 'PAPER REX', status: 'upcoming', winner: 'A3 WINNER' },
        { id: 'a2', name: 'GAINTX', status: 'completed', winner: 'A5 WINNER' },
        { id: 'a3', name: 'Xi Lai Gaming', status: 'upcoming', winner: 'A3 WINNER' },
        { id: 'a4', name: 'Sentinels', status: 'completed', winner: 'A5 WINNER' }
      ],
      seeds: [
        { name: 'GROUP A SEED #1', winner: 'A3 WINNER' },
        { name: 'GROUP A SEED #2', winner: 'A5 WINNER' }
      ]
    },
    B: {
      teams: [
        { id: 'optic_gaming', name: 'OPTIC GAMING', seed: 'B1', status: 'qualified' },
        { id: 'boom_esports', name: 'BOOM ESPORTS', seed: 'B1', status: 'qualified' },
        { id: 'zeta_division', name: 'ZETA DIVISION', seed: 'B2', status: 'active' },
        { id: 'loud', name: 'LOUD', seed: 'B2', status: 'active' },
      ],
      matches: [
        { id: 'b3', name: 'B3', status: 'completed', winner: 'B3 WINNER' },
        { id: 'b5', name: 'B5', status: 'upcoming', winner: 'B5 WINNER' }
      ],
      seeds: [
        { name: 'GROUP B SEED #1', winner: 'B3 WINNER' },
        { name: 'GROUP B SEED #2', winner: 'B5 WINNER' }
      ]
    },
    C: {
      teams: [
        { id: 'fpx', name: 'FPX', seed: 'C1', status: 'qualified' },
        { id: 'kru', name: 'KRU', seed: 'C1', status: 'qualified' },
        { id: 'xset', name: 'XSET', seed: 'C2', status: 'active' },
        { id: 'xerxia', name: 'XERXIA', seed: 'C2', status: 'active' },
      ],
      matches: [
        { id: 'c3', name: 'C3', status: 'completed', winner: 'C3 WINNER' },
        { id: 'c5', name: 'C5', status: 'upcoming', winner: 'C5 WINNER' }
      ],
      seeds: [
        { name: 'GROUP C SEED #1', winner: 'C3 WINNER' },
        { name: 'GROUP C SEED #2', winner: 'C5 WINNER' }
      ]
    },
    D: {
      teams: [
        { id: 'drx', name: 'DRX', seed: 'D1', status: 'qualified' },
        { id: 'furia_esports', name: 'FURIA ESPORTS', seed: 'D1', status: 'qualified' },
        { id: 'fnatic', name: 'FNATIC', seed: 'D2', status: 'active' },
        { id: '100_thieves', name: '100 THIEVES', seed: 'D2', status: 'active' },
      ],
      matches: [
        { id: 'd3', name: 'D3', status: 'completed', winner: 'D3 WINNER' },
        { id: 'd5', name: 'D5', status: 'upcoming', winner: 'D5 WINNER' }
      ],
      seeds: [
        { name: 'GROUP D SEED #1', winner: 'D3 WINNER' },
        { name: 'GROUP D SEED #2', winner: 'D5 WINNER' }
      ]
    }
  }

 

  const groups = sampleGroups

  return (
    <div className="container">
      <div className="bracket-container">
        {/* Header */}
        <div className="bracket-header">
          <div className="champions-logo">
            <div className="logo-symbol">VCT</div>
            <div className="logo-text">
              <div className="valorant-text">VALORANT</div>
              <div className="champions-text">CHAMPIONS</div>
              <div className="location-text">PARIS</div>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="groups-container">
          {Object.entries(groups).map(([groupLetter, groupData]) => (
            <div key={groupLetter} className="group-section">
              <div className="group-header">
                <div className="group-icon">⊕</div>
                <div className="group-title">GROUP {groupLetter}</div>
                
              </div>
              
              <div className="group-bracket">
                
                {/* Teams Column */}
                <div className="teams-column">
                  {groupData.teams.map((team, index) => (
                    <div key={team.id} className={`team-slot ${team.status}`}>
                      
                      {team.name && (
                        <Link to={`/match}`} className="team-card">
                          <div className="team-name">{team.name} </div>
                          
                        </Link>
                        
                      )}
                      {!team.name && team.status === 'empty' && (
                        <div className="empty-slot">
                          <div className="team-seed">{team.seed}</div>
                        </div>
                      )}
                      
                    </div>
                    
                  ))}
                  
                </div>

                {/* Bracket Lines and Matches */}
                <div className="bracket-matches">
                  {groupData.matches.map((match, index) => (
                    <div key={match.id} className={`match-slot ${match.status}`}>
                      <div className="match-name">{match.name}</div>
                    </div>
                  ))}
                </div>

                {/* Seeds Column */}
                <div className="seeds-column">
                  {groupData.seeds.map((seed, index) => (
                    <div key={index} className="seed-slot">
                      <div className="seed-label">{seed.name}</div>
                      <div className="seed-winner">{seed.winner}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Links */}
        <div className="bracket-footer">
          <a 
            href="https://vlr.gg" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="vlr-link"
          >
            📊 Full Bracket & Schedule on VLR.gg
          </a>
        </div>
      </div>
    </div>
  )
}
