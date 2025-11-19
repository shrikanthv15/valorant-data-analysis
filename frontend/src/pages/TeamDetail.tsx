import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTeamProfile } from '../lib/api'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#ff4655', '#6c5ce7', '#00d2d3', '#ffd166', '#06d6a0', '#118ab2']

export default function TeamDetail() {
  const { teamId } = useParams()
  const q = useQuery({ queryKey: ['team', teamId], queryFn: () => getTeamProfile(teamId!) })
  const t = q.data
  if (!t) return <div className="container">Loading...</div>
  
  const eco = (t.eco_summary || []).map((d: any) => ({ name: d.type, value: d.won }))
  const maps = (t.map_performance || []).map((d: any) => ({ name: d.map, win_rate: d.win_rate }))
  const players = (t.players || []).slice(0, 9)

  return (
    <div className="container">
      <div className="title"><span className="bar" /> <h2>{t.team}</h2></div>
      <div className="kpi" style={{marginBottom:16}}>
        <div className="stat"><div className="label">Players</div><div className="value">{players.length}</div></div>
        <div className="stat"><div className="label">Eco Win Rate</div><div className="value">{(t.eco_win_rate||0).toFixed(1)}%</div></div>
        <div className="stat"><div className="label">Avg Rating</div><div className="value">{(t.team_aggregates?.rating||0).toFixed(2)}</div></div>
        <div className="stat"><div className="label">Avg ACS</div><div className="value">{Math.round(t.team_aggregates?.average_combat_score||0)}</div></div>
      </div>

      <div className="grid cols-2">
        <div className="panel">
          <h3>Eco Round Wins</h3>
          <div style={{width:'100%', height:260}}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={eco} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>
                  {eco.map((_e: any, i: number) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel">
          <h3>Map Win Rate</h3>
          <div style={{width:'100%', height:260}}>
            <ResponsiveContainer>
              <BarChart data={maps}>
                <XAxis dataKey="name" stroke="#9aa4b2" />
                <YAxis stroke="#9aa4b2" />
                <Tooltip />
                <Bar dataKey="win_rate" fill="#ff4655" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="panel" style={{marginTop:16}}>
        <h3>Players</h3>
        <table className="table">
          <thead><tr><th>Player</th><th>Rating</th><th>Team</th></tr></thead>
          <tbody>
            {players.map((p:any) => (
              <tr key={p.player}>
                <td>{p.player}</td>
                <td>{(p.rating||0).toFixed(2)}</td>
                <td>{p.teams}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


