import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getMatches } from '../lib/api'
import { Button } from '../components/ui/Button'
import { motion } from 'framer-motion'

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

const BracketMatch = ({ match, className = "" }: { match?: Match, className?: string }) => {
  if (!match) return <div className={`h-24 bg-valorant-black/40 border border-white/5 rounded ${className}`} />;

  const winner = (match["Match Result"] || "").replace(" won", "")
  const teamAWin = match["Team A"] === winner;
  const teamBWin = match["Team B"] === winner;

  return (
    <Link to={`/match/${match.match_id}`} className={`block relative group ${className}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="h-24 bg-valorant-dark border-l-4 border-l-gray-600 hover:border-l-valorant-red border border-white/10 transition-all cursor-pointer relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50" />

        <div className="relative h-full flex flex-col justify-center">
          {/* Team A */}
          <div className={`flex justify-between items-center px-4 py-1.5 ${teamAWin ? 'bg-white/5' : ''}`}>
            <span className={`font-bold font-sans tracking-wide ${teamAWin ? 'text-white' : 'text-gray-400'}`}>
              {match["Team A"]}
            </span>
            <span className={`font-mono ${teamAWin ? 'text-valorant-red' : 'text-gray-500'}`}>
              {match["Team A Score"]}
            </span>
          </div>

          <div className="h-px bg-white/5 mx-2" />

          {/* Team B */}
          <div className={`flex justify-between items-center px-4 py-1.5 ${teamBWin ? 'bg-white/5' : ''}`}>
            <span className={`font-bold font-sans tracking-wide ${teamBWin ? 'text-white' : 'text-gray-400'}`}>
              {match["Team B"]}
            </span>
            <span className={`font-mono ${teamBWin ? 'text-valorant-red' : 'text-gray-500'}`}>
              {match["Team B Score"]}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

const GroupBracket = ({ matches, groupName }: { matches: Match[], groupName: string }) => {
  // Filter matches
  const opening = matches.filter(m => m["Match Type"].includes("Opening"));
  const winner = matches.find(m => m["Match Type"].includes("Winner's"));
  const elimination = matches.find(m => m["Match Type"].includes("Elimination"));
  const decider = matches.find(m => m["Match Type"].includes("Decider"));

  return (
    <div className="mb-12 bg-valorant-black/20 p-6 rounded-xl border border-white/5">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-8 w-1 bg-valorant-red" />
        <h2 className="text-3xl font-bold font-sans tracking-tight text-white">GROUP {groupName}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
        {/* Connecting Lines (Simplified for now with borders/pseudo-elements if needed, keeping it clean for performance) */}

        {/* Round 1: Opening */}
        <div className="flex flex-col justify-center gap-8">
          <div className="text-xs text-gray-400 font-mono mb-2 uppercase tracking-widest">Opening Round</div>
          {opening.map(m => <BracketMatch key={m.match_id} match={m} />)}
        </div>

        {/* Round 2: Winners & Elimination */}
        <div className="flex flex-col justify-between py-4">
          <div>
            <div className="text-xs text-valorant-red font-mono mb-2 uppercase tracking-widest">Winners Match</div>
            <BracketMatch match={winner} />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-mono mb-2 uppercase tracking-widest">Elimination Match</div>
            <BracketMatch match={elimination} />
          </div>
        </div>

        {/* Round 3: Decider */}
        <div className="flex flex-col justify-end pb-4">
          <div className="text-xs text-gray-400 font-mono mb-2 uppercase tracking-widest">Decider Match</div>
          <BracketMatch match={decider} />
        </div>

        {/* Qualified Overlay/List */}
        <div className="flex flex-col justify-center gap-4 pl-4 border-l border-white/5">
          <div className="text-xs text-gray-500 font-mono uppercase tracking-widest">Qualified</div>
          {winner && <div className="p-3 bg-valorant-red/10 border border-valorant-red/20 text-valorant-red font-bold text-center rounded">
            <span className="block text-xs opacity-70 mb-1">SEED #1</span>
            {winner["Match Result"].replace(" won", "")}
          </div>}
          {decider && <div className="p-3 bg-white/5 border border-white/10 text-white font-bold text-center rounded">
            <span className="block text-xs opacity-70 mb-1">SEED #2</span>
            {decider["Match Result"].replace(" won", "")}
          </div>}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { data: matches = [], isLoading, isError } = useQuery({
    queryKey: ['matches'],
    queryFn: getMatches,
    staleTime: 60000 // Cache for 1 min
  })

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-valorant-red border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-400 tracking-widest font-mono animate-pulse">INITIATING DATA STREAM...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-4xl font-bold mb-4 text-valorant-red">CONNECTION ERROR</h2>
        <p className="text-gray-400 mb-8 max-w-md">Unable to retrieve tournament data from the tactical network. Please verify your connection.</p>
        <Button onClick={() => window.location.reload()}>RETRY CONNECTION</Button>
      </div>
    )
  }

  const groupStageMatches = matches.filter((m: any) => m.Stage === "Group Stage")

  // Helper to get matches for a specific group
  const getGroupMatches = (group: string) =>
    groupStageMatches.filter((m: any) => m["Match Type"].includes(`(${group})`))

  return (
    <div>
      <header className="mb-16 relative">
        <div className="absolute -left-10 top-0 w-2 h-full bg-valorant-red hidden lg:block" />
        <h1 className="text-6xl md:text-8xl font-bold leading-none tracking-tighter text-white mb-2">
          CHAMPIONS <span className="text-transparent bg-clip-text bg-gradient-to-r from-valorant-red to-white">2025</span>
        </h1>
        <div className="flex items-center gap-4 text-xl tracking-widest text-gray-400 font-mono">
          <span>PARIS</span>
          <span className="w-1.5 h-1.5 bg-valorant-red rounded-full" />
          <span>GROUP STAGE</span>
        </div>
      </header>

      <div className="space-y-4">
        <GroupBracket groupName="A" matches={getGroupMatches("A")} />
        <GroupBracket groupName="B" matches={getGroupMatches("B")} />
        <GroupBracket groupName="C" matches={getGroupMatches("C")} />
        <GroupBracket groupName="D" matches={getGroupMatches("D")} />
      </div>
    </div>
  )
}
