import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getTeamsDetailed } from '../lib/api'

export default function Teams() {
  const { data, isLoading, error } = useQuery({ 
    queryKey: ['teams-detailed'], 
    queryFn: getTeamsDetailed 
  })
  
  // Ensure teams is always an array
  const teams = Array.isArray(data) ? data : []

  if (isLoading) {
    return (
      <div className="container">
        <div className="title"><span className="bar" /> <h2>Teams</h2></div>
        <div className="panel">Loading teams...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="title"><span className="bar" /> <h2>Teams</h2></div>
        <div className="panel">
          <p>Error loading teams: {error.message}</p>
          <p>Check if your Flask backend is running on http://localhost:5000</p>
        </div>
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div className="container">
        <div className="title"><span className="bar" /> <h2>Teams</h2></div>
        <div className="panel">
          <p>No teams found.</p>
          <p>Backend response: {JSON.stringify(data)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="title"><span className="bar" /> <h2>Teams ({teams.length})</h2></div>
      <div className="grid cols-3">
        {teams.map((t, index) => (
          <div className="card" key={t.id || t.name || index}>
            <h3>{t.name || 'Unknown Team'}</h3>
            <div className="muted">Players: {t.player_count || 0}</div>
            <div className="muted">Avg Rating: {t.average_rating?.toFixed(2) ?? 'N/A'}</div>
            <div style={{marginTop:10}}>
              <Link className="btn" to={`/team/${encodeURIComponent(t.id || t.name || 'unknown')}`}>
                View Team
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
