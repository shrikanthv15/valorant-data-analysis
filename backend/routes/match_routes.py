from flask import Blueprint, jsonify
from services.match_service import MatchService

match_bp = Blueprint('match', __name__)
match_service = MatchService()

@match_bp.route('/matches')
def get_matches():
    """Get all matches"""
    try:
        matches = match_service.get_all_matches()
        return jsonify(matches)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@match_bp.route('/match_details/<match_id>')
def get_match_details(match_id):
    """Get detailed match information"""
    try:
        details = match_service.get_match_details(match_id)
        if not details:
            return jsonify({"error": "Match not found"}), 404
        return jsonify(details)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@match_bp.route('/round_analysis/<match_id>')
def get_round_analysis(match_id):
    """Get round-by-round analysis"""
    try:
        analysis = match_service.get_round_analysis(match_id)
        if not analysis:
            return jsonify({"error": "Round data not found"}), 404
        return jsonify(analysis)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@match_bp.route('/matches_full')
def get_matches_full():
    """Get comprehensive match data"""
    try:
        matches = match_service.get_matches_full()
        return jsonify(matches)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
