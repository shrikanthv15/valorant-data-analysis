// Type definitions for MatchDetails components

export interface PlayerStat {
  Player: string;
  "Player Team": string;
  "Player Kills": number;
  "Enemy Kills": number;
  Difference: number;
  Enemy: string[];
}

export interface PlayerVsEnemy {
  Player: string;
  Enemy: string;
  "Player Kills": number;
  "Enemy Kills": number;
  Difference: number;
  "Player Team": string;
  "Enemy Team": string;
  Map: string;
  "Kill Type": string;
}

export interface Maps {
  Team: string;
  Action: string;
  Map: string;
  Tournament?: string;
  Stage?: string;
  "Match Type"?: string;
  "Match Name"?: string;
}

export interface OnlyRoundData {
  "Match Name": string;
  "Map": string;
  "Round Number": number;
  "Team": string;
  "Outcome": string;
  "Method": string;
}

export interface MatchData {
  match: any;
  match_id: string;
  match_type: string;
  winner: string;
  player_kills: PlayerStat[];
  only_rounds_data: OnlyRoundData[];
  enemy_kills: PlayerStat[];
  player_vs_enemy: PlayerVsEnemy[];
  draft_phase: Maps[];
}

export interface RoundAnalysisData {
  rounds: any[];
  maps: Record<string, any>;
  statistics?: any;
}

export interface PlayersData {
  name: string;
  team: string;
  kills: number;
  deaths: number;
  assists: number;
  kd: number;
  agent: string;
  acs: number;
  maps: string[];
}

export interface MapStats {
  map: string;
  matches_played: number;
  total_rounds: number;
  total_kills: number;
  total_deaths: number;
  total_assists: number;
  average_rating: number;
  average_acs: number;
  agents_played: string[];
  average_kd: number;
  average_adr: number;
  average_kpr: number;
  average_apr: number;
  average_fkpr: number;
  average_fdpr: number;
  average_headshot_pct: number;
  kd_ratio: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  current_team: string;
  average_rating: number;
  average_acs: number;
  total_rounds: number;
  total_kills: number;
  total_deaths: number;
  total_assists: number;
  kd_ratio: number;
  map_stats: MapStats[];
}
