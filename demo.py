#!/usr/bin/env python3
"""
Valorant Analytics Demo Script
Demonstrates the new team and player page features
"""

import requests
import json
import time

API_URL = "http://127.0.0.1:5000"

def demo_api_endpoints():
    """Demonstrate the new API endpoints"""
    print("🟪 Valorant Analytics API Demo")
    print("=" * 50)
    
    try:
        # Test health endpoint
        print("1. Testing health endpoint...")
        response = requests.get(f"{API_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Backend is healthy")
            print(f"   📊 Available datasets: {len(data.get('datasets', []))}")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
            return
        
        # Get teams
        print("\n2. Getting teams list...")
        response = requests.get(f"{API_URL}/teams/detailed")
        if response.status_code == 200:
            teams = response.json()
            print(f"   ✅ Found {len(teams)} teams")
            if teams:
                top_team = teams[0]
                print(f"   🏆 Top team: {top_team['name']} (Rating: {top_team.get('average_rating', 'N/A')})")
        else:
            print(f"   ❌ Failed to get teams: {response.status_code}")
        
        # Get players
        print("\n3. Getting players list...")
        response = requests.get(f"{API_URL}/players/detailed")
        if response.status_code == 200:
            players = response.json()
            print(f"   ✅ Found {len(players)} players")
            if players:
                top_player = players[0]
                print(f"   👤 Top player: {top_player['name']} (Rating: {top_player.get('average_rating', 'N/A')})")
        else:
            print(f"   ❌ Failed to get players: {response.status_code}")
        
        # Demo team profile
        if teams:
            print(f"\n4. Getting team profile for '{teams[0]['name']}'...")
            team_name = teams[0]['name']
            response = requests.get(f"{API_URL}/team/{team_name}")
            if response.status_code == 200:
                team_data = response.json()
                print(f"   ✅ Team profile loaded")
                print(f"   👥 Players: {len(team_data.get('players', []))}")
                print(f"   🎮 Recent matches: {len(team_data.get('recent_matches', []))}")
                print(f"   📊 Map performance: {len(team_data.get('map_performance', []))}")
            else:
                print(f"   ❌ Failed to get team profile: {response.status_code}")
        
        # Demo player profile
        if players:
            print(f"\n5. Getting player profile for '{players[0]['name']}'...")
            player_name = players[0]['name']
            response = requests.get(f"{API_URL}/player/{player_name}")
            if response.status_code == 200:
                player_data = response.json()
                print(f"   ✅ Player profile loaded")
                print(f"   🏆 Current team: {player_data.get('current_team', 'Unknown')}")
                print(f"   🎯 Career rating: {player_data.get('career_stats', {}).get('rating', 'N/A')}")
                print(f"   🎮 Recent matches: {len(player_data.get('recent_matches', []))}")
            else:
                print(f"   ❌ Failed to get player profile: {response.status_code}")
        
        print("\n🎉 Demo completed successfully!")
        print("\n📝 Next steps:")
        print("   1. Run: streamlit run launcher.py")
        print("   2. Choose 'Teams & Players App'")
        print("   3. Explore the beautiful UI!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        print("   Make sure to run: python backend/app.py")
    except Exception as e:
        print(f"❌ Error during demo: {e}")

def main():
    print("Starting Valorant Analytics Demo...")
    print("Make sure the backend is running on http://127.0.0.1:5000")
    print()
    
    # Wait a moment for user to read
    time.sleep(2)
    
    demo_api_endpoints()

if __name__ == "__main__":
    main()
