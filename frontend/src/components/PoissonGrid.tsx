import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { getTeamStats } from '../data/teamStats'
import type { AutoAnalysis } from '../types'

function heatColor(prob: number, max: number): string {
  const t = max > 0 ? Math.min(prob / max, 1) : 0
  const r = Math.round(16 + t * 18)
  const g = Math.round(24 + t * 155)
  const b = Math.round(40 + t * 80)
  return `rgb(${r},${g},${b})`
}

// Poisson PMF: P(X=k) computed in log-space to avoid overflow
function poissonPMF(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0
  let logP = -lambda + k * Math.log(lambda)
  for (let i = 2; i <= k; i++) logP -= Math.log(i)
  return Math.exp(logP)
}

// Build probability grid from two lambda values
function buildPoissonGrid(lh: number, la: number, maxGoals = 5) {
  const labels = Array.from({ length: maxGoals + 1 }, (_, i) => i)
  const grid = labels.map(h => labels.map(a => poissonPMF(lh, h) * poissonPMF(la, a)))

  let homeWin = 0, draw = 0, awayWin = 0
  grid.forEach((row, h) => row.forEach((p, a) => {
    if (h > a) homeWin += p
    else if (h === a) draw += p
    else awayWin += p
  }))

  const flat = grid.flat()
  const top = [...flat]
    .map((p, i) => ({ home: Math.floor(i / (maxGoals + 1)), away: i % (maxGoals + 1), probability: p }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 8)

  return { grid, labels, home_win_prob: homeWin, draw_prob: draw, away_win_prob: awayWin, top_scorelines: top }
}

// Static-strength lambda: uses 2025-26 scouting ratings when WC data is insufficient
function staticLambda(attackRating: number, oppDefenseRating: number): number {
  const BASE = 1.3      // avg WC group stage goals per team per game
  const LEAGUE_AVG = 72 // midpoint of our 0-100 scale
  const lambda = BASE * Math.pow(attackRating / LEAGUE_AVG, 1.3) * Math.pow(LEAGUE_AVG / oppDefenseRating, 0.7)
  return Math.max(0.3, Math.min(lambda, 5.0))
}

interface Props { matchId: number }

export default function PoissonGrid({ matchId }: Props) {
  const [data, setData] = useState<AutoAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.getMatchAutoAnalysis(matchId)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [matchId])

  if (loading) return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="h-12 bg-slate-700 rounded-lg" />
      <div className="h-64 bg-slate-700 rounded-lg" />
    </div>
  )

  if (error) return (
    <div className="rounded-xl bg-red-950/40 border border-red-800/40 p-4 text-red-400 text-sm">
      <p className="font-semibold mb-1">Could not load match data</p>
      <p className="text-red-500 text-xs">{error}</p>
    </div>
  )

  if (!data) return null

  // Multiplicative form adjustment: static lambda (cross-confederation defense) × attack form ratio
  // Static lambda correctly handles mismatches (e.g. Portugal vs Congo) via scouting ratings.
  // CSV form data only adjusts the team's own attacking output vs their expected baseline.
  const homeRatings = getTeamStats(data.home_team_name)
  const awayRatings = getTeamStats(data.away_team_name)
  const homeStaticLambda = staticLambda(homeRatings.attack, awayRatings.defense)
  const awayStaticLambda = staticLambda(awayRatings.attack, homeRatings.defense)

  const BASE = 1.3
  const LEAGUE_AVG = 72
  const PRIOR = 30
  const hw = data.home_stats.matches_used / (data.home_stats.matches_used + PRIOR)
  const aw = data.away_stats.matches_used / (data.away_stats.matches_used + PRIOR)

  // Expected goals vs average opponent from static attack rating alone
  const homeStaticAttack = BASE * Math.pow(homeRatings.attack / LEAGUE_AVG, 1.3)
  const awayStaticAttack = BASE * Math.pow(awayRatings.attack / LEAGUE_AVG, 1.3)

  // How much over/under static expectation is each team's 2025+ CSV attack form?
  const homeFormRatio = data.home_stats.matches_used > 0
    ? Math.max(0.3, Math.min(3.0, data.home_stats.avg_scored / homeStaticAttack))
    : 1.0
  const awayFormRatio = data.away_stats.matches_used > 0
    ? Math.max(0.3, Math.min(3.0, data.away_stats.avg_scored / awayStaticAttack))
    : 1.0

  const homeLambda = parseFloat((homeStaticLambda * Math.pow(homeFormRatio, hw)).toFixed(3))
  const awayLambda = parseFloat((awayStaticLambda * Math.pow(awayFormRatio, aw)).toFixed(3))
  const usingStatic = hw < 0.5 || aw < 0.5

  const computed = buildPoissonGrid(homeLambda, awayLambda)
  const maxProb = Math.max(...computed.grid.flat())
  const isTop3 = (h: number, a: number) =>
    computed.top_scorelines.slice(0, 3).some(s => s.home === h && s.away === a)

  return (
    <div className="space-y-5">
      {usingStatic && (
        <div className="rounded-xl bg-amber-950/30 border border-amber-700/30 px-3 py-2 text-xs text-amber-400">
          Scouting ratings adjusted by 2025-26 form data. As matches accumulate, attack output shifts toward live data.
        </div>
      )}

      {/* xG summary */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: data.home_team_name, crest: data.home_team_crest,
            lambda: homeLambda, stats: data.home_stats,
            color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-700/30',
          },
          {
            label: data.away_team_name, crest: data.away_team_crest,
            lambda: awayLambda, stats: data.away_stats,
            color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-700/30',
          },
        ].map(({ label, crest, lambda, stats, color, bg }) => (
          <div key={label} className={`rounded-xl border p-3 ${bg}`}>
            <div className="flex items-center gap-2 mb-2">
              {crest && <img src={crest} alt="" className="w-5 h-5 object-contain" />}
              <span className="text-xs text-slate-400 font-medium truncate">{label}</span>
            </div>
            <div className={`text-2xl font-black ${color}`}>{lambda.toFixed(2)}</div>
            <div className="text-xs text-slate-500 mt-0.5">xG (λ)</div>
            <div className="text-xs text-slate-600 mt-1">
              {stats.avg_scored.toFixed(2)} scored · {stats.avg_conceded.toFixed(2)} conceded
              <span className="ml-1">
                ({stats.matches_used === 0 ? 'scouting only' : `${stats.matches_used} WC match${stats.matches_used > 1 ? 'es' : ''}`})
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Win probability bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-emerald-400 font-semibold">
            {data.home_team_name} {(computed.home_win_prob * 100).toFixed(1)}%
          </span>
          <span className="text-slate-400">Draw {(computed.draw_prob * 100).toFixed(1)}%</span>
          <span className="text-blue-400 font-semibold">
            {(computed.away_win_prob * 100).toFixed(1)}% {data.away_team_name}
          </span>
        </div>
        <div className="h-3 flex rounded-full overflow-hidden gap-px">
          <div className="bg-emerald-500 transition-all" style={{ width: `${computed.home_win_prob * 100}%` }} />
          <div className="bg-slate-500 transition-all" style={{ width: `${computed.draw_prob * 100}%` }} />
          <div className="bg-blue-500 transition-all" style={{ width: `${computed.away_win_prob * 100}%` }} />
        </div>
      </div>

      {/* Top scorelines */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Most Likely Scorelines</p>
        <div className="flex flex-wrap gap-2">
          {computed.top_scorelines.map((s, i) => (
            <div key={i} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 border text-sm
              ${i === 0 ? 'bg-amber-900/30 border-amber-600/50 text-amber-300' : 'bg-slate-700/50 border-slate-600/50 text-slate-300'}`}>
              <span className="font-bold">{s.home}–{s.away}</span>
              <span className="text-xs opacity-60">{(s.probability * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Probability grid */}
      <div>
        <p className="text-xs text-slate-500 mb-2">
          Rows = <span className="text-emerald-400">{data.home_team_name}</span> goals ·
          Columns = <span className="text-blue-400">{data.away_team_name}</span> goals
        </p>
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse">
            <thead>
              <tr>
                <th className="w-8 h-8 text-slate-500 text-center border border-slate-700/50 bg-slate-800">H╲A</th>
                {computed.labels.map(a => (
                  <th key={a} className="w-10 h-8 font-bold text-blue-400 text-center border border-slate-700/50 bg-slate-800">{a}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {computed.grid.map((row, h) => (
                <tr key={h}>
                  <td className="w-8 h-8 font-bold text-emerald-400 text-center border border-slate-700/50 bg-slate-800">
                    {computed.labels[h]}
                  </td>
                  {row.map((prob, a) => {
                    const top = isTop3(h, a)
                    return (
                      <td key={a}
                        title={`${h}–${a}: ${(prob * 100).toFixed(2)}%`}
                        className={`w-10 h-8 text-center border font-mono cursor-default
                          ${top ? 'border-amber-500/70 ring-1 ring-inset ring-amber-500/40' : 'border-slate-700/30'}`}
                        style={{ backgroundColor: heatColor(prob, maxProb) }}>
                        <span className={`text-xs ${top ? 'text-amber-200 font-bold' : 'text-slate-300'}`}>
                          {(prob * 100).toFixed(1)}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-600 mt-1">Values in % · Gold = top 3 scorelines</p>
      </div>
    </div>
  )
}
