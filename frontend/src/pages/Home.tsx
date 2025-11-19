import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getMatches, getMatchDetails } from '../lib/api'
import '../css/Home.css'

interface Match {
  match_id: string;
  "Match Name": string;
  "Match Result": string;
  "Match Type": string;
  Stage: string;
  "Team A": string;
  "Team B": string;
  "Team A Score"?: number;
  "Team B Score"?: number;
}

export default function Home() {
  const matchesQ = useQuery({ queryKey: ['matches'], queryFn: getMatches })
  const matches: Match[] = Array.isArray(matchesQ.data) ? matchesQ.data : []
  if (matchesQ.isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Tournament...</p>
      </div>
    )
  }

  if (matchesQ.isError) {
    return (
      <div className="error-container">
        <p>Error loading matches data</p>
      </div>
    )
  }


  // Group matches by stage
  const groupStageMatches = matches.filter(match => match.Stage === "Group Stage")

  // Group by match type for bracket structure
  const openingMatches = groupStageMatches.filter(match => match["Match Type"].includes("Opening"))
  const winnerMatches = groupStageMatches.filter(match => match["Match Type"].includes("Winner's"))
  const eliminationMatches = groupStageMatches.filter(match => match["Match Type"].includes("Elimination"))
  const deciderMatches = groupStageMatches.filter(match => match["Match Type"].includes("Decider"))

  // Group opening matches by group (A, B, C, D)
  const groupA = openingMatches.filter(match => match["Match Type"].includes("(A)"))
  const groupB = openingMatches.filter(match => match["Match Type"].includes("(B)"))
  const groupC = openingMatches.filter(match => match["Match Type"].includes("(C)"))
  const groupD = openingMatches.filter(match => match["Match Type"].includes("(D)"))


  const createMatchCard = (match: Match) => {
    const matchId = match.match_id;
    const linkUrl = `/match/${matchId}`;

    const winner = (match["Match Result"] || "").replace(" won", "")

    return (
      <Link to={`/match/${matchId}`} key={matchId} state={{ preview: match }}>
        <div className="match-card">
          <div className="team-slot">
            <div className={`team ${match["Team A"] === winner ? 'winner' : ''}`}>
              <span className="team-name">{match["Team A"]}</span>
              <span className="team-score">{match["Team A Score"]}</span>
            </div>
          </div>

          <div className="team-slot">
            <div className={`team ${match["Team B"] === winner ? 'winner' : ''}`}>
              <span className="team-name">{match["Team B"]}</span>
              <span className="team-score">{match["Team B Score"]}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  const createGroupBracket = (groupMatches: Match[], groupName: string) => {
    const winnerMatch = winnerMatches.find(match => match["Match Type"].includes(`(${groupName})`))
    const eliminationMatch = eliminationMatches.find(match => match["Match Type"].includes(`(${groupName})`))
    const deciderMatch = deciderMatches.find(match => match["Match Type"].includes(`(${groupName})`))

    return (
      <div className="group-bracket">
        <div className="group-header">
          <h3>GROUP {groupName}</h3>
        </div>

        <div className="bracket-rounds">
          <div className="round">
            <div className="round-title">Opening</div>
            <div className="matches">
              {groupMatches.map((match) => createMatchCard(match))}
            </div>
          </div>

          <div className="round">
            <div className="round-title">Winner's</div>
            <div className="matches">
              {winnerMatch && createMatchCard(winnerMatch)}
            </div>
          </div>

          <div className="round qualified-round">
            <div className="round-title">Qualified</div>
            <div className="qualified-team">
              {winnerMatch && (
                <div className="qualified-card">
                  <span>{winnerMatch["Match Result"].replace(" won", "")}</span>
                  <div className="check-mark">✓</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bracket-rounds elimination-bracket">
          <div className="round">
            <div className="round-title">Elimination</div>
            <div className="matches">
              {eliminationMatch && createMatchCard(eliminationMatch)}
            </div>
          </div>

          <div className="round">
            <div className="round-title">Decider</div>
            <div className="matches">
              {deciderMatch && createMatchCard(deciderMatch)}
            </div>
          </div>

          <div className="round qualified-round">
            <div className="round-title">Qualified</div>
            <div className="qualified-team">
              {deciderMatch && (
                <div className="qualified-card">
                  <span>{deciderMatch["Match Result"].replace(" won", "")}</span>
                  <div className="check-mark">✓</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="tournament-container">
      <header className="tournament-header">
        <h1>VALORANT CHAMPIONS 2025</h1>
        <p>Group Stage — Paris</p>
      </header>

      <div className="groups-container">
        {createGroupBracket(groupA, "A")}
        {createGroupBracket(groupB, "B")}
        {createGroupBracket(groupC, "C")}
        {createGroupBracket(groupD, "D")}
      </div>
    </div>
  )
}
