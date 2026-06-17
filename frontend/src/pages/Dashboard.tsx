import { useState, type ReactNode } from 'react'
import { useMatches } from '../hooks/useMatches'
import { useStandings } from '../hooks/useTeams'
import MatchCard from '../components/MatchCard'
import PlayerStats from '../components/PlayerStats'
import type { Standing } from '../types'

type Filter = 'ALL' | 'LIVE' | 'FINISHED' | 'TIMED'
type SidePanel = 'standings' | 'bracket'

const FILTER_LABELS: Record<Filter, string> = {
  ALL: 'All', LIVE: 'Live', FINISHED: 'Finished', TIMED: 'Upcoming',
}

const STAGE_ORDER = ['GROUP_STAGE', 'LAST_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL']
const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: 'Group Stage', LAST_32: 'Round of 32', LAST_16: 'Round of 16',
  QUARTER_FINALS: 'Quarter-Finals', SEMI_FINALS: 'Semi-Finals',
  FINAL: 'Final', THIRD_PLACE: 'Third Place',
}

// Color-coding: position 1-2 = advance, 3 = possible 3rd, 4 = eliminated
function rowClass(pos: number): string {
  if (pos === 1) return 'border-l-2 border-emerald-500 bg-emerald-900/10'
  if (pos === 2) return 'border-l-2 border-emerald-600/60 bg-emerald-900/5'
  if (pos === 3) return 'border-l-2 border-amber-600/50 bg-amber-900/5'
  return 'border-l-2 border-transparent'
}

function GroupTable({ group, rows }: { group: string; rows: Standing[] }) {
  const sorted = [...rows].sort((a, b) => a.position - b.position)
  const label = group.replace('GROUP_', 'Group ').replace('_', ' ')
  return (
    <div className="mb-4">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
      <div className="rounded-xl overflow-hidden border border-slate-700/50">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-800/80 text-slate-600 text-center">
              <th className="text-left pl-3 py-1.5 text-slate-500 font-medium w-4">#</th>
              <th className="text-left py-1.5 text-slate-500 font-medium">Team</th>
              <th className="py-1.5 font-medium w-6">P</th>
              <th className="py-1.5 font-medium w-6">W</th>
              <th className="py-1.5 font-medium w-6">D</th>
              <th className="py-1.5 font-medium w-6">L</th>
              <th className="py-1.5 font-medium w-8">GF</th>
              <th className="py-1.5 font-medium w-8">GA</th>
              <th className="py-1.5 font-medium w-8">GD</th>
              <th className="py-1.5 text-emerald-500 font-bold w-8">Pts</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s.team_id} className={`${rowClass(s.position)} border-b border-slate-700/20 last:border-0`}>
                <td className="pl-3 py-1.5 text-slate-500">{s.position}</td>
                <td className="py-1.5 font-medium text-slate-200 max-w-[90px] truncate">
                  {s.team_tla ?? s.team_name.slice(0, 3).toUpperCase()}
                  <span className="hidden sm:inline text-slate-400 font-normal"> {s.team_name}</span>
                </td>
                <td className="py-1.5 text-center text-slate-400">{s.played}</td>
                <td className="py-1.5 text-center text-emerald-400">{s.won}</td>
                <td className="py-1.5 text-center text-slate-400">{s.draw}</td>
                <td className="py-1.5 text-center text-red-400">{s.lost}</td>
                <td className="py-1.5 text-center text-slate-300">{s.goals_for}</td>
                <td className="py-1.5 text-center text-slate-300">{s.goals_against}</td>
                <td className={`py-1.5 text-center font-medium ${
                  s.goal_difference > 0 ? 'text-emerald-400' : s.goal_difference < 0 ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {s.goal_difference > 0 ? `+${s.goal_difference}` : s.goal_difference}
                </td>
                <td className="py-1.5 text-center font-black text-white pr-2">{s.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BracketView() {
  const BOX_H = 44
  const BOX_W = 110
  const CONN = 40
  const ROW_U = 48
  const HDR = 18

  const colX = (r: number) => r * (BOX_W + CONN)
  const midX = (r: number) => colX(r) + BOX_W + CONN / 2

  function getCY(r: number, i: number): number {
    if (r === 0) return HDR + i * ROW_U + BOX_H / 2
    return (getCY(r - 1, i * 2) + getCY(r - 1, i * 2 + 1)) / 2
  }

  const COUNTS = [16, 8, 4, 2, 1]
  const LABELS = ['R32', 'R16', 'QF', 'SF', 'Final']
  const SVG_W = colX(4) + BOX_W
  const SVG_H = HDR + 16 * ROW_U

  const headers: ReactNode[] = LABELS.map((label, r) => (
    <text key={`h${r}`}
      x={colX(r) + BOX_W / 2} y={HDR - 4}
      textAnchor="middle" fill="#475569" fontSize={8} fontWeight="700">
      {label}
    </text>
  ))

  const connectors: ReactNode[] = []
  const boxes: ReactNode[] = []

  COUNTS.forEach((count, r) => {
    for (let i = 0; i < count; i++) {
      const y0 = getCY(r, i)
      const bx = colX(r)
      const by = y0 - BOX_H / 2

      boxes.push(
        <g key={`m${r}-${i}`}>
          <rect x={bx} y={by} width={BOX_W} height={BOX_H}
            rx={4} fill="#0f172a" stroke="#334155" strokeWidth={1} />
          <line x1={bx} y1={y0} x2={bx + BOX_W} y2={y0}
            stroke="#1e293b" strokeWidth={1} />
          <text x={bx + 7} y={y0 - 9}
            fill="#475569" fontSize={8.5} dominantBaseline="middle">TBD</text>
          <text x={bx + 7} y={y0 + 9}
            fill="#475569" fontSize={8.5} dominantBaseline="middle">TBD</text>
        </g>
      )

      if (r < 4) {
        const mx = midX(r)
        connectors.push(
          <line key={`ra-${r}-${i}`}
            x1={bx + BOX_W} y1={y0} x2={mx} y2={y0}
            stroke="#334155" strokeWidth={1} />
        )
        if (i % 2 === 0) {
          const sibY = getCY(r, i + 1)
          const pY  = getCY(r + 1, i >> 1)
          connectors.push(
            <line key={`vc-${r}-${i}`}
              x1={mx} y1={y0} x2={mx} y2={sibY}
              stroke="#334155" strokeWidth={1} />,
            <line key={`la-${r}-${i}`}
              x1={mx} y1={pY} x2={colX(r + 1)} y2={pY}
              stroke="#334155" strokeWidth={1} />
          )
        }
      }
    }
  })

  return (
    <div className="overflow-x-auto">
      <svg width={SVG_W} height={SVG_H} style={{ display: 'block' }}>
        {connectors}
        {boxes}
        {headers}
      </svg>
      <p className="text-xs text-slate-600 mt-1.5 text-center pb-1">
        R32 begins Jun 29 · bracket fills as group stage concludes
      </p>
    </div>
  )
}

export default function Dashboard() {
  const [filter, setFilter] = useState<Filter>('ALL')
  const [sidePanel, setSidePanel] = useState<SidePanel>('standings')
  const { matches, loading, error, liveCount, finishedCount, totalGoals } = useMatches()
  const { groups, loading: standLoading } = useStandings()

  const displayed = matches.filter(m => {
    if (filter === 'ALL') return true
    if (filter === 'LIVE') return ['LIVE', 'IN_PLAY', 'PAUSED'].includes(m.status)
    if (filter === 'TIMED') return ['TIMED', 'SCHEDULED'].includes(m.status)
    return m.status === filter
  })

  const byStage = displayed.reduce<Record<string, typeof displayed>>((acc, m) => {
    const k = m.stage
    if (!acc[k]) acc[k] = []
    acc[k].push(m)
    return acc
  }, {})

  const sortedStages = Object.keys(byStage).sort(
    (a, b) => STAGE_ORDER.indexOf(a) - STAGE_ORDER.indexOf(b)
  )

  const sortedGroups = Object.entries(groups)
    .filter(([k]) => k.startsWith('GROUP_'))
    .sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-900/40 via-slate-800 to-blue-900/40 rounded-2xl p-6 border border-slate-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">
              FIFA World Cup <span className="text-green-400">2026</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">USA · Canada · Mexico · Jun 11 – Jul 19, 2026</p>
          </div>
          <div className="flex gap-4">
            <Stat label="Total Matches" value={matches.length} />
            <Stat label="Finished" value={finishedCount} />
            <Stat label="Goals Scored" value={totalGoals} accent />
            {liveCount > 0 && <Stat label="Live Now" value={liveCount} live />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Match list */}
        <div className="xl:col-span-2 space-y-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(Object.keys(FILTER_LABELS) as Filter[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === f
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}>
                {FILTER_LABELS[f]}
                {f === 'LIVE' && liveCount > 0 && (
                  <span className="ml-1.5 bg-green-400 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {liveCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 bg-slate-800 rounded-xl animate-pulse border border-slate-700" />
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-4 text-red-400 text-sm">
              <p className="font-semibold">Could not load matches</p>
              <p className="text-red-500 mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && sortedStages.map(stage => (
            <div key={stage}>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                {STAGE_LABELS[stage] ?? stage}
              </h2>
              <div className="space-y-2">
                {byStage[stage].map(m => <MatchCard key={m.id} match={m} />)}
              </div>
            </div>
          ))}

          {!loading && !error && displayed.length === 0 && (
            <div className="text-center text-slate-500 py-12">No matches for this filter.</div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Panel switcher */}
          <div className="flex gap-1.5 bg-slate-800 border border-slate-700 rounded-xl p-1">
            {([
              { id: 'standings' as SidePanel, label: 'Standings' },
              { id: 'bracket'  as SidePanel, label: 'Bracket' },
            ]).map(({ id, label }) => (
              <button key={id} onClick={() => setSidePanel(id)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  sidePanel === id
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {sidePanel === 'standings' && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-3">
                <h2 className="font-semibold text-white text-sm flex-1">Group Standings</h2>
                <div className="flex gap-2 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" />Qualify</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-700 inline-block" />3rd</span>
                </div>
              </div>
              {standLoading ? (
                <div className="p-4 text-slate-400 text-sm animate-pulse">Loading…</div>
              ) : sortedGroups.length === 0 ? (
                <div className="p-4 text-slate-500 text-sm text-center">
                  Standings appear after group stage matches begin.
                </div>
              ) : (
                <div className="p-4 max-h-[70vh] overflow-y-auto space-y-1">
                  {sortedGroups.map(([group, rows]) => (
                    <GroupTable key={group} group={group} rows={rows} />
                  ))}
                </div>
              )}
            </div>
          )}

          {sidePanel === 'bracket' && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700">
                <h2 className="font-semibold text-white text-sm">Tournament Bracket</h2>
                <p className="text-xs text-slate-500 mt-0.5">Round of 32 → Final</p>
              </div>
              <div className="p-4">
                <BracketView />
              </div>
            </div>
          )}

          {/* Top Scorers */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h2 className="font-semibold text-white text-sm">Top Scorers</h2>
            </div>
            <PlayerStats limit={10} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, accent, live }: {
  label: string; value: number; accent?: boolean; live?: boolean
}) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-black ${live ? 'text-green-400 animate-pulse' : accent ? 'text-green-400' : 'text-white'}`}>
        {value}
      </div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}
