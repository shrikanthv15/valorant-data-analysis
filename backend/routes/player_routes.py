from flask import Blueprint, jsonify, request
from services.player_service import PlayerService

player_bp = Blueprint('player', __name__)
player_service = PlayerService()

@player_bp.route('/player_timeseries/<player_name>')
def get_player_timeseries(player_name):
    """Get player time series analytics"""
    try:
        timeseries = player_service.get_player_timeseries(player_name)
        if not timeseries:
            return jsonify({"error": f"Player '{player_name}' not found"}), 404
        return jsonify(timeseries)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@player_bp.route('/players_comparison')
def get_players_comparison():
    """Compare multiple players"""
    try:
        players = request.args.getlist('players')
        if not players:
            return jsonify({"error": "No players specified"}), 400
        
        comparison = player_service.compare_players(players)
        return jsonify(comparison)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@player_bp.route('/player_details/<match_id>')
def get_player_details(match_id):
    """Get player details for a specific match"""
    try:
        details = player_service.get_player_details(match_id)
        return jsonify(details)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@player_bp.route('/players/<match_id>')
def get_players(match_id):
    """Get all players with map-segregated statistics"""
    try:
        print("🌐 [ROUTE] /api/players endpoint called")
        players = player_service.get_all_players_with_map_stats(match_id)
        print(f"🌐 [ROUTE] Returning {len(players)} players")
        return jsonify(players)
    except Exception as e:
        print(f"❌ [ROUTE] Error in /api/players: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500