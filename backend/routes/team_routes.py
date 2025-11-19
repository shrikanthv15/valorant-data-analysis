from flask import Blueprint, jsonify
from services.data_service import DataService

team_bp = Blueprint('team', __name__)
data_service = DataService()

@team_bp.route('/teams')
def get_teams():
    """Get all teams"""
    try:
        teams = data_service.get_teams()
        return jsonify(teams)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
