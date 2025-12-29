import { config } from '../config';

const API_BASE = config.API_BASE_URL;

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchJson<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) {
    throw new ApiError(res.status, `Failed to fetch ${endpoint}: ${res.statusText}`);
  }
  return res.json();
}

export const getMatches = () => fetchJson<any[]>('/matches');
export const getMatchDetails = (matchId: string) => fetchJson<any>(`/match_details/${matchId}`);
export const getRoundAnalysis = (matchId: string) => fetchJson<any>(`/round_analysis/${matchId}`);
export const getPlayerTimeseries = (playerName: string) => fetchJson<any>(`/player_timeseries/${playerName}`);
export const getTeams = () => fetchJson<any>('/teams');
export const getTeamProfile = (teamId: string) => fetchJson<any>(`/team/${teamId}`);

export const getPlayers = async (matchId: string) => {
  console.log('🌐 [API] Fetching players from:', `${API_BASE}/players/${matchId}`);
  try {
    return await fetchJson<any[]>(`/players/${matchId}`);
  } catch (error) {
    console.error('❌ [API] Fetch error:', error);
    throw error;
  }
};
