from config import get_data
import numpy as np
from utils.helpers import construct_match_names
import pandas as pd

class PlayerService:
    def __init__(self):
        pass
    
    def get_all_players_with_map_stats(self, match_id):
        """Get all players with map-segregated statistics"""
        print(match_id)
        scores_df = get_data('scores')
        kills_df = get_data('kills')
        draft_phase_df = get_data('draft_phase')
        
        match_row = scores_df[scores_df["match_id"] == match_id]
        print(match_row['Match Type'])
        players_stats_df = get_data('players_stats')

        maps_played_df = get_data('maps_played')
        unique_players = players_stats_df['Player'].unique()
        players_list = []
        
        for player_name in unique_players:
            player_data = players_stats_df[players_stats_df['Player'] == player_name]
            
            # Get player's team (most recent or most common)
            teams = player_data['Teams'].value_counts()
            current_team = teams.index[0] if not teams.empty else 'Unknown'
            
            # Aggregate overall stats
            total_rounds = player_data['Rounds Played'].sum()
            total_kills = player_data['Kills'].sum()
            total_deaths = player_data['Deaths'].sum()
            total_assists = player_data['Assists'].sum()
            
            # Calculate average rating (weighted by rounds played)
            if total_rounds > 0:
                weighted_rating = (player_data['Rating'] * player_data['Rounds Played']).sum() / total_rounds
                avg_acs = (player_data['Average Combat Score'] * player_data['Rounds Played']).sum() / total_rounds
            else:
                weighted_rating = 0
                avg_acs = 0
            
            # Get map-specific stats
            map_stats = self._get_player_map_stats(player_name, player_data, maps_played_df)
         
            player_info = {
                'id': player_name.lower().replace(' ', '-'),
                'name': player_name,
                'current_team': current_team,
                'average_rating': round(float(weighted_rating), 2),
                'average_acs': round(float(avg_acs), 2),
                'total_rounds': int(total_rounds),
                'total_kills': int(total_kills),
                'total_deaths': int(total_deaths),
                'total_assists': int(total_assists),
                'kd_ratio': round(total_kills / max(total_deaths, 1), 2),
                'map_stats': map_stats
            }
            
            players_list.append(player_info)
        
        # Sort by average rating descending
        players_list.sort(key=lambda x: x['average_rating'], reverse=True)
        
        print(f"✅ [PLAYER_SERVICE] Returning {len(players_list)} players")
        print(f"📊 [PLAYER_SERVICE] Sample player: {players_list[0]['name'] if players_list else 'None'} with {len(players_list[0]['map_stats']) if players_list else 0} maps")
        
        return players_list
    
    def _get_player_map_stats(self, player_name, player_data, maps_played_df):
        """Get map-segregated statistics for a player"""
        map_stats = {}
        processed_rows = 0
        
        # Group player data by Tournament, Stage, Match Type to match with maps_played
        for idx, row in player_data.iterrows():
            processed_rows += 1
            tournament = row['Tournament']
            stage = row['Stage']
            match_type = row['Match Type']
            agents = row['Agents']
            rounds_played = row['Rounds Played']
            rating = row['Rating']
            acs = row['Average Combat Score']
            kills = row['Kills']
            deaths = row['Deaths']
            assists = row['Assists']
            kd_ratio = row['Kills:Deaths']
            adr = row.get('Average Damage Per Round', 0)
            kpr = row.get('Kills Per Round', 0)
            apr = row.get('Assists Per Round', 0)
            fkpr = row.get('First Kills Per Round', 0)
            fdpr = row.get('First Deaths Per Round', 0)
            headshot_pct = row.get('Headshot %', '0%').replace('%', '')
            
            # Find matching maps from maps_played
            matching_maps = maps_played_df[
                (maps_played_df['Tournament'] == tournament) &
                (maps_played_df['Stage'] == stage) &
                (maps_played_df['Match Type'] == match_type)
            ]
            
            if matching_maps.empty and processed_rows <= 3:
                print(f"    ⚠️ [MAP_STATS] No matching maps for {player_name}: {tournament} | {stage} | {match_type}")
            
            # If we have a single agent (not comma-separated), try to match to specific map
            # Otherwise, aggregate across all maps for this match
            if ',' not in str(agents) and not matching_maps.empty:
                # Single agent - likely single map performance
                for map_name in matching_maps['Map'].unique():
                    if map_name not in map_stats:
                        map_stats[map_name] = {
                            'map': map_name,
                            'matches_played': 0,
                            'total_rounds': 0,
                            'total_kills': 0,
                            'total_deaths': 0,
                            'total_assists': 0,
                            'average_rating': 0,
                            'average_acs': 0,
                            'agents_played': [],
                            'ratings': [],
                            'acs_values': [],
                            'kd_ratios': [],
                            'adr_values': [],
                            'kpr_values': [],
                            'apr_values': [],
                            'fkpr_values': [],
                            'fdpr_values': [],
                            'headshot_pcts': []
                        }
                    
                    map_stats[map_name]['matches_played'] += 1
                    map_stats[map_name]['total_rounds'] += rounds_played
                    map_stats[map_name]['total_kills'] += kills
                    map_stats[map_name]['total_deaths'] += deaths
                    map_stats[map_name]['total_assists'] += assists
                    map_stats[map_name]['ratings'].append(float(rating) if pd.notna(rating) else 0)
                    map_stats[map_name]['acs_values'].append(float(acs) if pd.notna(acs) else 0)
                    map_stats[map_name]['kd_ratios'].append(float(kd_ratio))
                    map_stats[map_name]['adr_values'].append(float(adr) if pd.notna(adr) else 0)
                    map_stats[map_name]['kpr_values'].append(float(kpr) if pd.notna(kpr) else 0)
                    map_stats[map_name]['apr_values'].append(float(apr) if pd.notna(apr) else 0)
                    map_stats[map_name]['fkpr_values'].append(float(fkpr) if pd.notna(fkpr) else 0)
                    map_stats[map_name]['fdpr_values'].append(float(fdpr) if pd.notna(fdpr) else 0)
                    map_stats[map_name]['headshot_pcts'].append(float(headshot_pct) if pd.notna(headshot_pct) and headshot_pct != '' else 0)
                    
                    if agents not in map_stats[map_name]['agents_played']:
                        map_stats[map_name]['agents_played'].append(str(agents))
            else:
                # Multiple agents or aggregated data - distribute across all maps in match
                for map_name in matching_maps['Map'].unique():
                    if map_name not in map_stats:
                        map_stats[map_name] = {
                            'map': map_name,
                            'matches_played': 0,
                            'total_rounds': 0,
                            'total_kills': 0,
                            'total_deaths': 0,
                            'total_assists': 0,
                            'average_rating': 0,
                            'average_acs': 0,
                            'agents_played': [],
                            'ratings': [],
                            'acs_values': [],
                            'kd_ratios': [],
                            'adr_values': [],
                            'kpr_values': [],
                            'apr_values': [],
                            'fkpr_values': [],
                            'fdpr_values': [],
                            'headshot_pcts': []
                        }
                    
                    # Distribute stats proportionally across maps
                    num_maps = len(matching_maps['Map'].unique())
                    map_stats[map_name]['matches_played'] += 1
                    map_stats[map_name]['total_rounds'] += rounds_played / num_maps if num_maps > 0 else rounds_played
                    map_stats[map_name]['total_kills'] += kills / num_maps if num_maps > 0 else kills
                    map_stats[map_name]['total_deaths'] += deaths / num_maps if num_maps > 0 else deaths
                    map_stats[map_name]['total_assists'] += assists / num_maps if num_maps > 0 else assists
                    map_stats[map_name]['ratings'].append(float(rating) if pd.notna(rating) else 0)
                    map_stats[map_name]['acs_values'].append(float(acs) if pd.notna(acs) else 0)
                    map_stats[map_name]['kd_ratios'].append(float(kd_ratio))
                    map_stats[map_name]['adr_values'].append(float(adr) if pd.notna(adr) else 0)
                    map_stats[map_name]['kpr_values'].append(float(kpr) if pd.notna(kpr) else 0)
                    map_stats[map_name]['apr_values'].append(float(apr) if pd.notna(apr) else 0)
                    map_stats[map_name]['fkpr_values'].append(float(fkpr) if pd.notna(fkpr) else 0)
                    map_stats[map_name]['fdpr_values'].append(float(fdpr) if pd.notna(fdpr) else 0)
                    map_stats[map_name]['headshot_pcts'].append(float(headshot_pct) if pd.notna(headshot_pct) and headshot_pct != '' else 0)
                    
                    # Add unique agents
                    for agent in str(agents).split(','):
                        agent_clean = agent.strip()
                        if agent_clean and agent_clean not in map_stats[map_name]['agents_played']:
                            map_stats[map_name]['agents_played'].append(agent_clean)
        
        # Calculate averages for each map
        for map_name, stats in map_stats.items():
            if stats['matches_played'] > 0:
                stats['average_rating'] = round(sum(stats['ratings']) / len(stats['ratings']), 2) if stats['ratings'] else 0
                stats['average_acs'] = round(sum(stats['acs_values']) / len(stats['acs_values']), 2) if stats['acs_values'] else 0
                stats['average_kd'] = round(sum(stats['kd_ratios']) / len(stats['kd_ratios']), 2) if stats['kd_ratios'] else 0
                stats['average_adr'] = round(sum(stats['adr_values']) / len(stats['adr_values']), 2) if stats['adr_values'] else 0
                stats['average_kpr'] = round(sum(stats['kpr_values']) / len(stats['kpr_values']), 2) if stats['kpr_values'] else 0
                stats['average_apr'] = round(sum(stats['apr_values']) / len(stats['apr_values']), 2) if stats['apr_values'] else 0
                stats['average_fkpr'] = round(sum(stats['fkpr_values']) / len(stats['fkpr_values']), 2) if stats['fkpr_values'] else 0
                stats['average_fdpr'] = round(sum(stats['fdpr_values']) / len(stats['fdpr_values']), 2) if stats['fdpr_values'] else 0
                stats['average_headshot_pct'] = round(sum(stats['headshot_pcts']) / len(stats['headshot_pcts']), 2) if stats['headshot_pcts'] else 0
                stats['kd_ratio'] = round(stats['total_kills'] / max(stats['total_deaths'], 1), 2)
            
            # Remove intermediate lists
            if 'ratings' in stats:
                del stats['ratings']
            if 'acs_values' in stats:
                del stats['acs_values']
            if 'kd_ratios' in stats:
                del stats['kd_ratios']
            if 'adr_values' in stats:
                del stats['adr_values']
            if 'kpr_values' in stats:
                del stats['kpr_values']
            if 'apr_values' in stats:
                del stats['apr_values']
            if 'fkpr_values' in stats:
                del stats['fkpr_values']
            if 'fdpr_values' in stats:
                del stats['fdpr_values']
            if 'headshot_pcts' in stats:
                del stats['headshot_pcts']
        
        result = list(map_stats.values())
        if len(result) > 0 and processed_rows <= 3:
            print(f"    ✅ [MAP_STATS] {player_name}: Processed {processed_rows} rows, found {len(result)} unique maps")
        
        return result
    
    def get_player_timeseries(self, player_name):
        """Get comprehensive player time series data"""
        player_matches = self._get_player_matches(player_name)
        if not player_matches:
            return None
        timeseries_data = self._process_player_timeseries(player_name, player_matches)
        
        return {
            "player": player_name,
            "timeseries": timeseries_data,
            "summary_stats": {
                "total_matches": len(player_matches)
            }
        }
    
    def compare_players(self, player_names):
        """Compare multiple players"""
        comparison_data = {}
        
        for player in player_names:
            player_matches = self._get_player_matches(player)
            if player_matches:
                comparison_data[player] = self._process_player_timeseries(player, player_matches)
        
        return {
            "players": comparison_data,
            "clustering_analysis": self._perform_clustering(player_names)
        }
    
    def get_player_details(self, match_id):
        """Get player details for specific match"""
        # Implementation for player details
        return {"message": "Player details endpoint"}
    
    def _get_player_matches(self, player_name):
        """Get all matches for a player"""
        rounds_kills_df = get_data('rounds_kills')
        scores_df = get_data('scores')
        
        player_rounds = rounds_kills_df[
            (rounds_kills_df['Eliminator'] == player_name) | 
            (rounds_kills_df['Eliminated'] == player_name)
        ]
        
        if player_rounds.empty:
            return []
        
        matches = []
        for match_name in player_rounds['Match Name'].unique():
            match_rounds = player_rounds[player_rounds['Match Name'] == match_name]
            
            match_data = {
                "match_name": match_name,
                "match_type": match_rounds['Match Type'].iloc[0],
                "tournament": match_rounds['Tournament'].iloc[0],
                "stage": match_rounds['Stage'].iloc[0],
                "rounds_data": match_rounds
            }
            matches.append(match_data)
        
        return matches
    
    def _process_player_timeseries(self, player_name, player_matches):
        """Process player timeseries data with map-level details"""
        timeseries = {
            "match_progression": [],
            "map_performance": [],
            "round_by_round": [],
            "performance_metrics": {
                "kills_per_match": [],
                "deaths_per_match": [],
                "kd_ratio": [],
                "consistency_score": 0.0
            }
        }
        
        # Process each match
        for match_idx, match in enumerate(player_matches):
            match_data = match["rounds_data"]
            
            # Overall match stats
            player_kills = len(match_data[match_data['Eliminator'] == player_name])
            player_deaths = len(match_data[match_data['Eliminated'] == player_name])
            kd_ratio = player_kills / max(player_deaths, 1)
            
            # Multi-kills in this match
            multi_kills = len(match_data[
                (match_data['Eliminator'] == player_name) & 
                (match_data['Kill Type'].isin(['2k', '3k', '4k', '5k']))
            ])
            
            match_progression = {
                "match_index": match_idx,
                "match_name": match["match_name"],
                "match_type": match["match_type"],
                "stage": match["stage"],
                "kills": int(player_kills),
                "deaths": int(player_deaths),
                "kd_ratio": round(float(kd_ratio), 2),
                "multi_kills": int(multi_kills),
                "maps": []  # ✅ Will hold map breakdown
            }
            
            # ✅ NEW: Process each map in this match
            for map_name in match_data['Map'].unique():
                map_data = match_data[match_data['Map'] == map_name]
                map_kills = len(map_data[map_data['Eliminator'] == player_name])
                map_deaths = len(map_data[map_data['Eliminated'] == player_name])
                map_kd = map_kills / max(map_deaths, 1)
                
                # Get multi-kills on this map
                map_multi_kills = len(map_data[
                    (map_data['Eliminator'] == player_name) & 
                    (map_data['Kill Type'].isin(['2k', '3k', '4k', '5k']))
                ])
                
                map_performance = {
                    "map": map_name,
                    "match_index": match_idx,
                    "match_name": match["match_name"],
                    "kills": int(map_kills),
                    "deaths": int(map_deaths),
                    "kd_ratio": round(float(map_kd), 2),
                    "multi_kills": int(map_multi_kills),
                    "rounds": []  # ✅ Will hold round-by-round data
                }
                
                # ✅ NEW: Process each round in this map
                for round_num in sorted(map_data['Round Number'].unique()):
                    round_data = map_data[map_data['Round Number'] == round_num]
                    round_kills = len(round_data[round_data['Eliminator'] == player_name])
                    round_deaths = len(round_data[round_data['Eliminated'] == player_name])
                    
                    # Check for multi-kill in this round
                    round_multi_kill = any(round_data[
                        round_data['Eliminator'] == player_name
                    ]['Kill Type'].isin(['2k', '3k', '4k', '5k']))
                    
                    # Clutch situation: player got kills, survived, and got 2+ kills
                    clutch_situation = (round_kills >= 2 and round_deaths == 0)
                    
                    round_performance = {
                        "round_number": int(round_num),
                        "map": map_name,
                        "match_index": match_idx,
                        "match_name": match["match_name"],
                        "kills": int(round_kills),
                        "deaths": int(round_deaths),
                        "survived": round_deaths == 0,
                        "multi_kill": bool(round_multi_kill),
                        "clutch_situation": bool(clutch_situation)
                    }
                    
                    map_performance["rounds"].append(round_performance)
                    timeseries["round_by_round"].append(round_performance)
                
                match_progression["maps"].append(map_performance)
                timeseries["map_performance"].append(map_performance)
            
            timeseries["match_progression"].append(match_progression)
            timeseries["performance_metrics"]["kills_per_match"].append(int(player_kills))
            timeseries["performance_metrics"]["deaths_per_match"].append(int(player_deaths))
            timeseries["performance_metrics"]["kd_ratio"].append(float(kd_ratio))
        
        # Calculate consistency score
        kd_values = timeseries["performance_metrics"]["kd_ratio"]
        if len(kd_values) > 1:
            consistency = 1 / (1 + float(np.var(kd_values)))
            timeseries["performance_metrics"]["consistency_score"] = round(consistency, 3)
        
        return timeseries

    
    def _perform_clustering(self, player_names):
        """Perform clustering on players"""
        # Clustering implementation
        return {"clustering": "Not implemented yet"}

