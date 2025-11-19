from flask import Flask
from flask_cors import CORS
from config import load_data
from routes.team_routes import team_bp
from routes.match_routes import match_bp
from routes.player_routes import player_bp
from routes.analytics_routes import analytics_bp


def create_app() -> Flask:
    """Application factory to create Flask app with blueprints and data loaded."""
    app = Flask(__name__)
    CORS(app)

    # Load data once at startup
    load_data()

    # Register blueprints under /api
    app.register_blueprint(team_bp, url_prefix="/api")
    app.register_blueprint(match_bp, url_prefix="/api")
    app.register_blueprint(player_bp, url_prefix="/api")
    app.register_blueprint(analytics_bp, url_prefix="/api")

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
