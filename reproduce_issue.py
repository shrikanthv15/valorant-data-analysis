import sys
import os
import io

# Set stdout to utf-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Add backend directory to path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
os.chdir(backend_dir)
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from app import create_app
from services.player_service import PlayerService

app = create_app()
player_service = PlayerService()

def test_get_players(match_id):
    print(f"Testing get_players for match_id: {match_id}")
    try:
        with app.app_context():
            players = player_service.get_all_players_with_map_stats(match_id)
            print(f"Found {len(players)} players")
            if len(players) > 0:
                print("Sample player:", players[0]['name'])
                print("Maps:", players[0]['map_stats'])
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Use a known match_id from the data loading logs or a hardcoded one if we know it
    # From previous view_file of scores.csv (not fully shown, but we can guess or find one)
    # Let's try to find a match_id first
    from config import get_data
    with app.app_context():
        scores = get_data('scores')
        if scores is not None and not scores.empty:
            match_id = scores.iloc[0]['match_id']
            test_get_players(match_id)
        else:
            print("No scores data found")
