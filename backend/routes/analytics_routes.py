from flask import Blueprint, jsonify, request
from services.analytics_service import AnalyticsService

analytics_bp = Blueprint('analytics', __name__)
analytics_service = AnalyticsService()

@analytics_bp.route('/player_clustering')
def get_player_clustering():
    """Get player clustering analysis"""
    try:
        players = request.args.getlist('players')
        clustering = analytics_service.perform_player_clustering(players)
        return jsonify(clustering)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@analytics_bp.route('/match_predictions/<match_id>')
def get_match_predictions(match_id):
    """Get ML predictions for match"""
    try:
        predictions = analytics_service.predict_match_outcomes(match_id)
        return jsonify(predictions)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
