import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPlayerProfile } from '../lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function PlayerDetail() {
  const { playerId } = useParams()
  const q = useQuery({ queryKey: ['player', playerId], queryFn: () => getPlayerProfile(playerId!) })
  const p = q.data
  if (!p) return <div className="container">Loading...</div>

  const agentPerf = (p.agent_performance||[]).map((a:any)=> ({ name: a.agents, rating: a.rating }))
  const mapPerf = (p.map_performance||[]).map((m:any)=> ({ name: m.map, rating: m.rating }))

  return (
    <div className="container">
      <div className="title"><span className="bar" /> <h2>{p.player}</h2></div>
      <div className="kpi" style={{marginBottom:16}}>
        <div className="stat"><div className="label">Team</div><div className="value">{p.current_team||'—'}</div></div>
        <div className="stat"><div className="label">Career Rating</div><div className="value">{(p.career_stats?.rating||0).toFixed(2)}</div></div>
        <div className="stat"><div className="label">Best Rating</div><div className="value">{(p.best_performance?.best_rating||0).toFixed(2)}</div></div>
        <div className="stat"><div className="label">Best ACS</div><div className="value">{Math.round(p.best_performance?.best_average_combat_score||0)}</div></div>
      </div>

      <div className="grid cols-2">
        <div className="panel">
          <h3>Agent Performance</h3>
          <div style={{width:'100%', height:260}}>
            <ResponsiveContainer>
              <BarChart data={agentPerf}>
                <XAxis dataKey="name" stroke="#9aa4b2" />
                <YAxis stroke="#9aa4b2" />
                <Tooltip />
                <Bar dataKey="rating" fill="#6c5ce7" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel">
          <h3>Map Performance</h3>
          <div style={{width:'100%', height:260}}>
            <ResponsiveContainer>
              <BarChart data={mapPerf}>
                <XAxis dataKey="name" stroke="#9aa4b2" />
                <YAxis stroke="#9aa4b2" />
                <Tooltip />
                <Bar dataKey="rating" fill="#ff4655" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}


