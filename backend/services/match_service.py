from config import get_data
from services.data_service import DataService
from utils.helpers import construct_match_names
import numpy as np

class MatchService:
    def __init__(self):
        self.data_service = DataService()
    
    def get_all_matches(self):
        """Get all tournament matches"""
        scores_df = get_data('scores')
        matches = scores_df[scores_df["Tournament"] == "Valorant Champions 2025"]
        return matches.to_dict(orient="records")
    
    def get_match_details(self, match_id):
        """Get comprehensive match details"""
        scores_df = get_data('scores')
        kills_df = get_data('kills')
        draft_phase_df = get_data('draft_phase')
        
        match_row = scores_df[scores_df["match_id"] == match_id]
        if match_row.empty:
            return None
        
        match = match_row.iloc[0].to_dict()
        match_type = match_row['Match Type'].iloc[0]
        match_result = match_row['Match Result'].iloc[0]
        winner = match_result.replace(' won', '')
        
        team_a = match['Team A']
        team_b = match['Team B']
        
        match_name_1, match_name_2 = construct_match_names(team_a, team_b)
        
        # Get player kills data
        player_kills = kills_df[
            (kills_df['Match Type'] == match_type) &  
            (
                (kills_df['Match Name'] == match_name_1) |
                (kills_df['Match Name'] == match_name_2)
            )
        ]
        
        # Get draft phase data
        draft_phase = draft_phase_df[
            (draft_phase_df['Match Type'] == match_type) &  
            (
                (draft_phase_df['Match Name'] == match_name_1) |
                (draft_phase_df['Match Name'] == match_name_2)
            )
        ]
        
        # Process player statistics
        player_stats = self._process_player_stats(player_kills)
        enemy_stats = self._process_enemy_stats(player_kills)
        duels_data = self._process_duels(player_kills)
        
        return {
            "match_id": match_id,
            "match": match,
            "match_type": match_type,
            "winner": winner,
            "player_kills": player_stats,
            "enemy_kills": enemy_stats,
            "player_vs_enemy": duels_data,
            "draft_phase": draft_phase.to_dict('records')
        }
    
    def get_round_analysis(self, match_id):
        """Get detailed round-by-round analysis"""
        scores_df = get_data('scores')
        rounds_kills_df = get_data('rounds_kills')
        maps_scores_df = get_data('maps_scores')
        win_loss_methods_count_df = get_data('win_loss_methods_count')
        win_loss_method_round_number_df = get_data('win_loss_method_round_number')

        match_row = scores_df[scores_df["match_id"] == match_id]
        if match_row.empty:
            return None

        match = match_row.iloc[0].to_dict()
        match_type = match_row['Match Type'].iloc[0]
        team_a = match['Team A']
        team_b = match['Team B']

        match_name_1, match_name_2 = construct_match_names(team_a, team_b)
        only_rounds_data = win_loss_method_round_number_df[
            (win_loss_method_round_number_df['Match Name'] == match_name_1) |
            (win_loss_method_round_number_df['Match Name'] == match_name_2)
        ]
        rounds_data = rounds_kills_df[
            (rounds_kills_df['Match Type'] == match_type) &
            (
                (rounds_kills_df['Match Name'] == match_name_1) |
                (rounds_kills_df['Match Name'] == match_name_2)
            )
        ]

        print(rounds_data['Map'])
        map_scores = maps_scores_df[
            (maps_scores_df["Match Name"] == match_name_1) |
            (maps_scores_df["Match Name"] == match_name_2)
        ]

        win_loss_methods = win_loss_methods_count_df[
            (win_loss_methods_count_df["Match Name"] == match_name_1) |
            (win_loss_methods_count_df["Match Name"] == match_name_2)
        ]

      

        if rounds_data.empty:
            return None

        rounds_analysis = self._process_rounds_analysis(rounds_data,only_rounds_data, team_a, team_b)
        maps_analysis = self._process_maps_analysis(map_scores, win_loss_methods, team_a, team_b)
        match_statistics = self._calculate_match_statistics(rounds_data, maps_analysis, team_a, team_b)

        return {
            "match_id": match_id,
            "match": match,
            "only_rounds_data": only_rounds_data.to_dict('records'),
            "rounds": rounds_analysis,
            "maps": maps_analysis,
            "statistics": match_statistics,
            "total_rounds": len(rounds_analysis)
        }
    
    def get_matches_full(self):
        """Get comprehensive match data with maps and picks/bans"""
        scores_df = get_data('scores')
        maps_played_df = get_data('maps_played')
        draft_phase_df = get_data('draft_phase')
        players_stats_df = get_data('players_stats')

        all_matches = []
        for _, row in scores_df.iterrows():
            match_id = row["match_id"]
            match_name = row.get("Match Name")
            tournament = row.get("Tournament")

            maps = maps_played_df[
                (maps_played_df["Match ID"] == match_name) | (maps_played_df["Match Name"] == match_name)
            ].to_dict(orient="records")

            picks_bans = draft_phase_df[
                (draft_phase_df["Match ID"] == match_name) | (draft_phase_df["match_name"] == match_name)
            ].to_dict(orient="records")

            players = players_stats_df[
                (players_stats_df["Tournament"] == tournament) & (players_stats_df["Match Name"] == match_name)
            ].to_dict(orient="records")

            all_matches.append({
                "match_id": match_id,
                "match": row.to_dict(),
                "maps": maps,
                "picks_bans": picks_bans,
                "players": players
            })

        return all_matches
    
    def _process_player_stats(self, player_kills):
        """Process player statistics"""
        # Filter for All Maps for general stats to avoid duplication if needed, 
        # BUT the original code was aggregating. 
        # If player_kills now has all maps, simple aggregation might double count if 'All Maps' rows exist.
        # We should filter for 'All Maps' here if we want overall stats, OR sum up specific maps.
        # Assuming 'All Maps' rows exist and we want to use them for overall stats:
        
        overall_kills = player_kills[player_kills['Map'] == 'All Maps']
        if overall_kills.empty:
             # Fallback if no 'All Maps' rows (unlikely given previous code)
             overall_kills = player_kills
             
        player_stats = overall_kills.groupby(['Player Team', 'Player', "Enemy Team"]).agg({
            'Player Kills': 'sum',
            'Enemy Kills': 'sum', 
            'Difference': 'sum',
            'Enemy': lambda x: list(x)
        }).reset_index()
        return player_stats.fillna(0).to_dict('records')
    
    def _process_enemy_stats(self, player_kills):
        """Process enemy statistics"""
        overall_kills = player_kills[player_kills['Map'] == 'All Maps']
        if overall_kills.empty:
             overall_kills = player_kills

        enemy_stats = overall_kills.groupby(['Enemy Team', 'Enemy', "Player Team"]).agg({
            'Player Kills': 'sum',
            'Enemy Kills': 'sum', 
            'Difference': 'sum',
            'Player': lambda x: list(x)
        }).reset_index()
        
        enemy_stats = enemy_stats.rename(columns={
            'Enemy': 'Player', 
            "Player Team": "Enemy Team", 
            "Enemy Team": "Player Team", 
            'Player': 'Enemy'
        })
        return enemy_stats.fillna(0).to_dict('records')
    
    def _process_duels(self, player_kills):
        """Process player vs enemy duels"""
        # We want to keep Map information now
        duels = player_kills.groupby(['Player', 'Enemy', 'Map', 'Kill Type']).agg({
            'Player Kills': 'first', # Assuming one row per player-enemy-map combo in the source
            'Enemy Kills': 'first',
            'Difference': 'first',
            'Player Team': 'first',
            'Enemy Team': 'first'
        }).reset_index()
        return duels.fillna(0).to_dict('records')

    def _process_rounds_analysis(self, rounds_data, onlyroundsData, team_a, team_b):
        """Process rounds grouped by map"""
        rounds_analysis = []
        
        # ✅ NEW: Process rounds grouped by map
        for map_name in sorted(rounds_data['Map'].unique()):
            # Filter data for this specific map
            map_rounds_data = rounds_data[rounds_data['Map'] == map_name]
            map_only_rounds = onlyroundsData[onlyroundsData['Map'] == map_name]
            
            # Process each round in this map
            for round_num in sorted(map_rounds_data['Round Number'].unique()):
                round_events = map_rounds_data[map_rounds_data['Round Number'] == round_num]
                rm = map_only_rounds[map_only_rounds['Round Number'] == round_num]
                
                # Get winner info
                if not rm.empty:
                    winner_info = rm[rm['Outcome'] == 'Win'].iloc[0]
                    round_winner = winner_info['Team']
                    win_method = winner_info['Method']
                else:
                    team_a_kills = len(round_events[round_events['Eliminator Team'] == team_a])
                    team_b_kills = len(round_events[round_events['Eliminator Team'] == team_b])
                    round_winner = team_a if team_a_kills > team_b_kills else team_b
                    win_method = "Elimination"
                
                # Process round data
                kill_timeline = self._process_kill_timeline(round_events)
                key_moments = self._extract_key_moments(kill_timeline)
                player_perf = self._calculate_round_player_performance(round_events)
                agent_perf = self._calculate_agent_performance(round_events)
                
                team_a_kills = len(round_events[round_events['Eliminator Team'] == team_a])
                team_b_kills = len(round_events[round_events['Eliminator Team'] == team_b])
                
                rounds_analysis.append({
                    "round_number": int(round_num),
                    "map": map_name,  # ✅ Now properly set for each round
                    "winner": round_winner,
                    "win_method": win_method,
                    "team_a_kills": int(team_a_kills),
                    "team_b_kills": int(team_b_kills),
                    "total_kills": int(len(round_events)),
                    "round_summary": f"{round_winner} wins via {win_method}",
                    "kill_timeline": kill_timeline,
                    "key_moments": key_moments,
                    "player_performance": player_perf,
                    "agent_performance": agent_perf,
                    "duration": "Unknown"
                })
        
        return rounds_analysis


    def _process_kill_timeline(self, round_events):
        """Process kill timeline with map info"""
        kill_timeline = []
        processed_multi = set()
        sequence = 0
        
        # Get map name from first event
        map_name = round_events['Map'].iloc[0] if not round_events.empty else "Unknown"
        
        for _, kill in round_events.iterrows():
            multi_key = (kill['Eliminator'], kill['Kill Type'])
            
            if kill['Kill Type'] in ['2k', '3k', '4k', '5k', '1v1']:
                if multi_key not in processed_multi:
                    processed_multi.add(multi_key)
                    victims = round_events[
                        (round_events['Eliminator'] == kill['Eliminator']) &
                        (round_events['Kill Type'] == kill['Kill Type'])
                    ]['Eliminated'].tolist()
                    
                    kill_timeline.append({
                        "eliminator": kill['Eliminator'],
                        "eliminator_agent": kill['Eliminator Agent'],
                        "eliminator_team": kill['Eliminator Team'],
                        "eliminated": victims,
                        "eliminated_agent": kill['Eliminated Agent'],
                        "eliminated_team": kill['Eliminated Team'],
                        "kill_type": kill['Kill Type'],
                        "sequence": sequence,
                        "is_multi_kill": True,
                        "victim_count": len(victims),
                        "map": map_name  # ✅ Added
                    })
                    sequence += 1
            else:
                kill_timeline.append({
                    "eliminator": kill['Eliminator'],
                    "eliminator_agent": kill['Eliminator Agent'],
                    "eliminator_team": kill['Eliminator Team'],
                    "eliminated": [kill['Eliminated']],
                    "eliminated_agent": kill['Eliminated Agent'],
                    "eliminated_team": kill['Eliminated Team'],
                    "kill_type": kill['Kill Type'],
                    "sequence": sequence,
                    "is_multi_kill": False,
                    "victim_count": 1,
                    "map": map_name  # ✅ Added
                })
                sequence += 1
        
        return kill_timeline

    def _extract_key_moments(self, kill_timeline):
        key_moments = []
        multi_kills = [k for k in kill_timeline if k['is_multi_kill']]
        for mk in multi_kills:
            impact = "high" if mk['kill_type'] in ['3k', '4k', '5k'] else "medium"
            key_moments.append({
                "type": "multi_kill",
                "description": f"{mk['eliminator']} gets a {mk['kill_type']} ({mk['victim_count']} eliminations)!",
                "player": mk['eliminator'],
                "team": mk['eliminator_team'],
                "impact": impact,
                "victims": mk['eliminated']
            })

        if kill_timeline:
            first = kill_timeline[0]
            key_moments.append({
                "type": "first_blood",
                "description": f"{first['eliminator']} draws first blood against {first['eliminated'][0]}",
                "player": first['eliminator'],
                "team": first['eliminator_team'],
                "impact": "medium",
                "victim": first['eliminated'][0]
            })
        return key_moments

    def _calculate_round_player_performance(self, round_events):
        player_stats = {}
        kills_by_player = round_events.groupby('Eliminator').size().to_dict()
        deaths_by_player = round_events.groupby('Eliminated').size().to_dict()
        all_players = set(round_events['Eliminator'].unique()) | set(round_events['Eliminated'].unique())
        for player in all_players:
            info = round_events[(round_events['Eliminator'] == player) | (round_events['Eliminated'] == player)]
            if info.empty:
                continue
            if player in round_events['Eliminator'].values:
                team = info[info['Eliminator'] == player]['Eliminator Team'].iloc[0]
                agent = info[info['Eliminator'] == player]['Eliminator Agent'].iloc[0]
            else:
                team = info[info['Eliminated'] == player]['Eliminated Team'].iloc[0]
                agent = info[info['Eliminated'] == player]['Eliminated Agent'].iloc[0]

            player_stats[player] = {
                "player": player,
                "team": team,
                "agent": agent,
                "kills": int(kills_by_player.get(player, 0)),
                "deaths": int(deaths_by_player.get(player, 0)),
                "survived": deaths_by_player.get(player, 0) == 0
            }
        return list(player_stats.values())

    def _calculate_agent_performance(self, round_events):
        agent_stats = round_events.groupby(['Eliminator Team', 'Eliminator Agent']).agg({
            'Eliminated': 'count'
        }).reset_index()
        agent_stats.columns = ['Team', 'Agent', 'Kills']
        return agent_stats.to_dict('records')

    def _process_maps_analysis(self, map_scores, win_loss_methods, team_a, team_b):
        maps_analysis = {}
        for _, map_row in map_scores.iterrows():
            map_name = map_row['Map']
            methods = win_loss_methods[win_loss_methods['Map'] == map_name]
            maps_analysis[map_name] = {
                "total_rounds": int(map_row['Team A Score'] + map_row['Team B Score']),
                "team_a_rounds": int(map_row['Team A Score']),
                "team_b_rounds": int(map_row['Team B Score']),
                "team_a_attacker_score": int(map_row.get('Team A Attacker Score', 0)),
                "team_a_defender_score": int(map_row.get('Team A Defender Score', 0)),
                "team_b_attacker_score": int(map_row.get('Team B Attacker Score', 0)),
                "team_b_defender_score": int(map_row.get('Team B Defender Score', 0)),
                "duration": map_row.get('Duration', 'Unknown'),
                "winner": team_a if map_row['Team A Score'] > map_row['Team B Score'] else team_b,
                "win_methods": self._process_win_methods(methods)
            }
        return maps_analysis

    def _process_win_methods(self, map_methods):
        methods = {}
        for _, row in map_methods.iterrows():
            team = row['Team']
            methods[team] = {
                "eliminations": int(row.get('Elimination', 0)),
                "detonations": int(row.get('Detonated', 0)),
                "defuses": int(row.get('Defused', 0)),
                "time_expiry": int(row.get('Time Expiry (No Plant)', 0))
            }
        return methods

    def _calculate_match_statistics(self, rounds_data, maps_analysis, team_a, team_b):
        total_kills = len(rounds_data)
        total_rounds = sum([m['total_rounds'] for m in maps_analysis.values()]) or 1

        # Process player statistics with multi-kills breakdown
        player_stats = rounds_data.groupby(['Eliminator', 'Eliminator Team']).agg({
            'Eliminated': 'count',
            'Kill Type': lambda x: list(x)
        }).reset_index()
        player_stats.columns = ['Player', 'Team', 'Total_Kills', 'Kill_Types']

        advanced_player_stats = []
        for _, player in player_stats.iterrows():
            kill_types = player['Kill_Types']
            multi_kills = {
                '2k': kill_types.count('2k'),
                '3k': kill_types.count('3k'),
                '4k': kill_types.count('4k'),
                '5k': kill_types.count('5k')
            }
            advanced_player_stats.append({
                "player": player['Player'],
                "team": player['Team'],
                "total_kills": int(player['Total_Kills']),
                "multi_kills": multi_kills,
                "total_multi_kills": int(sum(multi_kills.values())),
                "avg_kills_per_round": float(round(player['Total_Kills'] / total_rounds, 2)) if total_rounds > 0 else 0.0
            })

        # Calculate top performers
        if advanced_player_stats:
            # Most kills
            most_kills_player = max(advanced_player_stats, key=lambda x: x['total_kills'])
            
            # Most multi-kills
            most_multi_kills_player = max(advanced_player_stats, key=lambda x: x['total_multi_kills'])
            
            # Highest average kills per round
            highest_avg_player = max(advanced_player_stats, key=lambda x: x['avg_kills_per_round'])
            
            top_performers = {
                "most_kills": {
                    "player": most_kills_player['player'],
                    "total_kills": most_kills_player['total_kills']
                },
                "most_multi_kills": {
                    "player": most_multi_kills_player['player'],
                    "total_multi_kills": most_multi_kills_player['total_multi_kills']
                },
                "highest_avg": {
                    "player": highest_avg_player['player'],
                    "avg_kills_per_round": highest_avg_player['avg_kills_per_round']
                }
            }
        else:
            top_performers = {
                "most_kills": {"player": "N/A", "total_kills": 0},
                "most_multi_kills": {"player": "N/A", "total_multi_kills": 0},
                "highest_avg": {"player": "N/A", "avg_kills_per_round": 0.0}
            }

        # Process agent statistics with multi-kills breakdown
        agent_stats = rounds_data.groupby('Eliminator Agent').agg({
            'Eliminated': 'count',
            'Kill Type': lambda x: list(x)
        }).reset_index()
        
        agent_performance = []
        for _, agent in agent_stats.iterrows():
            agent_name = agent['Eliminator Agent']
            total_agent_kills = int(agent['Eliminated'])
            kill_types = agent['Kill Type'] if isinstance(agent['Kill Type'], list) else []
            agent_multi_kills = {
                '2k': kill_types.count('2k') if isinstance(kill_types, list) else 0,
                '3k': kill_types.count('3k') if isinstance(kill_types, list) else 0,
                '4k': kill_types.count('4k') if isinstance(kill_types, list) else 0,
                '5k': kill_types.count('5k') if isinstance(kill_types, list) else 0
            }
            agent_performance.append({
                "agent": agent_name,
                "total_kills": total_agent_kills,
                "usage_rate": float(round((total_agent_kills / total_kills) * 100, 1)) if total_kills > 0 else 0.0,
                "multi_kills": agent_multi_kills
            })

        # Team comparison
        team_comparison = {
            team_a: {
                "total_kills": int(len(rounds_data[rounds_data['Eliminator Team'] == team_a])),
                "maps_won": int(len([m for m in maps_analysis.values() if m['winner'] == team_a])),
                "rounds_won": int(sum([m['team_a_rounds'] for m in maps_analysis.values()]))
            },
            team_b: {
                "total_kills": int(len(rounds_data[rounds_data['Eliminator Team'] == team_b])),
                "maps_won": int(len([m for m in maps_analysis.values() if m['winner'] == team_b])),
                "rounds_won": int(sum([m['team_b_rounds'] for m in maps_analysis.values()]))
            }
        }

        return {
            "overview": {
                "total_kills": int(total_kills),
                "total_rounds": int(total_rounds),
                "total_maps": int(len(maps_analysis)),
                "average_kills_per_round": float(round(total_kills / total_rounds, 2)) if total_rounds > 0 else 0.0
            },
            "top_performers": top_performers,
            "players": advanced_player_stats,
            "agents": agent_performance,
            "teams": team_comparison
        }
