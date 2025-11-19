from config import get_data

class DataService:
    def get_teams(self):
        """Get all teams"""
        team_mapping_df = get_data('team_mapping')
        return team_mapping_df.to_dict(orient="records")
    
    def get_scores(self):
        """Get scores data"""
        return get_data('scores')
    
    def get_rounds_kills(self):
        """Get rounds kills data"""
        return get_data('rounds_kills')
