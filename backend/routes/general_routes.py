from flask import Blueprint, jsonify
from config import data_store
from routes.match_routes import match_service

general_bp = Blueprint('general', __name__)

@general_bp.route('/')
def index():
    """Root endpoint returning available data files for testing."""
    try:
        data_summary = {
            "status": "online",
            "message": "Valorant Backend API",
            "loaded_datasets": list(data_store.keys()),
            "dataset_sizes": {k: len(v) if v is not None else 0 for k, v in data_store.items()},
            "endpoints": {
                "root": "/",
                "matches": "/matches",
                "api_matches": "/api/matches"
            }
        }
        return jsonify(data_summary)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@general_bp.route('/matches')
def get_matches_alias():
    """Alias for /api/matches for easier manual testing."""
    try:
        matches = match_service.get_all_matches()
        return jsonify(matches)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@general_bp.route('/health')
def health():
    """Simple health check."""
    return jsonify({"status": "healthy"}), 200
