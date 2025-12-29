import pandas as pd
import os
import hashlib


# Global data containers
data_store = {}
def filter_by_tournament(df, tournament="Valorant Champions 2025"):
    """Filter dataframe by tournament if column exists"""
    if df is None or df.empty:
        return df
    if 'Tournament' in df.columns:
        return df[df['Tournament'] == tournament].copy()
    return df

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

def generate_match_id_from_row(row: dict):
    """Generate unique match ID from row data"""
    name = row.get("Match Name") or ""
    stage = row.get("Stage") or ""
    tour = row.get("Tournament") or ""
    team_a = row.get("Team A") or ""
    team_b = row.get("Team B") or ""
    base = f"{name}||{stage}||{tour}||{team_a}||{team_b}"
    return hashlib.md5(base.encode("utf-8")).hexdigest()[:8]

def load_data():
    """Load all CSV files into global data store"""
    print("🔄 Loading data...")
    
    try:
        # Load all CSV files
        raw_data = {
            'scores': pd.read_csv(os.path.join(DATA_DIR, "scores.csv")),
            'players_stats': pd.read_csv(os.path.join(DATA_DIR, "players_stats.csv")),
            'team_mapping': pd.read_csv(os.path.join(DATA_DIR, "team_mapping.csv")),
            'maps_played': pd.read_csv(os.path.join(DATA_DIR, "maps_played.csv")),
            'maps_scores': pd.read_csv(os.path.join(DATA_DIR, "maps_scores.csv")),
            'kills_stats': pd.read_csv(os.path.join(DATA_DIR, "kills_stats.csv")),
            'draft_phase': pd.read_csv(os.path.join(DATA_DIR, "draft_phase.csv")),
            'rounds_kills': pd.read_csv(os.path.join(DATA_DIR, "rounds_kills.csv")),
            'kills': pd.read_csv(os.path.join(DATA_DIR, "kills.csv")),
            'win_loss_methods_count': pd.read_csv(os.path.join(DATA_DIR, "win_loss_methods_count.csv")),
            'win_loss_method_round_number': pd.read_csv(os.path.join(DATA_DIR, "win_loss_methods_round_number.csv"))
        }
        tournament_filter = "Valorant Champions 2025" 
        print(f"📊 Filtering for tournament: {tournament_filter}")
        for key, df in raw_data.items():
            data_store[key] = filter_by_tournament(df, tournament_filter)

        # Generate match IDs
        data_store['scores']["match_id"] = data_store['scores'].apply(
            lambda r: generate_match_id_from_row(r.to_dict()), axis=1
        )
        
        print("✅ Data loaded successfully!")
        print(f"📊 Loaded {len(data_store)} datasets")
        
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        raise e

def get_data(key):
    """Get data from global store"""
    return data_store.get(key)
