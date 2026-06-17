import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMatch } from '../hooks/useMatches'
import { api } from '../services/api'
import type { Match, FullH2HData } from '../types'
import RadarChart from '../components/RadarChart'
import PoissonGrid from '../components/PoissonGrid'
import SixSigmaChart from '../components/SixSigmaChart'
import FormationDiagram from '../components/FormationDiagram'
import Tactics from '../components/Tactics'
import { getVenueForMatch, venueLabel } from '../utils/venues'

type Tab = 'overview' | 'poisson' | 'radar' | 'formation' | 'tactics' | 'sixsigma' | 'h2h'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',  label: 'Overview' },
  { id: 'poisson',   label: 'Poisson' },
  { id: 'radar',     label: 'Radar' },
  { id: 'formation', label: 'Formation' },
  { id: 'tactics',   label: 'Tactics' },
  { id: 'sixsigma',  label: '6σ Control' },
  { id: 'h2h',       label: 'Head2Head' },
]

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: 'Group Stage', LAST_32: 'Round of 32', LAST_16: 'Round of 16',
  QUARTER_FINALS: 'Quarter-Final', SEMI_FINALS: 'Semi-Final',
  FINAL: 'Final', THIRD_PLACE: '3rd Place',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric',
    year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  })
}

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>()
  const matchId = parseInt(id ?? '0', 10)
  const { match, loading, error } = useMatch(matchId)
  const [tab, setTab] = useState<Tab>('overview')
  const [homeMatches, setHomeMatches] = useState<Match[]>([])
  const [awayMatches, setAwayMatches] = useState<Match[]>([])
  const [h2hData, setH2hData] = useState<FullH2HData | null>(null)

  useEffect(() => {
    if (!match) return
    Promise.all([
      api.getTeamMatches(match.home_team_id),
      api.getTeamMatches(match.away_team_id),
    ]).then(([h, a]) => {
      setHomeMatches(h)
      setAwayMatches(a)
    }).catch(() => {})

    api.getMatchHead2HeadFull(matchId)
      .then(setH2hData)
      .catch(() => {})
  }, [match, matchId])

  if (loading) return (
    <div className="space-y-4">
      <div className="h-48 bg-slate-800 rounded-2xl animate-pulse border border-slate-700" />
      <div className="h-10 bg-slate-800 rounded-xl animate-pulse border border-slate-700" />
      <div className="h-64 bg-slate-800 rounded-xl animate-pulse border border-slate-700" />
    </div>
  )

  if (error || !match) return (
    <div className="text-center py-20">
      <p className="text-red-400 text-lg font-semibold mb-2">Match not found</p>
      <p className="text-slate-500 text-sm mb-6">{error}</p>
      <Link to="/" className="text-emerald-400 hover:text-emerald-300 text-sm">← Back to Dashboard</Link>
    </div>
  )

  const isDone = match.status === 'FINISHED'
  const isLive = ['LIVE', 'IN_PLAY', 'PAUSED'].includes(match.status)
  const venueDisplay = getVenueForMatch(match)

  return (
    <div className="space-y-5">
      <Link to="/" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors">
        ← All Matches
      </Link>

      {/* Match hero */}
      <div className={`rounded-2xl border p-6 ${
        isLive
          ? 'bg-gradient-to-b from-emerald-950/40 to-slate-800/80 border-emerald-600/40'
          : 'bg-gradient-to-b from-slate-800 to-slate-800/60 border-slate-700'
      }`}>
        {/* Stage + live badge */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2">
            <span className="text-xs text-slate-500 uppercase tracking-widest">
              {STAGE_LABELS[match.stage] ?? match.stage}
              {match.group ? ` · ${match.group}` : ''}
            </span>
            {isLive && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-900/40 border border-emerald-600/40 rounded-full px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            )}
          </div>
        </div>

        {/* Teams + score */}
        <div className="flex items-center gap-4">
          {/* Home team */}
          <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
            {match.home_team_crest ? (
              <img src={match.home_team_crest} alt={match.home_team_name}
                className="w-16 h-16 object-contain drop-shadow-lg" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-700" />
            )}
            <p className={`font-bold text-center text-base leading-tight ${
              isDone && match.score_winner === 'HOME_TEAM' ? 'text-white' : 'text-slate-300'
            }`}>
              {match.home_team_name}
            </p>
            <span className="text-xs text-slate-600">{match.home_team_tla}</span>
          </div>

          {/* Score */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1">
            {isDone || isLive ? (
              <div className={`text-5xl font-black tracking-tight tabular-nums ${
                isLive ? 'text-emerald-400' : 'text-white'
              }`}>
                {match.ft_home} – {match.ft_away}
              </div>
            ) : (
              <div className="text-2xl font-bold text-slate-500">vs</div>
            )}
            {isDone && match.ht_home !== null && (
              <span className="text-xs text-slate-600">HT: {match.ht_home} – {match.ht_away}</span>
            )}
            <span className="text-xs font-semibold text-slate-500">{match.status}</span>
          </div>

          {/* Away team */}
          <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
            {match.away_team_crest ? (
              <img src={match.away_team_crest} alt={match.away_team_name}
                className="w-16 h-16 object-contain drop-shadow-lg" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-700" />
            )}
            <p className={`font-bold text-center text-base leading-tight ${
              isDone && match.score_winner === 'AWAY_TEAM' ? 'text-white' : 'text-slate-300'
            }`}>
              {match.away_team_name}
            </p>
            <span className="text-xs text-slate-600">{match.away_team_tla}</span>
          </div>
        </div>

        {/* Date + venue */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">{fmtDate(match.utc_date)}</p>
          {venueDisplay && (
            <p className="text-xs text-slate-600 mt-0.5">{venueLabel(venueDisplay)}</p>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              tab === t.id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5">
        {tab === 'overview' && (
          <Overview match={match} homeMatches={homeMatches} awayMatches={awayMatches} />
        )}

        {tab === 'poisson' && (
          <div>
            <SectionHeader
              title="Poisson Score Probability"
              desc="Expected goals auto-calculated from last 10 WC matches per team using a Dixon-Coles inspired model."
            />
            <PoissonGrid matchId={matchId} />
          </div>
        )}

        {tab === 'radar' && (
          <div>
            <SectionHeader
              title="Team Radar Comparison"
              desc="Scouting ratings across 6 dimensions based on international form and tactical profile."
            />
            <RadarChart
              homeTeamName={match.home_team_name}
              awayTeamName={match.away_team_name}
            />
          </div>
        )}

        {tab === 'formation' && (
          <div>
            <SectionHeader
              title="Tactical Formation"
              desc="Coach's preferred system based on 2025-26 season. Official lineups not available on free API tier."
            />
            <FormationDiagram
              matchId={matchId}
              homeTeamName={match.home_team_name}
              awayTeamName={match.away_team_name}
            />
          </div>
        )}

        {tab === 'tactics' && (
          <div>
            <SectionHeader
              title="Tactics & Coach Info"
              desc="Formation, pressing philosophy, defensive shape, and key tactical instructions."
            />
            <Tactics
              homeTeamName={match.home_team_name}
              awayTeamName={match.away_team_name}
            />
          </div>
        )}

        {tab === 'sixsigma' && (
          <div className="space-y-8">
            <SectionHeader
              title="Six Sigma I-MR Control Charts"
              desc="Individual and Moving Range charts detect statistically unusual performances (outside 3σ)."
            />
            <SixSigmaChart
              teamId={match.home_team_id}
              teamName={match.home_team_name}
              color="#22c55e"
            />
            <div className="border-t border-slate-700 pt-6">
              <p className="text-sm font-semibold text-slate-300 mb-4">{match.away_team_name}</p>
              <SixSigmaChart
                teamId={match.away_team_id}
                teamName={match.away_team_name}
                color="#3b82f6"
              />
            </div>
          </div>
        )}

        {tab === 'h2h' && (
          <div>
            <SectionHeader
              title="Head-to-Head History"
              desc="All historical meetings from the international results database (1872–present)."
            />
            <H2HView
              data={h2hData}
              homeTeamName={match.home_team_name}
              awayTeamName={match.away_team_name}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-bold text-white">{title}</h2>
      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
    </div>
  )
}

function Overview({
  match, homeMatches, awayMatches,
}: {
  match: Match; homeMatches: Match[]; awayMatches: Match[]
}) {
  const venue = getVenueForMatch(match)

  function teamRecord(matches: Match[], teamId: number) {
    const fin = matches.filter(m => m.status === 'FINISHED')
    let w = 0, d = 0, l = 0, gf = 0, ga = 0
    for (const m of fin) {
      const home = m.home_team_id === teamId
      const scored = home ? (m.ft_home ?? 0) : (m.ft_away ?? 0)
      const conceded = home ? (m.ft_away ?? 0) : (m.ft_home ?? 0)
      gf += scored; ga += conceded
      if (scored > conceded) w++
      else if (scored === conceded) d++
      else l++
    }
    return { played: fin.length, w, d, l, gf, ga }
  }

  const home = teamRecord(homeMatches, match.home_team_id)
  const away = teamRecord(awayMatches, match.away_team_id)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3 text-sm text-center">
        {[
          { label: 'Venue', value: venue ? venueLabel(venue) : 'TBD' },
          { label: 'Stage', value: (match.stage ?? '').replace(/_/g, ' ') },
          { label: 'Matchday', value: match.matchday != null ? `MD ${match.matchday}` : 'Knockout' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-700/40 rounded-xl p-3">
            <p className="text-slate-500 text-xs mb-1">{label}</p>
            <p className="text-white font-semibold text-xs">{value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-3">Tournament Record</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: match.home_team_name, crest: match.home_team_crest, rec: home, color: 'text-emerald-400' },
            { name: match.away_team_name, crest: match.away_team_crest, rec: away, color: 'text-blue-400' },
          ].map(({ name, crest, rec, color }) => (
            <div key={name} className="bg-slate-700/40 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                {crest && <img src={crest} alt="" className="w-6 h-6 object-contain" />}
                <span className="text-xs font-semibold text-white truncate">{name}</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center text-xs">
                {[
                  { l: 'P', v: rec.played },
                  { l: 'W', v: rec.w },
                  { l: 'D', v: rec.d },
                  { l: 'L', v: rec.l },
                ].map(({ l, v }) => (
                  <div key={l}>
                    <div className="text-slate-500">{l}</div>
                    <div className={`font-bold ${color}`}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>GF <strong className="text-white">{rec.gf}</strong></span>
                <span>GA <strong className="text-white">{rec.ga}</strong></span>
                <span>GD <strong className={rec.gf - rec.ga >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {rec.gf - rec.ga > 0 ? '+' : ''}{rec.gf - rec.ga}
                </strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {[
        { name: match.home_team_name, matches: homeMatches, teamId: match.home_team_id },
        { name: match.away_team_name, matches: awayMatches, teamId: match.away_team_id },
      ].map(({ name, matches, teamId }) => {
        const recent = matches.filter(m => m.status === 'FINISHED').slice(-5)
        if (!recent.length) return null
        return (
          <div key={name}>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-2">
              {name} — Recent Form
            </p>
            <div className="flex gap-1.5">
              {recent.map(m => {
                const isHome = m.home_team_id === teamId
                const gf = isHome ? (m.ft_home ?? 0) : (m.ft_away ?? 0)
                const ga = isHome ? (m.ft_away ?? 0) : (m.ft_home ?? 0)
                const result = gf > ga ? 'W' : gf < ga ? 'L' : 'D'
                const opp = isHome ? m.away_team_name : m.home_team_name
                return (
                  <div key={m.id} title={`${gf}–${ga} vs ${opp}`}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                      ${result === 'W' ? 'bg-emerald-700 text-emerald-100'
                        : result === 'L' ? 'bg-red-800 text-red-200'
                        : 'bg-slate-600 text-slate-200'}`}>
                    {result}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function H2HView({
  data, homeTeamName, awayTeamName,
}: {
  data: FullH2HData | null
  homeTeamName: string
  awayTeamName: string
}) {
  if (!data) return (
    <div className="text-center text-slate-500 py-10 text-sm animate-pulse">
      Loading head-to-head history…
    </div>
  )

  const matches = data.matches ?? []

  if (!matches.length) return (
    <div className="text-center text-slate-500 py-10 text-sm">
      No head-to-head history found in the international results database.
    </div>
  )

  // W/D/L computed directly from match data (team A = home team of current match)
  const teamAWins = data.aggregates.team_a_wins
  const draws = data.aggregates.draws
  const teamBWins = data.aggregates.team_b_wins

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-emerald-900/30 border border-emerald-700/30 rounded-xl p-3">
          <div className="text-2xl font-black text-emerald-400">{teamAWins}</div>
          <div className="text-xs text-slate-400 mt-0.5 truncate">{homeTeamName}</div>
        </div>
        <div className="bg-slate-700/40 border border-slate-600/30 rounded-xl p-3">
          <div className="text-2xl font-black text-slate-400">{draws}</div>
          <div className="text-xs text-slate-500 mt-0.5">Draws</div>
        </div>
        <div className="bg-blue-900/30 border border-blue-700/30 rounded-xl p-3">
          <div className="text-2xl font-black text-blue-400">{teamBWins}</div>
          <div className="text-xs text-slate-400 mt-0.5 truncate">{awayTeamName}</div>
        </div>
      </div>

      {/* Match list */}
      <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
        {matches.map((m, idx) => {
          const h = m.home_score
          const a = m.away_score
          return (
            <div key={`${m.date}-${idx}`} className="flex items-center gap-2 bg-slate-700/30 rounded-xl px-3 py-2 text-xs">
              <span className="text-slate-500 w-[70px] flex-shrink-0">
                {m.date.slice(0, 4)}
              </span>
              <span className="flex-1 text-slate-300 truncate">{m.home_team}</span>
              <span className="font-bold text-white tabular-nums px-1">{h}–{a}</span>
              <span className="flex-1 text-slate-300 truncate text-right">{m.away_team}</span>
              <span className="text-slate-600 flex-shrink-0 hidden sm:block max-w-[120px] truncate">
                {m.tournament}
              </span>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-slate-600 text-center">
        {matches.length} meetings · source: international results database (1872–present)
      </p>
    </div>
  )
}
