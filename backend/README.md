# Backend API

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

App runs at http://localhost:5000

## API Base

All endpoints are served under `/api` and organized by blueprints:
- `/api/teams`
- `/api/matches`, `/api/match_details/<match_id>`, `/api/round_analysis/<match_id>`, `/api/matches_full`
- `/api/player_timeseries/<player_name>`, `/api/players_comparison`
- `/api/player_clustering`, `/api/match_predictions/<match_id>`

## Docker

```bash
docker build -t valorant-backend .
docker run -p 5000:5000 valorant-backend
```

## Gunicorn/Procfile

```bash
pip install -r requirements.txt
gunicorn wsgi:app -b 0.0.0.0:5000
```

