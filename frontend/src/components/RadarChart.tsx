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
import { getTeamStats } from '../data/teamStats'

interface Props {
  homeTeamName: string
  awayTeamName: string
}

export default function RadarChart({ homeTeamName, awayTeamName }: Props) {
  const home = getTeamStats(homeTeamName)
  const away = getTeamStats(awayTeamName)

  const data = [
    { metric: 'Attack',     [homeTeamName]: home.attack,     [awayTeamName]: away.attack },
    { metric: 'Defence',    [homeTeamName]: home.defense,    [awayTeamName]: away.defense },
    { metric: 'Pressing',   [homeTeamName]: home.pressing,   [awayTeamName]: away.pressing },
    { metric: 'Possession', [homeTeamName]: home.possession, [awayTeamName]: away.possession },
    { metric: 'Pace',       [homeTeamName]: home.pace,       [awayTeamName]: away.pace },
    { metric: 'Set Pieces', [homeTeamName]: home.setPieces,  [awayTeamName]: away.setPieces },
  ]

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

      <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
        {[
          { label: 'Attack',     h: home.attack,     a: away.attack },
          { label: 'Defence',    h: home.defense,    a: away.defense },
          { label: 'Pressing',   h: home.pressing,   a: away.pressing },
          { label: 'Possession', h: home.possession, a: away.possession },
          { label: 'Pace',       h: home.pace,       a: away.pace },
          { label: 'Set Pieces', h: home.setPieces,  a: away.setPieces },
        ].map(({ label, h, a }) => (
          <div key={label} className="bg-slate-700/40 rounded-lg p-2">
            <p className="text-slate-500 text-xs mb-1 text-center">{label}</p>
            <div className="flex justify-between items-center">
              <span className={`font-bold ${h >= a ? 'text-emerald-400' : 'text-slate-400'}`}>{h}</span>
              <span className="text-slate-600 text-xs">vs</span>
              <span className={`font-bold ${a >= h ? 'text-blue-400' : 'text-slate-400'}`}>{a}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-600 mt-3 text-center">
        Scouting ratings based on 2025–26 international form (0–100 scale)
      </p>
    </div>
  )
}
