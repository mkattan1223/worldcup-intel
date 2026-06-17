import { useState, useEffect } from 'react'
import {
  ComposedChart, Line, ReferenceLine, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { api } from '../services/api'
import { getTeamStats } from '../data/teamStats'
import type { ControlChartData } from '../types'

type Metric = 'goals_scored' | 'goals_conceded'

interface Props {
  teamId: number
  teamName: string
  color?: string
}

function OutOfControlDot(props: {
  cx?: number; cy?: number; payload?: { outOfControl: boolean }; color?: string
}) {
  const { cx = 0, cy = 0, payload, color = '#22c55e' } = props
  if (!payload?.outOfControl) return <circle cx={cx} cy={cy} r={4} fill={color} stroke="none" />
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#fca5a5" strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={3} fill="white" />
    </g>
  )
}

export default function SixSigmaChart({ teamId, teamName, color = '#22c55e' }: Props) {
  const [metric, setMetric] = useState<Metric>('goals_scored')
  const [data, setData] = useState<ControlChartData | null>(null)
  const [partialValues, setPartialValues] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setData(null)
    setPartialValues([])
    api.getTeamControlChart(teamId, metric)
      .then((d) => {
        const resp = d as unknown as { error?: string; values?: number[] }
        if (resp.error) {
          setError(resp.error)
          setPartialValues(resp.values ?? [])
        } else {
          setData(d)
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [teamId, metric])

  // Safe derived values — never crash on undefined
  const values = data?.values ?? []
  const movingRanges = data?.moving_ranges ?? []
  const outOfControl = data?.out_of_control ?? []

  const chartData = values.map((v, i) => ({
    match: `M${i + 1}`,
    value: v,
    outOfControl: outOfControl.some(o => o.index === i),
  }))

  const mrCenter = movingRanges.length > 0
    ? movingRanges.reduce((s, v) => s + v, 0) / movingRanges.length
    : 0
  const mrUcl = 3.267 * mrCenter

  return (
    <div className="space-y-4">
      {/* Metric toggle */}
      <div className="flex gap-2">
        {(['goals_scored', 'goals_conceded'] as Metric[]).map(m => (
          <button key={m} onClick={() => setMetric(m)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              metric === m ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
            }`}>
            {m === 'goals_scored' ? 'Goals Scored' : 'Goals Conceded'}
          </button>
        ))}
      </div>

      {loading && <div className="text-slate-400 text-sm py-8 text-center animate-pulse">Loading chart…</div>}

      {error && (() => {
        const stats = getTeamStats(teamName)
        const expectedGoals = (1.3 * Math.pow(stats.attack / 72, 1.3)).toFixed(2)
        const played = partialValues.length
        const needed = Math.max(0, 2 - played)
        return (
          <div className="space-y-3">
            {/* Match progress */}
            <div className="rounded-xl bg-slate-700/30 border border-slate-600/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-300 text-sm font-medium">{teamName}</p>
                <span className="text-xs text-slate-500">{played}/3 group matches</span>
              </div>
              <div className="flex gap-1.5 mb-3">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`flex-1 h-2 rounded-full ${
                    i < played ? 'bg-green-500' : 'bg-slate-600'
                  }`} />
                ))}
              </div>
              <p className="text-xs text-slate-500">
                {needed > 0
                  ? `Need ${needed} more finished match${needed !== 1 ? 'es' : ''} to compute I-MR control limits.`
                  : 'Building control limits…'}
                {played > 0 && (
                  <span className="ml-1">
                    {metric === 'goals_scored' ? 'Goals scored' : 'Goals conceded'} so far:{' '}
                    {partialValues.map(v => v.toFixed(0)).join(', ')}.
                  </span>
                )}
              </p>
            </div>

            {/* Scouting baseline */}
            <div className="rounded-xl bg-slate-700/20 border border-slate-600/30 p-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                2025-26 Scouting Baseline
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="text-slate-500 mb-0.5">Attack</p>
                  <p className="text-emerald-400 font-bold text-base">{stats.attack}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">Defense</p>
                  <p className="text-blue-400 font-bold text-base">{stats.defense}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">Exp. Goals</p>
                  <p className="text-amber-400 font-bold text-base">{expectedGoals}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2 text-center">
                Control chart populates after 2nd WC match is played
              </p>
            </div>
          </div>
        )
      })()}

      {data && !loading && values.length >= 2 && (
        <>
          {/* Control limit summary */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            {[
              { label: 'UCL',    value: (data.ucl ?? 0).toFixed(2),               color: 'text-red-400' },
              { label: 'Mean',   value: (data.center_line ?? 0).toFixed(2),        color: 'text-green-400' },
              { label: 'LCL',   value: Math.max(0, data.lcl ?? 0).toFixed(2),     color: 'text-blue-400' },
              { label: 'σ',      value: (data.sigma ?? 0).toFixed(3),              color: 'text-purple-400' },
            ].map(({ label, value, color: c }) => (
              <div key={label} className="bg-slate-700/40 rounded-lg p-2 text-center">
                <p className="text-slate-500">{label}</p>
                <p className={`font-bold text-sm mt-0.5 ${c}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* I Chart */}
          <div>
            <p className="text-xs text-slate-400 mb-2 font-medium">
              Individual (I) Chart — {teamName}
              {outOfControl.length > 0 && (
                <span className="ml-2 text-red-400">
                  {outOfControl.length} out-of-control point{outOfControl.length > 1 ? 's' : ''}
                </span>
              )}
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="match" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#f8fafc' }}
                  itemStyle={{ color: '#94a3b8' }}
                />
                <ReferenceLine y={data.ucl ?? 0} stroke="#ef4444" strokeDasharray="5 3"
                  label={{ value: 'UCL', position: 'insideTopRight', fill: '#ef4444', fontSize: 10 }} />
                <ReferenceLine y={data.center_line ?? 0} stroke="#22c55e" strokeDasharray="6 2"
                  label={{ value: 'X̄', position: 'insideTopRight', fill: '#22c55e', fontSize: 10 }} />
                <ReferenceLine y={Math.max(0, data.lcl ?? 0)} stroke="#3b82f6" strokeDasharray="5 3"
                  label={{ value: 'LCL', position: 'insideBottomRight', fill: '#3b82f6', fontSize: 10 }} />
                <Line type="linear" dataKey="value" stroke={color} strokeWidth={2} name="Goals"
                  dot={(props) => <OutOfControlDot key={props.index} {...props} color={color} />}
                  activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* MR Chart */}
          {movingRanges.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">Moving Range (MR) Chart</p>
              <ResponsiveContainer width="100%" height={130}>
                <ComposedChart
                  data={movingRanges.map((v, i) => ({ match: `M${i + 2}`, mr: parseFloat(v.toFixed(2)) }))}
                  margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="match" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#f8fafc' }}
                  />
                  <ReferenceLine y={mrUcl} stroke="#ef4444" strokeDasharray="5 3"
                    label={{ value: 'UCL', position: 'insideTopRight', fill: '#ef4444', fontSize: 10 }} />
                  <ReferenceLine y={mrCenter} stroke="#94a3b8" strokeDasharray="6 2"
                    label={{ value: 'MR̄', position: 'insideTopRight', fill: '#94a3b8', fontSize: 10 }} />
                  <Line type="linear" dataKey="mr" stroke="#a855f7" strokeWidth={1.5} name="MR"
                    dot={{ fill: '#a855f7', r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {outOfControl.length > 0 && (
            <div className="bg-red-950/40 border border-red-800/40 rounded-lg p-3 text-xs">
              <p className="text-red-400 font-semibold mb-1">Out-of-Control Signals</p>
              <p className="text-slate-400">
                Matches {outOfControl.map(o => `M${o.index + 1} (${o.value})`).join(', ')} fall
                outside 3-sigma control limits — statistically unusual performance.
              </p>
            </div>
          )}
        </>
      )}

      {!data && !loading && !error && (
        <div className="text-center text-slate-500 text-sm py-8">No data yet.</div>
      )}
    </div>
  )
}
