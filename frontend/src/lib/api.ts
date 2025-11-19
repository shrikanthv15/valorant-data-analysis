const API_BASE = "http://127.0.0.1:5000/api";

export const getMatches = async () => {
  const res = await fetch(`${API_BASE}/matches`);
  if (!res.ok) throw new Error("Failed to fetch matches");
  return res.json();
};

export const getMatchDetails = async (matchId: string) => {
  const res = await fetch(`${API_BASE}/match_details/${matchId}`);
  
  if (!res.ok) throw new Error("Failed to fetch match details");
  return res.json();
};

export const getRoundAnalysis = async (matchId: string) => {
  const res = await fetch(`${API_BASE}/round_analysis/${matchId}`);
  if (!res.ok) throw new Error("Failed to fetch round analysis");
  return res.json();
};

export const getPlayerTimeseries = async (playerName: string) => {
  const res = await fetch(`${API_BASE}/player_timeseries/${playerName}`);
  if (!res.ok) throw new Error("Failed to fetch player timeseries");
  return res.json();
};

export const getTeams = async () => {
  const res = await fetch(`${API_BASE}/teams`);
  if (!res.ok) throw new Error("Failed to fetch teams");
  return res.json();
};

export const getTeamProfile = async (teamId: string) => {
  const res = await fetch(`${API_BASE}/team/${teamId}`);
  if (!res.ok) throw new Error("Failed to fetch team profile");
  return res.json();
};

export const getPlayers =  async (matchId: string) => {
  console.log('🌐 [API] Fetching players from:', `${API_BASE}/players/${matchId}`)
  try {
    const res = await fetch(`${API_BASE}/players/${matchId}`);
    console.log('📡 [API] Response status:', res.status, res.statusText)
    if (!res.ok) {
      const errorText = await res.text()
      console.error('❌ [API] Error response:', errorText)
      throw new Error(`Failed to fetch players: ${res.status} ${res.statusText}`)
    }
    const data = await res.json()
    console.log('✅ [API] Received players data:', {
      count: Array.isArray(data) ? data.length : 'not an array',
      sample: Array.isArray(data) && data.length > 0 ? data[0] : null
    })
    return data
  } catch (error) {
    console.error('❌ [API] Fetch error:', error)
    throw error
  }
};