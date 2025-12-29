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
import { motion, AnimatePresence } from "framer-motion";

const MatchDetails: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [details, setDetails] = useState<MatchData | null>(null);
  const [roundsData, setRoundsData] = useState<RoundAnalysisData | null>(null);
  const [onlyRoundsData, setOnlyRoundsData] = useState<OnlyRoundData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [getPlayersData, setGetPlayers] = useState<PlayersData | null>(null);

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
      .then(([matchData, roundsAnalysis, playersData]) => {
        setDetails(matchData);
        setRoundsData(roundsAnalysis);
        setOnlyRoundsData(roundsAnalysis.only_rounds_data);
        setGetPlayers(playersData as unknown as PlayersData);
        setLoading(false);
      })
      .catch((err) => {
        setError(`Failed to fetch data: ${err.message}`);
        setLoading(false);
      });
  }, [matchId]);

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

    return { allPlayers, topKiller, bestKD, leastDeaths, teamAStats, teamBStats };
  }, [details]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-valorant-red border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-400 tracking-widest font-mono animate-pulse">LOADING MATCH DATA...</p>
      </div>
    );
  }

  if (error || !details || !stats) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-4xl font-bold mb-4 text-valorant-red">DATA UNAVAILABLE</h2>
        <p className="text-gray-400 mb-8 max-w-md">{error || "Match data not found."}</p>
        <Link to="/" className="text-white hover:text-valorant-red underline underline-offset-4">Return to Tournament</Link>
      </div>
    );
  }

  const { match } = details;

  const sections = [
    { id: 'overview', name: 'Overview', icon: '🏆' },
    { id: 'draft', name: 'Draft', icon: '🗺️' },
    { id: 'players', name: 'Squads', icon: '👥' },
    { id: 'rounds', name: 'Rounds', icon: '🎬' },
    { id: 'timeseries', name: 'Analytics', icon: '📈' },
    { id: 'duels', name: 'Duels', icon: '⚔️' },
    { id: 'stats', name: 'Stats', icon: '📊' }
  ];

  return (
    <div>
      {/* Header */}
      <header className="mb-8 border-b border-white/10 pb-8">
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500 font-mono uppercase tracking-wider">
          <Link to="/" className="hover:text-valorant-red transition-colors flex items-center gap-2">
            <span>←</span> TOURNAMENT
          </Link>
          <span>/</span>
          <span className="text-white">{match.Stage}</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="text-valorant-red font-bold tracking-widest text-sm mb-1">{match["Match Type"].toUpperCase()}</div>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-none tracking-tight">{match["Match Name"]}</h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all border ${activeSection === section.id
                  ? 'bg-valorant-red text-white border-valorant-red'
                  : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                  }`}
              >
                <span className="mr-2 opacity-70">{section.icon}</span>
                {section.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Pane */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-[400px]"
        >
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

          {activeSection === 'draft' && <DraftPhaseSection details={details} />}
          {activeSection === 'players' && <Players matchId={matchId || ''} />}
          {activeSection === 'rounds' && <RoundsAnalysisSection roundsData={roundsData} match={match} onlyRoundsData={onlyRoundsData || []} />}
          {activeSection === 'timeseries' && <PlayerAnalyticsSection allPlayers={stats.allPlayers} match={match} />}
          {activeSection === 'duels' && <DuelsSection details={details} />}
          {activeSection === 'stats' && <StatisticsSection roundsData={roundsData} match={match} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MatchDetails;
