import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { getPlayers } from '../lib/api'

interface MapStat {
  map: string
  matches_played: number
  total_rounds: number
  total_kills: number
  total_deaths: number
  total_assists: number
  average_rating: number
  average_acs: number
  average_kd: number
  average_adr: number
  average_kpr: number
  average_apr: number
  average_fkpr: number
  average_fdpr: number
  average_headshot_pct: number
  kd_ratio: number
  agents_played: string[]
}

interface Player {
  id: string
  name: string
  current_team: string
  average_rating: number
  average_acs: number
  total_rounds: number
  total_kills: number
  total_deaths: number
  total_assists: number
  kd_ratio: number
  map_stats: MapStat[]
}

export default function Players() {
  const [selectedMap, setSelectedMap] = useState<string>('all')
  const { data, isLoading, error } = useQuery({ 
    queryKey: ['players-detailed'], 
    queryFn: getPlayers 
  })
  
  // Console logs for debugging
  console.log('🔍 [FRONTEND] Players component rendered')
  console.log('📊 [FRONTEND] Query state:', { isLoading, error: error?.message, hasData: !!data })
  console.log('📦 [FRONTEND] Raw data:', data)
  
  // Ensure players is always an array
  const players: Player[] = Array.isArray(data) ? data : []
  
  console.log('👥 [FRONTEND] Processed players:', players.length)
  if (players.length > 0) {
    console.log('📋 [FRONTEND] First player sample:', {
      name: players[0].name,
      team: players[0].current_team,
      rating: players[0].average_rating,
      mapStatsCount: players[0].map_stats?.length || 0,
      mapStats: players[0].map_stats?.slice(0, 2)
    })
  }
  
  // Get all unique maps from all players
  const allMaps = useMemo(() => {
    const mapSet = new Set<string>()
    players.forEach(player => {
      player.map_stats?.forEach(mapStat => {
        mapSet.add(mapStat.map)
      })
    })
    const maps = Array.from(mapSet).sort()
    console.log('🗺️ [FRONTEND] Available maps:', maps)
    return maps
  }, [players])
  
  // Filter players based on selected map
  const filteredPlayers = useMemo(() => {
    if (selectedMap === 'all') {
      console.log('🔍 [FRONTEND] Showing all players:', players.length)
      return players
    }
    
    const filtered = players.filter(player => 
      player.map_stats?.some(mapStat => mapStat.map === selectedMap)
    )
    console.log(`🔍 [FRONTEND] Filtered by ${selectedMap}:`, filtered.length, 'players')
    return filtered
  }, [players, selectedMap])
  
  if (isLoading) {
    return (
      <div className="container">
        <div className="title"><span className="bar" /> <h2>Players</h2></div>
        <div className="panel">Loading players...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="title"><span className="bar" /> <h2>Players</h2></div>
        <div className="panel">
          <p>Error loading players: {error.message}</p>
          <p>Check if your Flask backend is running on http://localhost:5000</p>
        </div>
      </div>
    )
  }

  if (players.length === 0) {
    return (
      <div className="container">
        <div className="title"><span className="bar" /> <h2>Players</h2></div>
        <div className="panel">
          <p>No players found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="title">
        <span className="bar" /> 
        <h2>Players ({filteredPlayers.length})</h2>
      </div>
      
      <div className="panel" style={{ marginBottom: '20px' }}>
        <label htmlFor="map-filter" style={{ marginRight: '10px', fontWeight: 'bold' }}>
          Filter by Map:
        </label>
        <select 
          id="map-filter"
          value={selectedMap} 
          onChange={(e) => setSelectedMap(e.target.value)}
          style={{ 
            padding: '8px 12px', 
            fontSize: '14px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            minWidth: '200px'
          }}
        >
          <option value="all">All Maps</option>
          {allMaps.map(map => (
            <option key={map} value={map}>{map}</option>
          ))}
        </select>
      </div>
      
      {filteredPlayers.length === 0 ? (
        <div className="panel">
          <p>No players found{selectedMap !== 'all' ? ` on ${selectedMap}` : ''}.</p>
          {selectedMap !== 'all' && (
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              Try selecting "All Maps" to see all players.
            </p>
          )}
        </div>
      ) : (
        <div className="grid cols-3">
          {filteredPlayers.map((p, index) => {
            // Get stats for selected map or overall
            const mapStat = selectedMap !== 'all' 
              ? p.map_stats?.find(ms => ms.map === selectedMap)
              : null
            
            const displayRating = mapStat?.average_rating ?? p.average_rating
            const displayKd = mapStat?.kd_ratio ?? p.kd_ratio
            const displayRounds = mapStat?.total_rounds ?? p.total_rounds
            const displayKills = mapStat?.total_kills ?? p.total_kills
            const displayDeaths = mapStat?.total_deaths ?? p.total_deaths
            const displayAgents = mapStat?.agents_played ?? []
            
            console.log(`🎴 [FRONTEND] Rendering player card ${index + 1}:`, {
              name: p.name,
              hasMapStat: !!mapStat,
              selectedMap,
              mapStatsCount: p.map_stats?.length || 0
            })
            
            return (
              <div className="card" key={p.id || p.name || index} style={{ 
                border: selectedMap !== 'all' && mapStat ? '2px solid #ff4655' : '1px solid #ddd',
                position: 'relative'
              }}>
                <h3 style={{ marginBottom: '10px' }}>{p.name || 'Unknown Player'}</h3>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '8px',
                  marginBottom: '10px'
                }}>
                  <div>
                    <div className="muted" style={{ fontSize: '12px' }}>Team</div>
                    <div style={{ fontWeight: 'bold' }}>{p.current_team || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="muted" style={{ fontSize: '12px' }}>Rating</div>
                    <div style={{ fontWeight: 'bold', color: displayRating >= 1.0 ? '#06d6a0' : displayRating >= 0.8 ? '#ffd166' : '#ef476f' }}>
                      {displayRating?.toFixed(2) ?? 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="muted" style={{ fontSize: '12px' }}>K/D</div>
                    <div style={{ fontWeight: 'bold' }}>{displayKd?.toFixed(2) ?? 'N/A'}</div>
                  </div>
                  <div>
                    <div className="muted" style={{ fontSize: '12px' }}>Rounds</div>
                    <div style={{ fontWeight: 'bold' }}>{Math.round(displayRounds ?? 0)}</div>
                  </div>
                </div>
                
                <div style={{ 
                  padding: '8px', 
                  background: '#f8f9fa', 
                  borderRadius: '4px',
                  marginBottom: '10px',
                  fontSize: '13px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="muted">Kills:</span>
                    <span style={{ fontWeight: 'bold' }}>{displayKills ?? 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="muted">Deaths:</span>
                    <span style={{ fontWeight: 'bold' }}>{displayDeaths ?? 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="muted">Assists:</span>
                    <span style={{ fontWeight: 'bold' }}>{mapStat?.total_assists ?? p.total_assists ?? 0}</span>
                  </div>
                </div>
                
                {selectedMap !== 'all' && mapStat ? (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '12px', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '6px',
                    color: 'white'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
                      🗺️ {selectedMap} Stats
                    </div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '6px',
                      fontSize: '12px'
                    }}>
                      <div>
                        <span style={{ opacity: 0.9 }}>Matches:</span>
                        <span style={{ fontWeight: 'bold', marginLeft: '4px' }}>{mapStat.matches_played}</span>
                      </div>
                      <div>
                        <span style={{ opacity: 0.9 }}>ACS:</span>
                        <span style={{ fontWeight: 'bold', marginLeft: '4px' }}>{mapStat.average_acs?.toFixed(0) ?? 'N/A'}</span>
                      </div>
                      <div>
                        <span style={{ opacity: 0.9 }}>ADR:</span>
                        <span style={{ fontWeight: 'bold', marginLeft: '4px' }}>{mapStat.average_adr?.toFixed(0) ?? 'N/A'}</span>
                      </div>
                      <div>
                        <span style={{ opacity: 0.9 }}>KPR:</span>
                        <span style={{ fontWeight: 'bold', marginLeft: '4px' }}>{mapStat.average_kpr?.toFixed(2) ?? 'N/A'}</span>
                      </div>
                    </div>
                    {displayAgents.length > 0 && (
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                        <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '4px' }}>Agents Played:</div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                          {displayAgents.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                ) : selectedMap === 'all' && p.map_stats && p.map_stats.length > 0 ? (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '10px', 
                    background: '#e8f4f8', 
                    borderRadius: '4px',
                    border: '1px solid #bee5eb'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '13px' }}>
                      📍 Maps Played: {p.map_stats.length}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#495057',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px'
                    }}>
                      {p.map_stats.slice(0, 5).map((ms, idx) => (
                        <span 
                          key={idx}
                          style={{
                            padding: '2px 6px',
                            background: '#fff',
                            borderRadius: '3px',
                            border: '1px solid #dee2e6',
                            cursor: 'pointer'
                          }}
                          onClick={() => setSelectedMap(ms.map)}
                          title={`Click to filter by ${ms.map}`}
                        >
                          {ms.map}
                        </span>
                      ))}
                      {p.map_stats.length > 5 && (
                        <span style={{ padding: '2px 6px', color: '#6c757d' }}>
                          +{p.map_stats.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '8px', 
                    background: '#fff3cd', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#856404'
                  }}>
                    ⚠️ No map statistics available
                  </div>
                )}
                
                <div style={{marginTop: '15px'}}>
                  <Link className="btn" to={`/player/${encodeURIComponent(p.name || 'unknown')}`}>
                    View Player Details
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}