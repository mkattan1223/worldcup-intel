import {
  RadarChart as RechartsRadar,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import type { Match } from '../types'

interface TeamStats {
  goalsFor: number
  goalsAgainst: number
  wins: number
  draws: number
  played: number
  cleanSheets: number
}

function computeStats(matches: Match[], teamId: number): TeamStats {
  const finished = matches.filter(m => m.status === 'FINISHED')
  let goalsFor = 0, goalsAgainst = 0, wins = 0, draws = 0, cleanSheets = 0
  for (const m of finished) {
    const isHome = m.home_team_id === teamId
    const gf = isHome ? (m.ft_home ?? 0) : (m.ft_away ?? 0)
    const ga = isHome ? (m.ft_away ?? 0) : (m.ft_home ?? 0)
    goalsFor += gf
    goalsAgainst += ga
    if (gf > ga) wins++
    else if (gf === ga) draws++
    if (ga === 0) cleanSheets++
  }
  return { goalsFor, goalsAgainst, wins, draws, played: finished.length, cleanSheets }
}

function normalize(value: number, max: number) {
  return max === 0 ? 0 : Math.round((value / max) * 100)
}

interface Props {
  homeMatches: Match[]
  awayMatches: Match[]
  homeTeamId: number
  awayTeamId: number
  homeTeamName: string
  awayTeamName: string
}

export default function RadarChart({
  homeMatches, awayMatches, homeTeamId, awayTeamId,
  homeTeamName, awayTeamName,
}: Props) {
  const home = computeStats(homeMatches, homeTeamId)
  const away = computeStats(awayMatches, awayTeamId)

  const maxPlayed = Math.max(home.played, away.played, 1)
  const maxGF     = Math.max(home.goalsFor, away.goalsFor, 1)
  const maxGA     = Math.max(home.goalsAgainst, away.goalsAgainst, 1)

  const data = [
    {
      metric: 'Attack',
      [homeTeamName]: normalize(home.goalsFor, maxGF),
      [awayTeamName]: normalize(away.goalsFor, maxGF),
    },
    {
      metric: 'Defence',
      [homeTeamName]: normalize(maxGA - home.goalsAgainst, maxGA),
      [awayTeamName]: normalize(maxGA - away.goalsAgainst, maxGA),
    },
    {
      metric: 'Win Rate',
      [homeTeamName]: normalize(home.wins, maxPlayed),
      [awayTeamName]: normalize(away.wins, maxPlayed),
    },
    {
      metric: 'Clean Sheets',
      [homeTeamName]: normalize(home.cleanSheets, maxPlayed),
      [awayTeamName]: normalize(away.cleanSheets, maxPlayed),
    },
    {
      metric: 'Consistency',
      [homeTeamName]: normalize(home.wins + home.draws, maxPlayed),
      [awayTeamName]: normalize(away.wins + away.draws, maxPlayed),
    },
    {
      metric: 'Goals/Game',
      [homeTeamName]: normalize(home.goalsFor, maxGF),
      [awayTeamName]: normalize(away.goalsFor, maxGF),
    },
  ]

  if (home.played === 0 && away.played === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        No finished matches yet — radar will populate after games are played.
      </div>
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={320}>
        <RechartsRadar data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
          <Radar name={homeTeamName} dataKey={homeTeamName}
            stroke="#22c55e" fill="#22c55e" fillOpacity={0.25} strokeWidth={2} />
          <Radar name={awayTeamName} dataKey={awayTeamName}
            stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            labelStyle={{ color: '#f8fafc', fontWeight: 600 }}
            itemStyle={{ color: '#94a3b8' }}
          />
        </RechartsRadar>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
        {[
          { label: 'Goals Scored', h: home.goalsFor, a: away.goalsFor },
          { label: 'Goals Conceded', h: home.goalsAgainst, a: away.goalsAgainst },
          { label: 'Wins', h: home.wins, a: away.wins },
          { label: 'Clean Sheets', h: home.cleanSheets, a: away.cleanSheets },
        ].map(({ label, h, a }) => (
          <div key={label} className="bg-slate-700/40 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">{label}</p>
            <div className="flex justify-between font-bold">
              <span className="text-green-400">{h}</span>
              <span className="text-slate-500 text-xs font-normal">vs</span>
              <span className="text-blue-400">{a}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
