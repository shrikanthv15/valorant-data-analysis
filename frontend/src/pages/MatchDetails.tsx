import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import "../css/MatchDetails.css";
import { getMatchDetails, getRoundAnalysis, getPlayers } from "../lib/api";
import { MatchData, OnlyRoundData, RoundAnalysisData, PlayersData } from "../components/MatchDetails/types";
import OverviewSection from "../components/MatchDetails/OverviewSection";
import DraftPhaseSection from "../components/MatchDetails/DraftPhaseSection";
import Players from "../components/MatchDetails/Players";
import RoundsAnalysisSection from "../components/MatchDetails/RoundsAnalysisSection";
import PlayerAnalyticsSection from "../components/MatchDetails/PlayerAnalyticsSection";
import DuelsSection from "../components/MatchDetails/DuelsSection";
import StatisticsSection from "../components/MatchDetails/StatisticsSection";

const MatchDetails: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [details, setDetails] = useState<MatchData | null>(null);
  const [roundsData, setRoundsData] = useState<RoundAnalysisData | null>(null);
  const [onlyRoundsData, setOnlyRoundsData] = useState<OnlyRoundData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [getPlayersData, setGetPlayers] = useState<PlayersData | null>(null);
  // Fetch match data and round analysis in parallel - only once
  useEffect(() => {
    if (!matchId) {
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);

    Promise.all([
      getMatchDetails(matchId),
      getRoundAnalysis(matchId), 
      getPlayers(matchId),
    ])
      .then(([matchData, roundsAnalysis, ]) => {
        setDetails(matchData);
        setRoundsData(roundsAnalysis);
        setOnlyRoundsData(roundsAnalysis.only_rounds_data);
        setGetPlayers(getPlayersData);
        setLoading(false);

      })
      .catch((err) => {
        setError(`Failed to fetch data: ${err.message}`);
        setLoading(false);
      });
  }, [matchId]);

  // Calculate derived stats
  const stats = useMemo(() => {
    if (!details) return null;

    const { player_kills, enemy_kills } = details;
    const allPlayers = [...player_kills, ...enemy_kills];

    const topKiller = allPlayers.reduce((prev, current) => 
      (prev["Player Kills"] > current["Player Kills"]) ? prev : current, allPlayers[0] || {});

    const bestKD = allPlayers.reduce((prev, current) => 
      (prev.Difference > current.Difference) ? prev : current, allPlayers[0] || {});

    const leastDeaths = allPlayers.reduce((prev, current) => 
      (prev["Enemy Kills"] < current["Enemy Kills"]) ? prev : current, allPlayers[0] || {});

    const teamAStats = player_kills.reduce((acc, player) => ({
      kills: acc.kills + player["Player Kills"],
      deaths: acc.deaths + player["Enemy Kills"],
      difference: acc.difference + player.Difference
    }), { kills: 0, deaths: 0, difference: 0 });

    const teamBStats = enemy_kills.reduce((acc, player) => ({
      kills: acc.kills + player["Enemy Kills"],
      deaths: acc.deaths + player["Player Kills"],
      difference: acc.difference + player.Difference
    }), { kills: 0, deaths: 0, difference: 0 });

    return {
      allPlayers,
      topKiller,
      bestKD,
      leastDeaths,
      teamAStats,
      teamBStats
    };
  }, [details]);

  if (loading) {
    return (
      <div className="cinematic-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading Epic Match Details...</div>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cinematic-container">
        <div className="error-screen">
          <div className="error-icon">⚠️</div>
          <h2>Match Data Unavailable</h2>
          <p>{error}</p>
          <Link to="/" className="back-btn">Return to Tournament</Link>
        </div>
      </div>
    );
  }

  if (!details || !stats) {
    return (
      <div className="cinematic-container">
        <div className="error-screen">
          <h2>No Match Found</h2>
          <Link to="/" className="back-btn">Return to Tournament</Link>
        </div>
      </div>
    );
  }

  const { match } = details;

  const sections = [
    { id: 'overview', name: 'Overview', icon: '🏆' },
    { id: 'draft', name: 'Draft Phase', icon: '🗺️' },
    { id: 'players', name: 'Players', icon: '👥' },
    { id: 'rounds', name: 'Round Analysis', icon: '🎬' },
    { id: 'timeseries', name: 'Player Analytics', icon: '📈' },
    { id: 'duels', name: 'Duels', icon: '⚔️' },
    { id: 'stats', name: 'Statistics', icon: '📊' }
  ];

  return (
    <div className="cinematic-container">
      {/* Header */}
      <header className="match-header">
        <Link to="/" className="back-btn">
          <span className="back-icon">←</span>
          Tournament
        </Link>
        <div className="match-title-section">
          <h1 className="match-title">{match["Match Name"]}</h1>
          <div className="match-meta">
            <span className="match-type">{match["Match Type"]}</span>
            <span className="match-stage">{match.Stage}</span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="section-nav">
        {sections.map(section => (
          <button
            key={section.id}
            className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className="nav-icon">{section.icon}</span>
            {section.name}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="match-content">
        {activeSection === 'overview' && (
          <OverviewSection
            details={details}
            teamAStats={stats.teamAStats}
            teamBStats={stats.teamBStats}
            topKiller={stats.topKiller}
            bestKD={stats.bestKD}
            leastDeaths={stats.leastDeaths}
          />
        )}

        {activeSection === 'draft' && (
          <DraftPhaseSection details={details} />
        )}

        {activeSection === 'players' && (
          <Players />
        )}

        {activeSection === 'rounds' && (
          <RoundsAnalysisSection roundsData={roundsData} match={match} onlyRoundsData={onlyRoundsData} />
        )}

        {activeSection === 'timeseries' && (
          <PlayerAnalyticsSection allPlayers={stats.allPlayers} match={match} />
        )}

        {activeSection === 'duels' && (
          <DuelsSection details={details} />
        )}

        {activeSection === 'stats' && (
          <StatisticsSection roundsData={roundsData} match={match} />
        )}
      </main>
    </div>
  );
};

export default MatchDetails;
