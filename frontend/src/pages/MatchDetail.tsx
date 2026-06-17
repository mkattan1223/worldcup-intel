import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMatch } from '../hooks/useMatches'
import { api } from '../services/api'
import type { Match, FullH2HData, CsvMatch } from '../types'
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
  { id: 'sixsigma',  label: '6σ' },
  { id: 'h2h',       label: 'H2H' },
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

function useSecondsAgo(date: Date | null): number {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    if (!date) return
    const update = () => setSecs(Math.floor((Date.now() - date.getTime()) / 1000))
    update()
    const id = setInterval(update, 5000)
    return () => clearInterval(id)
  }, [date])
  return secs
}

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>()
  const matchId = parseInt(id ?? '0', 10)
  const { match, loading, error, lastUpdated } = useMatch(matchId)
  const [tab, setTab] = useState<Tab>('overview')
  const [homeMatches, setHomeMatches] = useState<Match[]>([])
  const [awayMatches, setAwayMatches] = useState<Match[]>([])
  const [h2hData, setH2hData] = useState<FullH2HData | null>(null)
  const secondsAgo = useSecondsAgo(lastUpdated)

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
      <div className="h-52 bg-slate-800 rounded-2xl animate-pulse border border-slate-700" />
      <div className="h-12 bg-slate-800 rounded-xl animate-pulse border border-slate-700" />
      <div className="h-72 bg-slate-800 rounded-xl animate-pulse border border-slate-700" />
      <p className="text-center text-slate-600 text-xs animate-pulse">Loading match data…</p>
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
      <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
        ← All Matches
      </Link>

      {/* Match hero */}
      <div className={`rounded-2xl border p-6 ${
        isLive
          ? 'bg-gradient-to-b from-emerald-950/50 to-slate-800/90 border-emerald-500/50 shadow-xl shadow-emerald-900/20 ring-1 ring-emerald-500/10'
          : isDone
          ? 'bg-gradient-to-b from-slate-800 to-slate-800/70 border-slate-700'
          : 'bg-gradient-to-b from-slate-800/80 to-slate-800/50 border-slate-700'
      }`}>
        {/* Stage + live badge */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2">
            <span className="text-xs text-slate-500 uppercase tracking-widest">
              {STAGE_LABELS[match.stage] ?? match.stage}
              {match.group ? ` · ${match.group}` : ''}
            </span>
            {isLive && (
              <span className="relative flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-900/50 border border-emerald-500/50 rounded-full px-2.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping absolute left-2" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0" />
                LIVE
              </span>
            )}
          </div>
        </div>

        {/* Teams + score */}
        <div className="flex items-center gap-4">
          {/* Home team */}
          <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
            {match.home_team_crest ? (
              <img src={match.home_team_crest} alt={match.home_team_name}
                className="w-20 h-20 object-contain drop-shadow-xl" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-700" />
            )}
            <p className={`font-black text-center text-lg leading-tight ${
              isDone && match.score_winner === 'HOME_TEAM' ? 'text-white' : 'text-slate-300'
            }`}>
              {match.home_team_name}
            </p>
            <span className="text-xs font-mono text-slate-600 bg-slate-700/40 px-2 py-0.5 rounded">
              {match.home_team_tla}
            </span>
          </div>

          {/* Score */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            {isDone || isLive ? (
              <>
                <div className={`text-6xl font-black tracking-tight tabular-nums ${
                  isLive ? 'text-emerald-300' : 'text-white'
                }`}>
                  {match.ft_home} – {match.ft_away}
                </div>
                {isDone && match.ht_home !== null && (
                  <span className="text-xs text-slate-600 bg-slate-700/30 px-2 py-0.5 rounded">
                    HT {match.ht_home} – {match.ht_away}
                  </span>
                )}
                {isLive && lastUpdated && (
                  <span className="text-xs text-emerald-600">
                    updated {secondsAgo < 10 ? 'just now' : `${secondsAgo}s ago`}
                  </span>
                )}
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-slate-500">vs</div>
                <div className="text-xs text-slate-600">{match.status}</div>
              </>
            )}
            {isLive && (
              <span className="text-[10px] text-emerald-600 font-medium">live · 30s refresh</span>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
            {match.away_team_crest ? (
              <img src={match.away_team_crest} alt={match.away_team_name}
                className="w-20 h-20 object-contain drop-shadow-xl" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-700" />
            )}
            <p className={`font-black text-center text-lg leading-tight ${
              isDone && match.score_winner === 'AWAY_TEAM' ? 'text-white' : 'text-slate-300'
            }`}>
              {match.away_team_name}
            </p>
            <span className="text-xs font-mono text-slate-600 bg-slate-700/40 px-2 py-0.5 rounded">
              {match.away_team_tla}
            </span>
          </div>
        </div>

        {/* Date + venue */}
        <div className="mt-5 text-center space-y-1">
          <p className="text-xs text-slate-500">{fmtDate(match.utc_date)}</p>
          {venueDisplay && (
            <p className="text-xs text-slate-600 font-medium">{venueLabel(venueDisplay)}</p>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              tab === t.id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 ring-1 ring-emerald-400/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg shadow-black/20">
        {tab === 'overview' && (
          <Overview match={match} homeMatches={homeMatches} awayMatches={awayMatches} />
        )}

        {tab === 'poisson' && (
          <div>
            <SectionHeader
              title="Poisson Score Probability"
              desc="Expected goals from 2025-26 form data (CSV), adjusted by cross-confederation scouting ratings."
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
              desc="Official lineups via ESPN when available. Falls back to coach's known preferred system."
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
              desc="Statistical process control — detects unusually high or low scoring performances (outside 3σ)."
            />
            <div>
              <p className="text-sm font-bold text-emerald-400 mb-4">{match.home_team_name}</p>
              <SixSigmaChart
                teamId={match.home_team_id}
                teamName={match.home_team_name}
                color="#22c55e"
              />
            </div>
            <div className="border-t border-slate-700 pt-6">
              <p className="text-sm font-bold text-blue-400 mb-4">{match.away_team_name}</p>
              <SixSigmaChart
                teamId={match.away_team_id}
                teamName={match.away_team_name}
                color="#3b82f6"
              />
            </div>
          </div>
        )}

        {tab === 'h2h' && (
          <H2HView
            data={h2hData}
            homeTeamName={match.home_team_name}
            awayTeamName={match.away_team_name}
            homeCrest={match.home_team_crest}
            awayCrest={match.away_team_crest}
          />
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
          <div key={label} className="bg-slate-700/40 rounded-xl p-3 border border-slate-600/30">
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
            <div key={name} className="bg-slate-700/40 rounded-xl p-3 border border-slate-600/30">
              <div className="flex items-center gap-2 mb-2">
                {crest && <img src={crest} alt="" className="w-6 h-6 object-contain" />}
                <span className="text-xs font-bold text-white truncate">{name}</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center text-xs">
                {[
                  { l: 'P', v: rec.played },
                  { l: 'W', v: rec.w },
                  { l: 'D', v: rec.d },
                  { l: 'L', v: rec.l },
                ].map(({ l, v }) => (
                  <div key={l}>
                    <div className="text-slate-500 text-[10px]">{l}</div>
                    <div className={`font-bold text-sm ${color}`}>{v}</div>
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
              {name} — WC Form
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
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-transform hover:scale-110 ${
                      result === 'W' ? 'bg-emerald-700 text-emerald-100'
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

// ── Competition pill styles ───────────────────────────────────────────────────
function getCompetitionStyle(tournament: string) {
  const t = tournament.toLowerCase()
  if (t.includes('world cup') && !t.includes('qualif')) {
    return { border: 'border-amber-600/50', bg: 'bg-amber-900/40', text: 'text-amber-300' }
  }
  if (t.includes('qualif') || t.includes('qualifier')) {
    return { border: 'border-blue-600/50', bg: 'bg-blue-900/40', text: 'text-blue-300' }
  }
  if (t.includes('nations league')) {
    return { border: 'border-purple-600/50', bg: 'bg-purple-900/40', text: 'text-purple-300' }
  }
  if (t.includes('copa') || t.includes('gold cup') || t.includes('euro') || t.includes('continental') || t.includes('championship')) {
    return { border: 'border-orange-600/50', bg: 'bg-orange-900/40', text: 'text-orange-300' }
  }
  return { border: 'border-slate-600/50', bg: 'bg-slate-700/40', text: 'text-slate-400' }
}

function H2HView({
  data, homeTeamName, awayTeamName, homeCrest, awayCrest,
}: {
  data: FullH2HData | null
  homeTeamName: string
  awayTeamName: string
  homeCrest?: string | null
  awayCrest?: string | null
}) {
  if (!data) return (
    <div className="flex items-center justify-center gap-2 text-slate-500 py-12 text-sm">
      <div className="w-4 h-4 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
      Loading head-to-head history…
    </div>
  )

  const matches = data.matches ?? []

  if (!matches.length) return (
    <div className="text-center text-slate-500 py-12 text-sm">
      <p className="text-2xl mb-2">📋</p>
      No head-to-head history found in the international results database.
    </div>
  )

  const { team_a_csv, team_b_csv } = data
  const { team_a_wins, draws, team_b_wins, total_matches } = data.aggregates

  function getResult(m: CsvMatch): 'W' | 'D' | 'L' {
    const aIsHome = m.home_team === team_a_csv
    const aScore = aIsHome ? m.home_score : m.away_score
    const bScore = aIsHome ? m.away_score : m.home_score
    if (aScore > bScore) return 'W'
    if (aScore === bScore) return 'D'
    return 'L'
  }

  // Group by decade
  const grouped = matches.reduce<Record<string, CsvMatch[]>>((acc, m) => {
    const year = parseInt(m.date.slice(0, 4))
    const decade = `${Math.floor(year / 10) * 10}s`
    if (!acc[decade]) acc[decade] = []
    acc[decade].push(m)
    return acc
  }, {})
  const decades = Object.keys(grouped).sort((a, b) => parseInt(b) - parseInt(a))

  const leader = team_a_wins > team_b_wins ? 'A' : team_b_wins > team_a_wins ? 'B' : null

  return (
    <div className="space-y-5">
      {/* All-time record summary */}
      <div className="rounded-2xl bg-gradient-to-b from-slate-700/30 to-slate-800/30 border border-slate-600/30 p-5">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest text-center mb-4 font-semibold">
          All-Time Head-to-Head · {total_matches} meetings
        </p>

        <div className="grid grid-cols-3 gap-4 text-center">
          {/* Team A */}
          <div className="flex flex-col items-center gap-2">
            {homeCrest && <img src={homeCrest} alt="" className="w-10 h-10 object-contain drop-shadow" />}
            <div className={`text-5xl font-black tabular-nums ${leader === 'A' ? 'text-emerald-400' : 'text-slate-300'}`}>
              {team_a_wins}
            </div>
            <div className="text-xs font-semibold text-slate-400 leading-tight max-w-[90px] text-center">
              {homeTeamName}
            </div>
            <div className="text-[10px] text-slate-600">wins</div>
          </div>

          {/* Draws */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <span className="text-slate-600 text-2xl font-black">·</span>
            </div>
            <div className="text-5xl font-black tabular-nums text-slate-500">{draws}</div>
            <div className="text-xs font-semibold text-slate-500">Draws</div>
            <div className="text-[10px] text-slate-600">&nbsp;</div>
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center gap-2">
            {awayCrest && <img src={awayCrest} alt="" className="w-10 h-10 object-contain drop-shadow" />}
            <div className={`text-5xl font-black tabular-nums ${leader === 'B' ? 'text-emerald-400' : 'text-slate-300'}`}>
              {team_b_wins}
            </div>
            <div className="text-xs font-semibold text-slate-400 leading-tight max-w-[90px] text-center">
              {awayTeamName}
            </div>
            <div className="text-[10px] text-slate-600">wins</div>
          </div>
        </div>

        {/* Win ratio bar */}
        {total_matches > 0 && (
          <div className="mt-5">
            <div className="h-2 rounded-full bg-slate-700 overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${(team_a_wins / total_matches) * 100}%` }}
              />
              <div
                className="h-full bg-slate-500 transition-all duration-700"
                style={{ width: `${(draws / total_matches) * 100}%` }}
              />
              <div
                className="h-full bg-blue-500 transition-all duration-700"
                style={{ width: `${(team_b_wins / total_matches) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] text-slate-600">
              <span className="text-emerald-600">{homeTeamName.split(' ')[0]}</span>
              <span>Draw</span>
              <span className="text-blue-600">{awayTeamName.split(' ')[0]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-500 items-center">
        <span className="font-semibold text-slate-400">Color from {homeTeamName} view:</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-4 rounded bg-emerald-500/60 inline-block" />Win</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-4 rounded bg-slate-600 inline-block" />Draw</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-4 rounded bg-red-600/60 inline-block" />Loss</span>
      </div>

      {/* Match list grouped by decade */}
      <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
        {decades.map(decade => (
          <div key={decade}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 sticky top-0 bg-slate-800/90 py-1">
              {decade}
            </p>
            <div className="space-y-2">
              {grouped[decade].map((m, idx) => {
                const aIsHome = m.home_team === team_a_csv
                const aScore = aIsHome ? m.home_score : m.away_score
                const bScore = aIsHome ? m.away_score : m.home_score
                const result = getResult(m)
                const cs = getCompetitionStyle(m.tournament)

                return (
                  <div key={`${m.date}-${idx}`} className={`rounded-xl border-l-4 px-3 py-2.5 ${
                    result === 'W'
                      ? 'border-emerald-500 bg-emerald-950/25'
                      : result === 'L'
                      ? 'border-red-600 bg-red-950/20'
                      : 'border-slate-600 bg-slate-700/20'
                  }`}>
                    {/* Score row */}
                    <div className="flex items-center gap-2">
                      <span className="flex-1 text-sm font-semibold text-slate-200 truncate">
                        {homeTeamName}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`text-2xl font-black tabular-nums w-6 text-center ${
                          aScore > bScore ? 'text-emerald-400'
                          : aScore < bScore ? 'text-red-400'
                          : 'text-slate-300'
                        }`}>{aScore}</span>
                        <span className="text-slate-600 text-sm">–</span>
                        <span className={`text-2xl font-black tabular-nums w-6 text-center ${
                          bScore > aScore ? 'text-emerald-400'
                          : bScore < aScore ? 'text-red-400'
                          : 'text-slate-300'
                        }`}>{bScore}</span>
                      </div>
                      <span className="flex-1 text-sm font-semibold text-slate-200 truncate text-right">
                        {awayTeamName}
                      </span>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs text-slate-500">{m.date.slice(0, 7)}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${cs.border} ${cs.bg} ${cs.text} truncate max-w-[200px]`}>
                        {m.tournament}
                      </span>
                      {!aIsHome && (
                        <span className="text-[10px] text-slate-600 ml-auto">{homeTeamName.split(' ')[0]} away</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-600 text-center pt-1">
        {total_matches} meetings · source: international results database (1872–present)
      </p>
    </div>
  )
}
