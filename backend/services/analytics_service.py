from config import get_data
import numpy as np


class AnalyticsService:
    def perform_player_clustering(self, player_names):
        """Cluster players using simple statistical features derived from rounds data."""
        if not player_names or len(player_names) < 2:
            return {"error": "Provide at least two players for clustering"}

        rounds_kills_df = get_data('rounds_kills')
        if rounds_kills_df is None:
            return {"error": "Rounds data unavailable"}

        try:
            from sklearn.cluster import KMeans
            from sklearn.preprocessing import StandardScaler
        except Exception:
            return {"error": "scikit-learn not installed"}

        player_features = []
        labels = []

        for player_name in player_names:
            match_data = rounds_kills_df[
                (rounds_kills_df['Eliminator'] == player_name) |
                (rounds_kills_df['Eliminated'] == player_name)
            ]
            if match_data.empty:
                continue

            kills = len(match_data[match_data['Eliminator'] == player_name])
            deaths = len(match_data[match_data['Eliminated'] == player_name])
            kd = kills / max(deaths, 1)

            # Per-round series for variance/consistency
            per_round = (
                match_data.groupby('Round Number')
                .apply(lambda df: len(df[df['Eliminator'] == player_name]))
                .tolist()
            )
            variance = float(np.var(per_round)) if len(per_round) > 1 else 0.0

            player_features.append([
                float(kills),
                float(deaths),
                float(kd),
                float(variance)
            ])
            labels.append(player_name)

        if len(player_features) < 2:
            return {"error": "Not enough data for clustering"}

        scaler = StandardScaler()
        X = scaler.fit_transform(player_features)
        n_clusters = min(5, max(2, len(X) // 2))
        model = KMeans(n_clusters=n_clusters, random_state=42)
        clusters = model.fit_predict(X)

        def name_cluster(cluster_id):
            # Simple naming based on centroid ordering by KD
            return f"Cluster {cluster_id}"

        result = {}
        for i, name in enumerate(labels):
            result[name] = {
                "cluster": int(clusters[i]),
                "cluster_name": name_cluster(int(clusters[i]))
            }
        return result

    def predict_match_outcomes(self, match_id):
        """Placeholder prediction endpoint. Wire to a model if available."""
        # If you have a model (e.g., joblib), load and predict here.
        # Returning a stub structure to keep API stable.
        return {
            "match_id": match_id,
            "predictions": {
                "team_a_win_probability": 0.5,
                "team_b_win_probability": 0.5
            },
            "model": "stub"
        }

