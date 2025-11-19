def construct_match_names(team_a, team_b):
    """Construct both possible match name variations"""
    match_name_1 = f"{team_a} vs {team_b}"
    match_name_2 = f"{team_b} vs {team_a}"
    return match_name_1, match_name_2

def safe_divide(numerator, denominator, default=0):
    """Safe division with default value"""
    return numerator / denominator if denominator != 0 else default

def calculate_kd_ratio(kills, deaths):
    """Calculate K/D ratio safely"""
    return safe_divide(kills, deaths, kills)
