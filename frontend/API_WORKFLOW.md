# Frontend API Workflow & Component Structure

## Overview
This document explains the API workflow and component structure for the Valorant Match Details frontend application.

## API Endpoints

All API calls are centralized in `src/lib/api.ts` to avoid hardcoded URLs and ensure consistency.

### Available Endpoints:

1. **`getMatches()`** - `/api/matches`
   - Fetches list of all matches
   - Used in: `Home.tsx`

2. **`getMatchDetails(matchId)`** - `/api/match_details/<match_id>`
   - Fetches comprehensive match details including:
     - Match information (teams, scores, winner)
     - Player statistics (kills, deaths, K/D)
     - Draft phase data (map bans/picks)
     - Player vs Enemy duels
   - Used in: `MatchDetails.tsx`

3. **`getRoundAnalysis(matchId)`** - `/api/round_analysis/<match_id>`
   - Fetches round-by-round analysis including:
     - All rounds with detailed information
     - Map statistics
     - Round outcomes and key moments
     - Kill timelines
     - Agent performance per round
     - Advanced statistics
   - Used in: `MatchDetails.tsx` → `RoundsAnalysisSection.tsx`, `StatisticsSection.tsx`

4. **`getPlayerTimeseries(playerName)`** - `/api/player_timeseries/<player_name>`
   - Fetches player performance analytics including:
     - Match progression over time
     - Map performance heatmap
     - Round-by-round impact
     - Player clustering/classification
   - Used in: `MatchDetails.tsx` → `PlayerAnalyticsSection.tsx`

5. **`getTeams()`** - `/api/teams`
   - Fetches list of all teams
   - Used in: `Teams.tsx`

## Component Structure

### MatchDetails Page (`src/pages/MatchDetails.tsx`)

The main page component that orchestrates all sections. It:
- Fetches match details and round analysis **once** on mount using `Promise.all()`
- Manages section navigation state
- Calculates derived statistics (top killers, best K/D, etc.)
- Renders the appropriate section component based on active section

**Key Features:**
- ✅ Single API call per endpoint (no duplicate fetches)
- ✅ No console.logs in production code
- ✅ Uses centralized API functions from `api.ts`

### Section Components (`src/components/MatchDetails/`)

Each section is a separate, modular component:

#### 1. **OverviewSection.tsx**
- **API Data Used:** `MatchData` from `getMatchDetails()`
- **Purpose:** Displays match overview with team scores, highlights (top fragger, MVP, best survivor)
- **Props:** `details`, `teamAStats`, `teamBStats`, `topKiller`, `bestKD`, `leastDeaths`

#### 2. **DraftPhaseSection.tsx**
- **API Data Used:** `draft_phase` from `getMatchDetails()`
- **Purpose:** Shows map veto and draft phase timeline
- **Props:** `details`

#### 3. **PlayersSection.tsx**
- **API Data Used:** `player_kills`, `enemy_kills` from `getMatchDetails()`
- **Purpose:** Displays player statistics for both teams side-by-side
- **Props:** `details`

#### 4. **RoundsAnalysisSection.tsx** ⭐
- **API Data Used:** `RoundAnalysisData` from `getRoundAnalysis()`
- **Purpose:** Round-by-round analysis with **map switching**
- **Key Features:**
  - Shows all available maps in the match
  - User can click on a map to switch to that map's rounds
  - Only displays rounds for the selected map
  - Shows detailed round information: key moments, kill timeline, agent performance
- **Props:** `roundsData`, `match`
- **State Management:**
  - `selectedMap` - Currently selected map
  - `selectedRound` - Currently selected round number
  - Automatically filters rounds by selected map

#### 5. **PlayerAnalyticsSection.tsx**
- **API Data Used:** 
  - Player list from `getMatchDetails()`
  - Player analytics from `getPlayerTimeseries()` (fetched on-demand)
- **Purpose:** Player performance analytics with interactive charts
- **Key Features:**
  - Player selection grid
  - Fetches timeseries data only when a player is selected
  - Caches data to avoid re-fetching for the same player
  - Creates Plotly charts: performance progression, map heatmap, round-by-round impact
- **Props:** `allPlayers`, `match`
- **State Management:**
  - `selectedPlayer` - Currently selected player
  - `timeseriesData` - Cached player analytics data
  - `loadingTimeseries` - Loading state

#### 6. **DuelsSection.tsx**
- **API Data Used:** `player_vs_enemy` from `getMatchDetails()`
- **Purpose:** Individual player vs player combat statistics
- **Props:** `details`

#### 7. **StatisticsSection.tsx**
- **API Data Used:** `statistics` from `getRoundAnalysis()`
- **Purpose:** Advanced match statistics including:
  - Overview stats (total kills, rounds, maps)
  - Top performers
  - Player performance breakdown
  - Agent meta analysis
  - Team comparison
- **Props:** `roundsData`, `match`

## Data Flow

```
MatchDetails.tsx (Main Page)
  ├─ useEffect (on mount)
  │   ├─ Promise.all([
  │   │   getMatchDetails(matchId),      → /api/match_details/<id>
  │   │   getRoundAnalysis(matchId)      → /api/round_analysis/<id>
  │   │ ])
  │   └─ Sets: details, roundsData
  │
  ├─ Calculates derived stats (useMemo)
  │   └─ topKiller, bestKD, teamStats, etc.
  │
  └─ Renders section based on activeSection:
      ├─ 'overview' → OverviewSection
      ├─ 'draft' → DraftPhaseSection
      ├─ 'players' → PlayersSection
      ├─ 'rounds' → RoundsAnalysisSection
      │   └─ Filters rounds by selectedMap
      ├─ 'timeseries' → PlayerAnalyticsSection
      │   └─ Fetches getPlayerTimeseries() on player selection
      ├─ 'duels' → DuelsSection
      └─ 'stats' → StatisticsSection
```

## Key Improvements Made

1. **✅ Modular Structure**
   - Each section is now a separate component file
   - Easy to edit individual sections
   - Better code organization and maintainability

2. **✅ No Duplicate API Calls**
   - Match details and round analysis fetched once using `Promise.all()`
   - Player timeseries cached after first fetch
   - All API calls use centralized `api.ts` functions

3. **✅ Map Switching in Rounds Analysis**
   - Rounds section now supports multiple maps
   - User can click on map cards to switch between maps
   - Only rounds for selected map are displayed
   - Round timeline updates based on selected map

4. **✅ Removed Console Logs**
   - All `console.log()` statements removed from production code
   - Only error handling remains (using `console.error` for debugging)

5. **✅ Type Safety**
   - Shared types defined in `types.ts`
   - All components properly typed with TypeScript interfaces

## Editing Guide

### To Edit a Specific Section:

1. **Overview Section:** Edit `src/components/MatchDetails/OverviewSection.tsx`
2. **Draft Phase:** Edit `src/components/MatchDetails/DraftPhaseSection.tsx`
3. **Players:** Edit `src/components/MatchDetails/PlayersSection.tsx`
4. **Rounds Analysis:** Edit `src/components/MatchDetails/RoundsAnalysisSection.tsx`
5. **Player Analytics:** Edit `src/components/MatchDetails/PlayerAnalyticsSection.tsx`
6. **Duels:** Edit `src/components/MatchDetails/DuelsSection.tsx`
7. **Statistics:** Edit `src/components/MatchDetails/StatisticsSection.tsx`

### To Add a New API Endpoint:

1. Add function to `src/lib/api.ts`
2. Use it in the appropriate component
3. Update this documentation

### To Modify Round Analysis Map Switching:

Edit `src/components/MatchDetails/RoundsAnalysisSection.tsx`:
- `selectedMap` state controls which map is active
- `mapRounds` filters rounds by selected map
- Map cards in `maps-overview` section handle map selection

