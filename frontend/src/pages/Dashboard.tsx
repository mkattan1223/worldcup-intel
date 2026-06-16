import { useState } from 'react'
import { useMatches } from '../hooks/useMatches'
import { useStandings } from '../hooks/useTeams'
import MatchCard from '../components/MatchCard'
import PlayerStats from '../components/PlayerStats'

type Filter = 'ALL' | 'LIVE' | 'FINISHED' | 'TIMED'

const FILTER_LABELS: Record<Filter, string> = {
  ALL: 'All', LIVE: 'Live', FINISHED: 'Finished', TIMED: 'Upcoming',
}

export default function Dashboard() {
  const [filter, setFilter] = useState<Filter>('ALL')
  const { matches, loading, error, liveCount, finishedCount, totalGoals } = useMatches()
  const { groups, loading: standLoading } = useStandings()

  const displayed = matches.filter(m => {
    if (filter === 'ALL') return true
    if (filter === 'LIVE') return ['LIVE', 'IN_PLAY', 'PAUSED'].includes(m.status)
    if (filter === 'TIMED') return ['TIMED', 'SCHEDULED'].includes(m.status)
    return m.status === filter
  })

  // Group by stage for display
  const byStage = displayed.reduce<Record<string, typeof displayed>>((acc, m) => {
    const k = m.stage
    if (!acc[k]) acc[k] = []
    acc[k].push(m)
    return acc
  }, {})

  const STAGE_ORDER = ['GROUP_STAGE', 'LAST_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL']
  const STAGE_LABELS: Record<string, string> = {
    GROUP_STAGE: 'Group Stage', LAST_32: 'Round of 32', LAST_16: 'Round of 16',
    QUARTER_FINALS: 'Quarter-Finals', SEMI_FINALS: 'Semi-Finals',
    FINAL: 'Final', THIRD_PLACE: 'Third Place',
  }

  const sortedStages = Object.keys(byStage).sort(
    (a, b) => STAGE_ORDER.indexOf(a) - STAGE_ORDER.indexOf(b)
  )

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-900/40 via-slate-800 to-blue-900/40 rounded-2xl p-6 border border-slate-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">
              FIFA World Cup <span className="text-green-400">2026</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              USA · Canada · Mexico · Jun 11 – Jul 19, 2026
            </p>
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
        {/* Match list — takes 2/3 width on xl */}
        <div className="xl:col-span-2 space-y-5">
          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(Object.keys(FILTER_LABELS) as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === f
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
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
              <p className="text-slate-500 mt-2 text-xs">
                Make sure the FastAPI backend is running on localhost:8000 and Supabase tables are created.
              </p>
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
            <div className="text-center text-slate-500 py-12">
              No matches for this filter.
            </div>
          )}
        </div>

        {/* Sidebar — standings + scorers */}
        <div className="space-y-5">
          {/* Group Standings */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h2 className="font-semibold text-white">Group Standings</h2>
            </div>
            {standLoading ? (
              <div className="p-4 text-slate-400 text-sm">Loading…</div>
            ) : Object.keys(groups).length === 0 ? (
              <div className="p-4 text-slate-500 text-sm">
                Standings will appear after group stage matches begin.
              </div>
            ) : (
              <div className="divide-y divide-slate-700/50 max-h-96 overflow-y-auto">
                {Object.entries(groups)
                  .filter(([k]) => k.startsWith('GROUP_') || k.length <= 1)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([group, rows]) => (
                    <div key={group} className="p-3">
                      <p className="text-xs font-bold text-slate-500 mb-2 uppercase">{group}</p>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-slate-600">
                            <th className="text-left w-4">#</th>
                            <th className="text-left">Team</th>
                            <th className="text-center w-5">P</th>
                            <th className="text-center w-5">W</th>
                            <th className="text-center w-5">D</th>
                            <th className="text-center w-5">L</th>
                            <th className="text-center w-6">GD</th>
                            <th className="text-center w-6 text-green-400">Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.sort((a, b) => a.position - b.position).map(s => (
                            <tr key={s.team_id} className="border-t border-slate-700/30">
                              <td className="py-1 text-slate-500">{s.position}</td>
                              <td className="py-1 font-medium text-slate-200 truncate max-w-[80px]">
                                {s.team_tla ?? s.team_name}
                              </td>
                              <td className="py-1 text-center text-slate-400">{s.played}</td>
                              <td className="py-1 text-center text-slate-400">{s.won}</td>
                              <td className="py-1 text-center text-slate-400">{s.draw}</td>
                              <td className="py-1 text-center text-slate-400">{s.lost}</td>
                              <td className={`py-1 text-center ${s.goal_difference > 0 ? 'text-green-400' : s.goal_difference < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                {s.goal_difference > 0 ? `+${s.goal_difference}` : s.goal_difference}
                              </td>
                              <td className="py-1 text-center font-bold text-green-400">{s.points}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Top Scorers */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h2 className="font-semibold text-white">Top Scorers</h2>
            </div>
            <PlayerStats limit={10} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({
  label, value, accent, live,
}: {
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
